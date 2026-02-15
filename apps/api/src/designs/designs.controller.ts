import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';

class UpsertDesignDto {
  @IsString()
  name!: string;
  @IsUrl({ require_tld: false })
  imageUrl!: string;
  @IsUrl({ require_tld: false })
  printFileUrl!: string;
}

@ApiTags('designs')
@Controller('designs')
export class DesignsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.design.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: UpsertDesignDto) {
    return this.prisma.design.create({ data: dto });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertDesignDto) {
    return this.prisma.design.update({ where: { id }, data: dto });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.design.delete({ where: { id } });
  }
}
