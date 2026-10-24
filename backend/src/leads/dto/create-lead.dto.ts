import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLeadDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Tên không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  full_name?: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Địa chỉ email không đúng định dạng' })
  @MaxLength(150, { message: 'Email không được vượt quá 150 ký tự' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Địa chỉ email không hợp lệ (VD: ten@congty.com)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
  @ValidateIf((o) => o.phone && String(o.phone).trim() !== '')
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678 hoặc 84912345678)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Dịch vụ quan tâm không được vượt quá 200 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  service?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Ngành nghề không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  industry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Quy mô công ty không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  company_size?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Mức ngân sách không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  budget?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Thời hạn triển khai không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  timeline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Tên công ty không được vượt quá 150 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  company?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Tên công ty không được vượt quá 150 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  company_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung liên hệ không được để trống' })
  @MaxLength(3000, { message: 'Nội dung liên hệ không được vượt quá 3000 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message!: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000, { message: 'Ghi chú không được vượt quá 3000 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  notes?: string;
}

export class UpdateLeadStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @MaxLength(50, { message: 'Trạng thái không được vượt quá 50 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  status!: string;
}