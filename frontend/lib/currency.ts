/**
 * Tiện ích chuẩn hóa và phân tích dữ liệu tiền tệ tiếng Việt cho S-Digital Enterprise Platform.
 * Hỗ trợ các kiểu gõ dân dã của người dùng: "45tr", "45 triệu", "45 tr/tháng", "1.5 tỷ", "45.000.000",...
 */

export interface ParsedCurrency {
  numericValue: number;
  formattedDisplay: string;
}

export function parseVietnameseCurrency(input?: string): ParsedCurrency {
  if (!input) {
    return {
      numericValue: Number.MAX_SAFE_INTEGER,
      formattedDisplay: 'Liên Hệ Báo Giá',
    };
  }

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Kiểm tra các gói may đo / liên hệ
  if (
    lower.includes('liên hệ') ||
    lower.includes('lien he') ||
    lower.includes('thỏa thuận') ||
    lower.includes('thoa thuan') ||
    lower.includes('enterprise') ||
    lower.includes('custom') ||
    lower.includes('báo giá riêng')
  ) {
    return {
      numericValue: Number.MAX_SAFE_INTEGER,
      formattedDisplay: 'Liên Hệ Báo Giá',
    };
  }

  // 2. Parse dạng "Tỷ" (billions): ví dụ "1.5 tỷ", "2ty", "1,5 tỷ/năm"
  const tyMatch = lower.match(/([\d.,]+)\s*(tỷ|ty|tỉ|billion)/i);
  if (tyMatch) {
    const rawNum = parseFloat(tyMatch[1].replace(/,/g, '.'));
    if (!isNaN(rawNum)) {
      const numVal = Math.round(rawNum * 1_000_000_000);
      const isYear = lower.includes('/năm') || lower.includes('/nam');
      return {
        numericValue: numVal,
        formattedDisplay: `Từ ${rawNum.toLocaleString('vi-VN')} Tỷ${isYear ? '/năm' : '/tháng'}`,
      };
    }
  }

  // 3. Parse dạng "Triệu" / "tr" / "m": ví dụ "45tr", "45 triệu", "45 tr/tháng", "45m"
  const trMatch = lower.match(/([\d.,]+)\s*(triệu|trieu|tr|m)(?:\s*\/\s*(tháng|thang|m))?/i);
  if (trMatch) {
    const rawNum = parseFloat(trMatch[1].replace(/,/g, '.'));
    if (!isNaN(rawNum)) {
      const numVal = Math.round(rawNum * 1_000_000);
      return {
        numericValue: numVal,
        formattedDisplay: `Từ ${rawNum.toLocaleString('vi-VN')} Triệu/tháng`,
      };
    }
  }

  // 4. Parse số thuần có dấu chấm hoặc phẩy phân cách: ví dụ "45.000.000", "45,000,000", "45000000"
  const cleanDigits = lower.replace(/[^\d]/g, '');
  if (cleanDigits) {
    const num = parseInt(cleanDigits, 10);
    if (!isNaN(num)) {
      // Nếu người dùng nhập số nhỏ < 1000 (ví dụ "45" hoặc "35"), quy ước là triệu đồng
      if (num < 1000) {
        return {
          numericValue: num * 1_000_000,
          formattedDisplay: `Từ ${num} Triệu/tháng`,
        };
      }
      const millionVal = num / 1_000_000;
      if (num % 1_000_000 === 0) {
        return {
          numericValue: num,
          formattedDisplay: `Từ ${millionVal} Triệu/tháng`,
        };
      }
      return {
        numericValue: num,
        formattedDisplay: `${num.toLocaleString('vi-VN')} VNĐ/tháng`,
      };
    }
  }

  // 5. Nếu chuỗi đã được chuẩn hóa từ trước (e.g. "Từ 15 Triệu/tháng")
  if (lower.startsWith('từ ')) {
    return {
      numericValue: extractSimpleDigits(lower),
      formattedDisplay: trimmed,
    };
  }

  return {
    numericValue: Number.MAX_SAFE_INTEGER,
    formattedDisplay: trimmed,
  };
}

function extractSimpleDigits(text: string): number {
  const match = text.match(/\d+/);
  if (match) {
    const n = parseInt(match[0], 10);
    return n < 1000 ? n * 1_000_000 : n;
  }
  return Number.MAX_SAFE_INTEGER;
}
