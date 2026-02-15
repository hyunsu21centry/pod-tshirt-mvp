import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('parses webhook payload without stripe secret', () => {
    const service = new OrdersService({} as any);
    const event = service.verifyStripeEvent(undefined, JSON.stringify({ type: 'checkout.session.completed' }));
    expect(event.type).toBe('checkout.session.completed');
  });

  it('creates order item and production job on checkout completion', async () => {
    const prisma: any = {
      order: { update: jest.fn().mockResolvedValue({ id: 'o1', subtotal: 20 }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'p1' }) },
      orderItem: { create: jest.fn().mockResolvedValue({ id: 'i1' }) },
      productionJob: { create: jest.fn().mockResolvedValue({ id: 'j1' }) },
    };

    const service = new OrdersService(prisma);
    jest.spyOn(service, 'generateJobTicket').mockResolvedValue('/storage/jobs/i1.pdf');

    await service.handleCheckoutCompleted({
      metadata: {
        orderId: 'o1',
        designId: 'd1',
        variantId: 'v1',
        qty: '1',
        printPlacement: 'front',
        printWidthMm: '200',
        printHeightMm: '300',
      },
    } as any);

    expect(prisma.orderItem.create).toHaveBeenCalled();
    expect(prisma.productionJob.create).toHaveBeenCalled();
  });
});
