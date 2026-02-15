import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { PrismaService } from '../common/prisma.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('orders')
  orders() {
    return this.prisma.order.findMany({ include: { items: { include: { productionJob: true } } }, orderBy: { createdAt: 'desc' } });
  }

  @Get('orders/:id')
  order(@Param('id') id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { design: true, variant: true, productionJob: true } } },
    });
  }

  @Get('jobs')
  jobs() {
    return this.prisma.productionJob.findMany({
      include: { producer: true, orderItem: { include: { order: true, variant: { include: { productBase: true } } } } },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
