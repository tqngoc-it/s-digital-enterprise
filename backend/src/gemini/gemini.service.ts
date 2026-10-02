import { Injectable, Logger } from '@nestjs/common';

export interface GeminiContentOptions {
  model?: string;
  systemInstruction?: string;
  prompt?: string;
  contents?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  timeoutMs?: number;
}

export interface GeminiResponse {
  text: string;
  model: string;
}

export const GEMINI_MODELS = [
  'gemini-3.5-flash-lite', // Primary: Phân tích nhu cầu, Chatbot 24/7, Lead scoring
  'gemini-3.1-flash-lite', // Secondary/Backup: Dự phòng tải cao
] as const;

export const GEMINI_FAILOVER_MODELS = GEMINI_MODELS;

export type GeminiModelName = (typeof GEMINI_MODELS)[number];

export function sanitizeModel(model: string): string {
  return model ? model.replace(/^models\//, '').trim() : '';
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  private getApiKey(): string | null {
    const rawKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';
    const cleanApiKey = rawKey.trim();
    return cleanApiKey || null;
  }

  /**
   * Gọi Gemini AI với cơ chế Retry & Auto-Failover:
   * 1. Primary Model: gemini-3.5-flash-lite (Tối ưu tốc độ cao, xử lý đa luồng)
   * 2. Secondary/Backup Model: gemini-3.1-flash-lite (Dự phòng tải cao, tính toán đơn giản)
   */
  async generateContent(options: GeminiContentOptions): Promise<GeminiResponse | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn('[GeminiService] Chưa cấu hình GEMINI_API_KEY, chuyển sang fallback nghiệp vụ');
      return null;
    }

    const timeoutMs = options.timeoutMs || 25000;

    // Chuẩn bị payload
    const contents = options.contents || (options.prompt ? [{ role: 'user', parts: [{ text: options.prompt }] }] : []);
    if (contents.length === 0) {
      this.logger.warn('[GeminiService] Nội dung yêu cầu (contents/prompt) trống');
      return null;
    }

    const payload: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: options.temperature !== undefined ? options.temperature : 0.2,
        maxOutputTokens: options.maxOutputTokens || 600,
      },
    };

    if (options.systemInstruction) {
      payload.system_instruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    if (options.responseMimeType) {
      payload.generationConfig.responseMimeType = options.responseMimeType;
    }

    const targetModels: readonly string[] = options.model
      ? [
          sanitizeModel(options.model),
          ...GEMINI_MODELS.filter((m) => m !== sanitizeModel(options.model!)),
        ]
      : GEMINI_MODELS;

    const maxRetriesPerModel = 1;
    const retryDelayMs = 1000;

    // Vòng lặp Failover qua danh sách Model với Retry
    for (const rawModel of targetModels) {
      const cleanModel = sanitizeModel(rawModel);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

      for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
        try {
          if (attempt > 0) {
            this.logger.warn(
              `[GeminiService] Đang thử lại model ${cleanModel} (lần ${attempt + 1}/${maxRetriesPerModel + 1}) sau ${retryDelayMs}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(timeoutMs),
          });

          // Bắt lỗi 503 (High Demand) hoặc 429 (Rate Limit) -> Thử lại hoặc chuyển model kế tiếp
          if (response.status === 503 || response.status === 429) {
            this.logger.warn(
              `[GeminiService] Model ${cleanModel} busy (${response.status}) ở lần thử ${attempt + 1}`,
            );
            if (attempt < maxRetriesPerModel) {
              continue;
            }
            this.logger.warn(
              `[GeminiService] Model ${cleanModel} hết lượt thử lại (${response.status}), failing over to next model...`,
            );
            break;
          }

          if (!response.ok) {
            const errText = await response.text().catch(() => '');
            this.logger.warn(
              `[GeminiService] Model ${cleanModel} trả mã lỗi [${response.status}]: ${errText}, failing over to next model...`,
            );
            break;
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text && typeof text === 'string') {
            this.logger.log(`[GeminiService] Phản hồi thành công từ model: ${cleanModel}`);
            return { text: text.trim(), model: cleanModel };
          }

          this.logger.warn(`[GeminiService] Model ${cleanModel} trả về dữ liệu rỗng, failing over to next model...`);
          break;
        } catch (err: any) {
          this.logger.warn(
            `[GeminiService] Lỗi kết nối hoặc timeout tới model ${cleanModel} (${err?.message || err}) ở lần thử ${attempt + 1}`,
          );
          if (attempt < maxRetriesPerModel) {
            continue;
          }
        }
      }
    }

    this.logger.warn(
      `[GeminiService] Toàn bộ ${targetModels.length} models đều không khả dụng. Kích hoạt fallback an toàn.`,
    );
    return null;
  }
}
