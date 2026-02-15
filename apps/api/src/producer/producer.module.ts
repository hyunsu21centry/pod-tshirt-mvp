import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ProducerController } from './producer.controller';

@Module({ controllers: [ProducerController], providers: [PrismaService] })
export class ProducerModule {}
