import { IsOptional, IsString } from 'class-validator';

export class ScoreLeadDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  email?: string;

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
  message?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  company_name?: string;
}

export interface ScoreLeadResponse {
  score: number;
  tier: 'HOT' | 'WARM' | 'COLD';
  summary: string;
  actionPlan: string;
  estimatedValue: string;
}
