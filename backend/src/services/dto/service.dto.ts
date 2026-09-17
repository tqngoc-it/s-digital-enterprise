import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề dịch vụ là bắt buộc' })
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  sub_title?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsOptional()
  bullet_points?: string[] | string;

  @IsString()
  @IsOptional()
  category?: 'DIGITAL' | 'SPORTS';

  @IsNumber()
  @IsOptional()
  display_order?: number;

  @IsString()
  @IsOptional()
  icon_name?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  sub_title?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsOptional()
  bullet_points?: string[] | string;

  @IsString()
  @IsOptional()
  category?: 'DIGITAL' | 'SPORTS';

  @IsNumber()
  @IsOptional()
  display_order?: number;

  @IsString()
  @IsOptional()
  icon_name?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
