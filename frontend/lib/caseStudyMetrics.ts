export interface CaseStudyMetric {
  label: string;
  value: string;
  sub?: string;
}

/**
 * Hàm phân tích chỉ số dự án (Case Study Metrics) linh hoạt:
 * Hỗ trợ cấu trúc mảng mới `results.metrics`, cấu trúc `metric_1/2/3`,
 * cấu trúc cũ `athletes/articles/views`, và fallback an toàn tuyệt đối.
 */
export function parseCaseStudyMetrics(results: any): CaseStudyMetric[] {
  if (!results) {
    return [
      { label: 'Quy mô', value: '5.2K+', sub: 'Quy mô triển khai' },
      { label: 'Báo chí PR', value: '50+ Bài', sub: 'Độ phủ truyền thông' },
      { label: 'Lượt xem MXH', value: '2M Lượt', sub: 'Lan tỏa đa nền tảng' },
    ];
  }

  // 1. Cấu trúc chuẩn mới: results.metrics = [{ label, value, sub? }, ...]
  if (Array.isArray(results.metrics) && results.metrics.length > 0) {
    const parsed = results.metrics
      .filter((m: any) => m && typeof m === 'object')
      .map((m: any, idx: number) => ({
        label: String(m.label || `Chỉ số ${idx + 1}`).trim(),
        value: String(m.value || '-').trim(),
        sub: m.sub ? String(m.sub).trim() : undefined,
      }));

    if (parsed.length >= 3) {
      return parsed.slice(0, 3);
    }

    // Nếu ít hơn 3 chỉ số, bổ sung fallback
    const defaults = [
      { label: 'Quy mô', value: '5.2K+' },
      { label: 'Báo chí PR', value: '50+ Bài' },
      { label: 'Lượt xem MXH', value: '2M Lượt' },
    ];
    while (parsed.length < 3) {
      parsed.push(defaults[parsed.length]);
    }
    return parsed;
  }

  // 2. Cấu trúc results.metric_1, results.metric_2, results.metric_3
  if (results.metric_1 || results.metric_2 || results.metric_3) {
    const list: CaseStudyMetric[] = [];
    if (results.metric_1?.value || results.metric_1?.label) {
      list.push({
        label: results.metric_1.label || 'Chỉ số 1',
        value: results.metric_1.value || '-',
        sub: 'Tham gia & hưởng ứng',
      });
    }
    if (results.metric_2?.value || results.metric_2?.label) {
      list.push({
        label: results.metric_2.label || 'Chỉ số 2',
        value: results.metric_2.value || '-',
        sub: 'Lan tỏa truyền thông',
      });
    }
    if (results.metric_3?.value || results.metric_3?.label) {
      list.push({
        label: results.metric_3.label || 'Chỉ số 3',
        value: results.metric_3.value || '-',
        sub: 'Độ phủ thực tế',
      });
    }

    if (list.length >= 3) return list.slice(0, 3);
  }

  // 3. Cấu trúc legacy cũ: athletes, articles, views
  if (results.athletes || results.articles || results.views) {
    return [
      {
        label: 'Quy mô VĐV',
        value: results.athletes || '5.2K VĐV',
        sub: 'Tham gia thi đấu',
      },
      {
        label: 'Báo chí PR',
        value: results.articles || '50+ Bài Báo',
        sub: 'Độ phủ chính thống',
      },
      {
        label: 'Lượt xem MXH',
        value: results.views || '2M Lượt Xem',
        sub: 'Lan tỏa đa kênh',
      },
    ];
  }

  // 4. Default fallback an toàn
  return [
    { label: 'Quy mô', value: '5.2K+', sub: 'Quy mô triển khai' },
    { label: 'Báo chí PR', value: '50+ Bài', sub: 'Độ phủ truyền thông' },
    { label: 'Lượt xem MXH', value: '2M Lượt', sub: 'Lan tỏa đa nền tảng' },
  ];
}
