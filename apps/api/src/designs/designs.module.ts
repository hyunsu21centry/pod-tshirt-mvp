import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DesignsController } from './designs.controller';

@Module({ controllers: [DesignsController], providers: [PrismaService] })
export class DesignsModule {}
