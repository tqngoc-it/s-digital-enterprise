export function formatVietnameseDate(rawDate?: string): string {
  if (!rawDate) return '02/10/2026';
  const trimmed = rawDate.trim();
  // Already in DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }
  return trimmed;
}

export function formatReadTime(rawReadTime?: string, content?: string): string {
  if (rawReadTime && rawReadTime.trim()) {
    const trimmed = rawReadTime.trim();
    const match = trimmed.match(/\d+/);
    if (match) {
      return `${match[0]} phút đọc`;
    }
  }
  const text = (content || '').replace(/[#*`_~-]/g, ' ').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} phút đọc`;
}

export function cleanMarkdownContent(content?: string): string {
  if (!content) return '';
  return content.replace(/<!-- BLOG_META:[\s\S]*?-->/g, '').trim();
}
