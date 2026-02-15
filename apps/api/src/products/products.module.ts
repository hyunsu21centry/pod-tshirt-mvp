import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ProductsController } from './products.controller';

@Module({ controllers: [ProductsController], providers: [PrismaService] })
export class ProductsModule {}
