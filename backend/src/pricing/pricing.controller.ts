import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingDto, UpdatePricingDto } from './dto/pricing.dto';
import { ReorderDto } from '../common/dto/reorder.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Patch('reorder')
  async reorderPricing(@Body() dto: ReorderDto) {
    return await this.pricingService.reorder(dto.orderedIds);
  }

  @Get()
  async getAllPricing() {
    return await this.pricingService.findAll();
  }

  @Get(':id')
  async getPricingById(@Param('id') id: string) {
    return await this.pricingService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPricing(@Body() dto: CreatePricingDto) {
    return await this.pricingService.create(dto);
  }

  @Put(':id')
  async updatePricing(@Param('id') id: string, @Body() dto: UpdatePricingDto) {
    return await this.pricingService.update(id, dto);
  }

  @Delete(':id')
  async deletePricing(@Param('id') id: string) {
    return await this.pricingService.remove(id);
  }
}
