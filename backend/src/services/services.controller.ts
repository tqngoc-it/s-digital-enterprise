import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getAllServices(@Query('category') category?: string) {
    return await this.servicesService.findAll(category);
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return await this.servicesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createService(@Body() dto: CreateServiceDto) {
    return await this.servicesService.create(dto);
  }

  @Put(':id')
  async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return await this.servicesService.update(id, dto);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return await this.servicesService.remove(id);
  }
}
