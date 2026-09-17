import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCaseStudyDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề dự án là bắt buộc' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên khách hàng là bắt buộc' })
  client_name!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  challenge?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsOptional()
  results?: any;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;
}

export class UpdateCaseStudyDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  client_name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  challenge?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsOptional()
  results?: any;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;
}
