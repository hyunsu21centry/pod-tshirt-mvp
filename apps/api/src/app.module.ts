import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { DesignsModule } from './designs/designs.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ProducerModule } from './producer/producer.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'storage'), serveRoot: '/storage' }),
    AuthModule,
    DesignsModule,
    ProductsModule,
    OrdersModule,
    ProducerModule,
    AdminModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
