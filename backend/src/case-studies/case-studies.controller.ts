import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CaseStudiesService } from './case-studies.service';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from './dto/case-study.dto';

@Controller('case-studies')
export class CaseStudiesController {
  constructor(private readonly caseStudiesService: CaseStudiesService) {}

  @Get()
  async getAllCaseStudies() {
    return await this.caseStudiesService.findAll();
  }

  @Get(':id')
  async getCaseStudyById(@Param('id') id: string) {
    return await this.caseStudiesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCaseStudy(@Body() dto: CreateCaseStudyDto) {
    return await this.caseStudiesService.create(dto);
  }

  @Put(':id')
  async updateCaseStudy(@Param('id') id: string, @Body() dto: UpdateCaseStudyDto) {
    return await this.caseStudiesService.update(id, dto);
  }

  @Delete(':id')
  async deleteCaseStudy(@Param('id') id: string) {
    return await this.caseStudiesService.remove(id);
  }
}
