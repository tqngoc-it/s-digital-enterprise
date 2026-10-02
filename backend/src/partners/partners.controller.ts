import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { ReorderDto } from '../common/dto/reorder.dto';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Patch('reorder')
  async reorderPartners(@Body() dto: ReorderDto) {
    return await this.partnersService.reorder(dto.orderedIds);
  }

  @Get()
  async getAllPartners(@Query('type') type?: string) {
    return await this.partnersService.findAll(type);
  }

  @Get(':id')
  async getPartnerById(@Param('id') id: string) {
    return await this.partnersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPartner(@Body() dto: CreatePartnerDto) {
    return await this.partnersService.create(dto);
  }

  @Put(':id')
  async updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return await this.partnersService.update(id, dto);
  }

  @Delete(':id')
  async deletePartner(@Param('id') id: string) {
    return await this.partnersService.remove(id);
  }
}
