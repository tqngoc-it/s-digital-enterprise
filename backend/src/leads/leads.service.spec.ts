import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: SupabaseService,
          useValue: {
            client: {
              from: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should score lead using smart fallback when no api key', async () => {
    const res = await service.scoreLead({
      name: 'Nguyen Van A',
      email: 'a@congty.vn',
      phone: '0901234567',
      company: 'Cong Ty ABC',
      service: 'Tổ chức giải marathon',
      budget: 'Trên 100 triệu',
      message: 'Chúng tôi muốn tổ chức giải chạy chuyên nghiệp quy mô 5000 người',
    });

    expect(res.success).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(75);
    expect(res.tier).toBe('HOT');
  });
});
