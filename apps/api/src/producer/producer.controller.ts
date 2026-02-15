import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Request } from 'express';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { PrismaService } from '../common/prisma.service';

class UpdateJobDto {
  @IsIn(['RECEIVED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED'])
  status!: 'RECEIVED' | 'IN_PRODUCTION' | 'PACKED' | 'SHIPPED';

  @IsOptional()
  @IsString()
  trackingCarrier?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

@ApiTags('producer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PRODUCER')
@Controller('producer')
export class ProducerController {
  constructor(private prisma: PrismaService) {}

  @Get('jobs')
  jobs(@Req() req: Request & { user: { sub: string } }) {
    return this.prisma.productionJob.findMany({ where: { producerId: req.user.sub }, include: { orderItem: true } });
  }

  @Get('jobs/:id')
  job(@Req() req: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.prisma.productionJob.findFirst({
      where: { id, producerId: req.user.sub },
      include: { orderItem: { include: { design: true, variant: { include: { productBase: true } }, order: true } } },
    });
  }

  @Patch('jobs/:id')
  async update(@Req() req: Request & { user: { sub: string } }, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    const existing = await this.prisma.productionJob.findFirstOrThrow({ where: { id, producerId: req.user.sub } });
    const job = await this.prisma.productionJob.update({
      where: { id: existing.id },
      data: { status: dto.status, trackingCarrier: dto.trackingCarrier, trackingNumber: dto.trackingNumber },
    });
    console.log(`Email notification stub: Job ${id} -> ${dto.status}`);
    return job;
  }
}
