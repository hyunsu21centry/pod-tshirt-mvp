import { Injectable } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { createWriteStream } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import Stripe from 'stripe';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OrdersService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(payload: {
    email: string;
    designId: string;
    variantId: string;
    qty: number;
    printPlacement: string;
    printWidthMm: number;
    printHeightMm: number;
  }) {
    const variant = await this.prisma.variant.findUnique({ where: { id: payload.variantId }, include: { productBase: true } });
    if (!variant) throw new Error('Variant not found');
    const unitPrice = Number(variant.productBase.basePrice) + Number(variant.priceDelta);
    const subtotal = unitPrice * payload.qty;
    const shippingFee = subtotal >= 50 ? 0 : 5;
    const total = subtotal + shippingFee;

    const order = await this.prisma.order.create({
      data: {
        email: payload.email,
        currency: process.env.DEFAULT_CURRENCY || 'usd',
        subtotal,
        shippingFee,
        total,
        status: 'PENDING',
      },
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      return { checkoutUrl: `${process.env.STRIPE_SUCCESS_URL?.replace('{CHECKOUT_SESSION_ID}', 'mock-session') || 'http://localhost:3000/order/success'}`, orderId: order.id };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: payload.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${variant.productBase.name} (${variant.color}/${variant.size})` },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: payload.qty,
        },
      ],
      metadata: {
        orderId: order.id,
        designId: payload.designId,
        variantId: payload.variantId,
        qty: String(payload.qty),
        printPlacement: payload.printPlacement,
        printWidthMm: String(payload.printWidthMm),
        printHeightMm: String(payload.printHeightMm),
      },
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    await this.prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return { checkoutUrl: session.url, orderId: order.id };
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    const order = await this.prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
    const producer = await this.prisma.user.findFirst({ where: { role: 'PRODUCER', email: process.env.DEFAULT_PRODUCER_EMAIL || undefined } })
      ?? await this.prisma.user.findFirst({ where: { role: 'PRODUCER' } });

    if (!producer) throw new Error('No producer configured');

    const item = await this.prisma.orderItem.create({
      data: {
        orderId: order.id,
        designId: session.metadata!.designId,
        variantId: session.metadata!.variantId,
        qty: Number(session.metadata!.qty),
        unitPrice: Number(order.subtotal) / Number(session.metadata!.qty),
        printPlacement: session.metadata!.printPlacement,
        printWidthMm: Number(session.metadata!.printWidthMm),
        printHeightMm: Number(session.metadata!.printHeightMm),
      },
      include: { design: true, variant: { include: { productBase: true } }, order: true },
    });

    const pdfUrl = await this.generateJobTicket(item.id);

    const job = await this.prisma.productionJob.create({
      data: {
        orderItemId: item.id,
        producerId: producer.id,
        status: 'RECEIVED',
        jobTicketPdfUrl: pdfUrl,
      },
    });

    console.log('Production job created', job.id);
  }

  async generateJobTicket(orderItemId: string) {
    const item = await this.prisma.orderItem.findUniqueOrThrow({
      where: { id: orderItemId },
      include: { order: true, design: true, variant: { include: { productBase: true } } },
    });

    const dir = join(process.cwd(), 'storage', 'jobs');
    mkdirSync(dir, { recursive: true });
    const fileName = `${orderItemId}.pdf`;
    const filePath = join(dir, fileName);

    await new Promise<void>((resolve) => {
      const doc = new PDFDocument();
      doc.pipe(createWriteStream(filePath));
      doc.fontSize(18).text('Production Job Ticket');
      doc.moveDown();
      doc.text(`Order: ${item.orderId}`);
      doc.text(`Product: ${item.variant.productBase.name}`);
      doc.text(`Option: ${item.variant.color}/${item.variant.size}`);
      doc.text(`Qty: ${item.qty}`);
      doc.text(`Print: ${item.printPlacement} ${item.printWidthMm}x${item.printHeightMm}mm`);
      doc.text(`Print file: ${item.design.printFileUrl}`);
      doc.text(`Customer email: ${item.order.email}`);
      doc.end();
      doc.on('finish', () => resolve());
    });

    return `/storage/jobs/${fileName}`;
  }

  verifyStripeEvent(signature: string | undefined, payload: Buffer | string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !process.env.STRIPE_SECRET_KEY) {
      return typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString());
    }
    return this.stripe.webhooks.constructEvent(payload, signature!, secret);
  }

  async trackOrder(orderId: string, email: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, email },
      include: {
        items: {
          include: {
            design: true,
            variant: { include: { productBase: true } },
            productionJob: true,
          },
        },
      },
    });
  }
}
