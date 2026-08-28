import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLead(@Body() dto: CreateLeadDto) {
    return await this.leadsService.create(dto);
  }

  @Get()
  async getAllLeads() {
    return await this.leadsService.findAll();
  }
}