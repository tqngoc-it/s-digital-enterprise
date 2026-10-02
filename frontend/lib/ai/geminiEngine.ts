/**
 * Centralized Gemini AI Engine with Gemini 3.5 & 3.1 Flash Lite & Auto-Failover
 * 
 * 1. Primary Model: gemini-3.5-flash-lite (Tối ưu tốc độ cao, xử lý đa luồng)
 * 2. Secondary/Backup Model: gemini-3.1-flash-lite (Dự phòng tải cao, tính toán đơn giản)
 */

export const GEMINI_MODELS = [
  'gemini-3.5-flash-lite', // Primary: Phân tích nhu cầu, Chatbot 24/7, Lead scoring
  'gemini-3.1-flash-lite', // Secondary/Backup: Dự phòng tải cao
] as const;

export const GEMINI_FAILOVER_MODELS = GEMINI_MODELS;

export type GeminiModelName = (typeof GEMINI_MODELS)[number];

export function sanitizeModel(model: string): string {
  return model ? model.replace(/^models\//, '').trim() : '';
}

export interface GeminiEngineOptions {
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

export interface GeminiEngineResult {
  text: string;
  model: GeminiModelName;
}

export async function callGeminiFailover(
  options: GeminiEngineOptions
): Promise<GeminiEngineResult | null> {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';
  const apiKey = rawKey.trim();

  if (!apiKey) {
    console.warn('[GeminiService] Chưa cấu hình GEMINI_API_KEY, kích hoạt Fallback an toàn.');
    return null;
  }

  const timeoutMs = options.timeoutMs || 20000;

  // Chuẩn bị contents
  const contents =
    options.contents ||
    (options.prompt ? [{ role: 'user', parts: [{ text: options.prompt }] }] : []);

  if (contents.length === 0) {
    console.warn('[GeminiService] Yêu cầu nội dung trống.');
    return null;
  }

  const payload: Record<string, any> = {
    contents,
    generationConfig: {
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
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

  // Chuỗi Auto-Failover qua các tầng Model với Retry
  for (const rawModel of targetModels) {
    const cleanModel = sanitizeModel(rawModel);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        if (attempt > 0) {
          console.warn(
            `[GeminiService] Thử lại model ${cleanModel} (lần ${attempt + 1}/${maxRetriesPerModel + 1}) sau ${retryDelayMs}ms...`
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

        // Bắt lỗi 503 (High Demand / Service Unavailable) hoặc 429 (Rate Limit)
        if (response.status === 503 || response.status === 429) {
          console.warn(
            `[GeminiService] Model ${cleanModel} bận (${response.status}) ở lần thử ${attempt + 1}`
          );
          if (attempt < maxRetriesPerModel) {
            continue;
          }
          console.warn(
            `[GeminiService] Model ${cleanModel} hết lượt thử lại (${response.status}), failing over sang model kế tiếp...`
          );
          break;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.warn(
            `[GeminiService] Model ${cleanModel} returned error [${response.status}]: ${errorText}, failing over...`
          );
          break;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text && typeof text === 'string') {
          return { text: text.trim(), model: cleanModel as GeminiModelName };
        }

        console.warn(`[GeminiService] Model ${cleanModel} returned empty content, failing over...`);
        break;
      } catch (err: any) {
        console.warn(
          `[GeminiService] Model ${cleanModel} error or timeout (${err?.message || err}) ở lần thử ${attempt + 1}`
        );
        if (attempt < maxRetriesPerModel) {
          continue;
        }
      }
    }
  }

  console.warn(
    `[GeminiService] Toàn bộ ${targetModels.length} models đều không khả dụng. Chuyển sang fallback an toàn.`
  );
  return null;
}
