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
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Controller(['blogs', 'posts'])
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async getAllBlogs() {
    return await this.blogsService.findAll();
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() dto: CreateBlogDto) {
    return await this.blogsService.create(dto);
  }

  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return await this.blogsService.update(id, dto);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return await this.blogsService.remove(id);
  }
}
