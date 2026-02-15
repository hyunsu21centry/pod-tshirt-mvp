import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';

class ProductDto {
  @IsString()
  name!: string;
  @IsNumber()
  basePrice!: number;
}

class VariantDto {
  @IsString()
  productBaseId!: string;
  @IsString()
  color!: string;
  @IsString()
  size!: string;
  @IsNumber()
  priceDelta!: number;
  @IsString()
  sku!: string;
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private prisma: PrismaService) {}

  @Get('bases')
  listBases() {
    return this.prisma.productBase.findMany({ include: { variants: true } });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('bases')
  createBase(@Body() dto: ProductDto) {
    return this.prisma.productBase.create({ data: dto });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('bases/:id')
  updateBase(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.prisma.productBase.update({ where: { id }, data: dto });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('bases/:id')
  deleteBase(@Param('id') id: string) {
    return this.prisma.productBase.delete({ where: { id } });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('variants')
  createVariant(@Body() dto: VariantDto) {
    return this.prisma.variant.create({ data: dto });
  }
}
