import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePricingDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên gói dịch vụ là bắt buộc' })
  tier_name!: string;

  @IsString()
  @IsOptional()
  target_audience?: string;

  @IsString()
  @IsNotEmpty({ message: 'Mức giá hiển thị là bắt buộc' })
  price_display!: string;

  @IsOptional()
  features?: string[] | string;
}

export class UpdatePricingDto {
  @IsString()
  @IsOptional()
  tier_name?: string;

  @IsString()
  @IsOptional()
  target_audience?: string;

  @IsString()
  @IsOptional()
  price_display?: string;

  @IsOptional()
  features?: string[] | string;
}
