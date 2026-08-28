import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(5, { message: 'Nội dung liên hệ tối thiểu 5 ký tự' })
  message!: string;
}