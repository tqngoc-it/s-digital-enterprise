import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

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

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Địa chỉ email không đúng định dạng' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Địa chỉ email không hợp lệ (VD: ten@congty.com)',
  })
  email!: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.phone && String(o.phone).trim() !== '')
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678 hoặc 84912345678)',
  })
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