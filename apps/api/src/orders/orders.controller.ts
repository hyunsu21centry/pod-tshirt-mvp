import { Body, Controller, Get, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString, Min } from 'class-validator';
import { Request } from 'express';
import { OrdersService } from './orders.service';

class CreateCheckoutDto {
  @IsEmail()
  email!: string;
  @IsString()
  designId!: string;
  @IsString()
  variantId!: string;
  @IsInt()
  @Min(1)
  qty!: number;
  @IsString()
  printPlacement!: string;
  @IsInt()
  printWidthMm!: number;
  @IsInt()
  printHeightMm!: number;
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post('checkout-session')
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.service.createCheckoutSession(dto);
  }

  @Post('webhooks/stripe')
  async stripeWebhook(@Req() req: Request, @Headers('stripe-signature') signature?: string) {
    const body = (req as Request & { rawBody?: Buffer }).rawBody ?? JSON.stringify(req.body);
    const event = this.service.verifyStripeEvent(signature, body);
    if (event.type === 'checkout.session.completed') {
      await this.service.handleCheckoutCompleted(event.data.object);
    }
    return { received: true };
  }

  @Get(':id/track')
  track(@Param('id') id: string, @Query('email') email: string) {
    return this.service.trackOrder(id, email);
  }
}
