import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/create-lead.dto';
import { ScoreLeadDto } from './dto/score-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Pipeline tiếp nhận lead: lưu DB -> thẩm định AI tự động -> cập nhật DB -> trả về kết quả
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLead(@Body() dto: CreateLeadDto) {
    return await this.leadsService.create(dto);
  }

  /**
   * Lấy toàn bộ danh sách leads cho Admin, sắp xếp theo ngày gửi mới nhất
   */
  @Get()
  async getAllLeads() {
    return await this.leadsService.findAll();
  }

  /**
   * Lấy chi tiết một lead theo ID
   */
  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    return await this.leadsService.findOne(id);
  }

  /**
   * Cập nhật trạng thái xử lý Lead (NEW, CONTACTED, QUALIFIED, CLOSED, REJECTED)
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return await this.leadsService.updateStatus(id, dto.status);
  }

  /**
   * Kích hoạt thẩm định lại Lead bằng AI và cập nhật trực tiếp vào cơ sở dữ liệu
   */
  @Post(':id/rescore')
  @HttpCode(HttpStatus.OK)
  async rescoreLead(@Param('id') id: string) {
    return await this.leadsService.rescore(id);
  }

  /**
   * Xóa Lead khỏi hệ thống
   */
  @Delete(':id')
  async deleteLead(@Param('id') id: string) {
    return await this.leadsService.remove(id);
  }

  /**
   * Endpoint chấm điểm nhanh độc lập
   */
  @Post('score')
  @HttpCode(HttpStatus.OK)
  async scoreLead(@Body() dto: ScoreLeadDto) {
    return await this.leadsService.scoreLead(dto);
  }
}