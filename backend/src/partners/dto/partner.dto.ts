import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đối tác / khách hàng là bắt buộc' })
  name!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  website_url?: string;

  @IsNumber()
  @IsOptional()
  display_order?: number;
}

export class UpdatePartnerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  website_url?: string;

  @IsNumber()
  @IsOptional()
  display_order?: number;
}
