import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  company_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung liên hệ không được để trống' })
  message!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLeadStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status!: string;
}