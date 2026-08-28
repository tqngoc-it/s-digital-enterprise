export interface StatItem {
  value: string;
  label: string;
  desc: string;
}

export interface CapabilityItem {
  title: string;
  desc: string;
  iconName: string;
}

export interface WorkingHours {
  weekday: string;
  weekend: string;
}

export interface CompanyInfo {
  company_name: string;
  brand_slogan: string;
  about_heading: string;
  about_text: string;
  about_description_2: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  working_hours: WorkingHours;
  copyright_text: string;
  highlights_stats: StatItem[];
  core_capabilities: CapabilityItem[];
}

export const FALLBACK_COMPANY: CompanyInfo = {
  company_name: 'CÔNG TY TNHH S-DIGITAL',
  brand_slogan: 'Tổ Hợp Tiếp Thị Số & Giải Pháp Thể Thao Đột Phá',
  about_heading: 'Đối Tác Tin Cậy Cho Sự Phát Triển Bền Vững',
  about_text:
    'Chúng tôi giúp doanh nghiệp tăng trưởng bền vững - xây dựng thương hiệu - thu hút khách hàng - tối ưu chuyển đổi bằng hệ thống marketing đa kênh kết hợp với các giải pháp truyền thông thể thao chuyên nghiệp.',
  about_description_2:
    'Với đội ngũ chuyên gia giàu kinh nghiệm thực chiến trong cả hai lĩnh vực công nghệ truyền thông số và tổ chức sự kiện thể thao, S-Digital tự hào mang đến các giải pháp trọn gói từ tư vấn chiến lược, sản xuất nội dung sáng tạo, booking KOLs/KOCs đến vận hành giải đấu quy mô quốc gia và quốc tế.',
  address: '101 Đường số 1, cư xá Đô Thành phường Bàn Cờ TP. Hồ Chí Minh',
  contact_email: 'contact@s-digital.com.vn',
  contact_phone: '0826 868 979',
  working_hours: {
    weekday: 'Thứ 2 - Thứ 6: 8:00 - 18:00',
    weekend: 'Thứ 7: 8:00 - 12:00 (Chủ nhật trực sự kiện)'
  },
  copyright_text: '© 2026 CÔNG TY TNHH S-DIGITAL. All rights reserved.',
  highlights_stats: [
    { value: '95%', label: 'Khách Hàng Hài Lòng', desc: 'Tỷ lệ khách hàng đánh giá dịch vụ xuất sắc và quay lại hợp tác dài hạn.' },
    { value: '80%', label: 'Tăng Trưởng ROI', desc: 'Mức tăng trưởng trung bình về lợi nhuận đầu tư cho các chiến dịch quảng cáo.' },
    { value: '90%', label: 'Dự Án Thành Công', desc: 'Tỷ lệ dự án hoàn thành đúng hạn và vượt các chỉ tiêu KPI cam kết.' },
    { value: '85%', label: 'Tăng Nhận Diện', desc: 'Mức tăng trưởng trung bình về độ nhận diện thương hiệu sau các chiến dịch.' },
  ],
  core_capabilities: [
    {
      title: 'Chiến Lược Toàn Diện',
      desc: 'Tư vấn và định vị thương hiệu tổng thể, may đo giải pháp phù hợp với từng giai đoạn phát triển và ngân sách của doanh nghiệp.',
      iconName: 'Compass'
    },
    {
      title: 'Thực Thi Đa Kênh',
      desc: 'Phủ sóng toàn diện trên Google, Meta, TikTok, YouTube cùng mạng lưới KOL/KOC và hệ thống báo chí chính thống uy tín.',
      iconName: 'Share2'
    },
    {
      title: 'Công Nghệ & Sáng Tạo',
      desc: 'Ứng dụng hệ thống phân tích dữ liệu realtime, chip-timing thể thao chuẩn quốc tế và studio sản xuất nội dung 4K hiện đại.',
      iconName: 'Cpu'
    },
    {
      title: 'Đo Lường Minh Bạch',
      desc: 'Báo cáo số liệu chi tiết, minh bạch theo thời gian thực, cam kết tối ưu hóa chỉ số ROI/ROAS vượt trội cho từng đồng ngân sách.',
      iconName: 'BarChart3'
    }
  ]
};

export interface PartnerItem {
  id?: string;
  name: string;
  logo_url?: string;
  type: 'CUSTOMER' | 'PARTNER';
  industry?: string;
  website_url?: string;
  display_order?: number;
}

export const FALLBACK_PARTNERS: PartnerItem[] = [
  // 16 Khách hàng lớn
  { name: 'ByteDance', type: 'CUSTOMER', industry: 'Công nghệ & MXH', display_order: 1 },
  { name: 'Vietcombank', type: 'CUSTOMER', industry: 'Tài chính Ngân hàng', display_order: 2 },
  { name: 'VietinBank', type: 'CUSTOMER', industry: 'Tài chính Ngân hàng', display_order: 3 },
  { name: 'MB Bank', type: 'CUSTOMER', industry: 'Tài chính Ngân hàng', display_order: 4 },
  { name: 'Trung Nguyên Legend', type: 'CUSTOMER', industry: 'F&B & Cà phê', display_order: 5 },
  { name: 'Alibaba.com', type: 'CUSTOMER', industry: 'Thương mại điện tử', display_order: 6 },
  { name: 'Big C / GO!', type: 'CUSTOMER', industry: 'Bán lẻ & Siêu thị', display_order: 7 },
  { name: 'GUMAC', type: 'CUSTOMER', industry: 'Thời trang', display_order: 8 },
  { name: 'Realme', type: 'CUSTOMER', industry: 'Thiết bị công nghệ', display_order: 9 },
  { name: 'YOBE', type: 'CUSTOMER', industry: 'Mỹ phẩm & Làm đẹp', display_order: 10 },
  { name: 'VN Ngày Nay', type: 'CUSTOMER', industry: 'Báo chí & Truyền thông', display_order: 11 },
  { name: 'Lavatino', type: 'CUSTOMER', industry: 'Đồ da cao cấp', display_order: 12 },
  { name: 'Blum', type: 'CUSTOMER', industry: 'Phụ kiện nội thất', display_order: 13 },
  { name: 'Midea', type: 'CUSTOMER', industry: 'Điện gia dụng', display_order: 14 },
  { name: 'J&T Express', type: 'CUSTOMER', industry: 'Logistics & Vận chuyển', display_order: 15 },
  { name: 'Hi', type: 'CUSTOMER', industry: 'Tiêu dùng & Dịch vụ', display_order: 16 },

  // 9 Đối tác chiến lược
  { name: 'TenMax', type: 'PARTNER', industry: 'AdTech & Data', display_order: 17 },
  { name: 'Moonlight Productions', type: 'PARTNER', industry: 'Sản xuất phim & Media', display_order: 18 },
  { name: 'Adf.ly', type: 'PARTNER', industry: 'Digital Advertising', display_order: 19 },
  { name: 'Điền Quân Media', type: 'PARTNER', industry: 'Sản xuất nội dung & Gameshow', display_order: 20 },
  { name: 'Novaon', type: 'PARTNER', industry: 'Digital Marketing & MarTech', display_order: 21 },
  { name: 'ĐH TDTT TP.HCM', type: 'PARTNER', industry: 'Đào tạo & Thể thao chuyên nghiệp', display_order: 22 },
  { name: 'ĐH Sư Phạm Hà Nội', type: 'PARTNER', industry: 'Giáo dục & Khoa học thể chất', display_order: 23 },
  { name: 'ĐH Sư Phạm TDTT TP.HCM', type: 'PARTNER', industry: 'Đào tạo HLV & Trọng tài', display_order: 24 },
  { name: 'Vietnam VPC Pickleball Open Cup', type: 'PARTNER', industry: 'Giải đấu thể thao quốc tế', display_order: 25 },
];

export interface DigitalService {
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
  badge: string;
  iconName: string;
}

export interface SportsService {
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
  badge: string;
  iconName: string;
}

export interface ServiceItem {
  id?: string;
  title: string;
  slug?: string;
  sub_title?: string;
  short_description?: string;
  sub_items?: any;
  process_steps?: any;
  bullet_points?: string[];
  thumbnail_url?: string;
  icon_name?: string;
  category: 'DIGITAL' | 'SPORTS' | string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  // Aliases for fallback & compatibility
  badge?: string;
  subtitle?: string;
  desc?: string;
  points?: string[];
  features?: string[];
  iconName?: string;
}

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Quảng Cáo Google & Facebook Tối Ưu ROI',
    badge: 'Performance Marketing',
    short_description: 'Thiết lập và tối ưu chiến dịch quảng cáo đa kênh chuyên sâu với mục tiêu tối đa hóa tỷ suất sinh lời ROAS và giảm thiểu chi phí trên mỗi chuyển đổi (CPA/CPL).',
    category: 'DIGITAL',
    display_order: 1,
    features: [
      'Google Search, Display Network, Shopping & YouTube Ads',
      'Facebook, Instagram & Reels Performance Ads',
      'Theo dõi và phân tích ROI/ROAS realtime qua Dashboard',
      'A/B Testing liên tục mẫu quảng cáo & tệp đối tượng'
    ],
    is_active: true,
    icon_name: 'TrendingUp'
  },
  {
    id: 'srv-2',
    title: 'Marketing KOL & KOC Chuyên Nghiệp',
    badge: 'Influencer & PR',
    short_description: 'Kết nối thương hiệu với các KOL/KOC phù hợp nhất với tệp khách hàng mục tiêu, sáng tạo nội dung viral tự nhiên và thúc đẩy chuyển đổi doanh số bán hàng.',
    category: 'DIGITAL',
    display_order: 2,
    features: [
      'Lựa chọn KOL/KOC chuẩn tệp khách hàng tiềm năng',
      'Xây dựng kịch bản sáng tạo, bắt trend tự nhiên',
      'Quản lý trọn gói A-Z từ hợp đồng, sản xuất đến đăng tải',
      'Đo lường mức độ tương tác và tỷ lệ chuyển đổi đơn hàng'
    ],
    is_active: true,
    icon_name: 'Megaphone'
  },
  {
    id: 'srv-3',
    title: 'Thiết Kế Website Chuẩn SEO & UX Chuyên Sâu',
    badge: 'Web & Growth Tech',
    short_description: 'Xây dựng website doanh nghiệp, landing page bán hàng đẳng cấp quốc tế với giao diện độc quyền, chuẩn SEO, responsive hoàn hảo trên mọi thiết bị di động.',
    category: 'DIGITAL',
    display_order: 3,
    features: [
      'Giao diện hiện đại, nâng tầm giá trị thương hiệu',
      'Tối ưu hành trình trải nghiệm người dùng (UX/UI)',
      'Tối ưu chuẩn SEO Onpage & Tốc độ tải trang vượt trội',
      'Hệ thống quản trị nội dung dễ sử dụng, bảo mật cao'
    ],
    is_active: true,
    icon_name: 'Globe'
  },
  {
    id: 'srv-4',
    title: 'Sản Xuất Video TVC, Viral Clip & Video Doanh Nghiệp',
    badge: 'Creative Production',
    short_description: 'Sản xuất các sản phẩm video chất lượng điện ảnh với 4 định dạng chủ lực: Video giới thiệu doanh nghiệp, Video ngắn Viral mạng xã hội, TVC quảng cáo và Video sự kiện.',
    category: 'DIGITAL',
    display_order: 4,
    features: [
      'Studio & trang thiết bị máy quay điện ảnh 4K tiêu chuẩn',
      'Đội ngũ biên kịch, đạo diễn và kỹ xảo hậu kỳ giàu kinh nghiệm',
      'Kịch bản giữ chân người xem cao, kích thích chia sẻ',
      'Cam kết đúng tiến độ và tối ưu theo ngân sách dự án'
    ],
    is_active: true,
    icon_name: 'Video'
  },
  {
    id: 'srv-5',
    title: 'Livestream Bán Hàng & Sự Kiện Đa Sàn',
    badge: 'Live Commerce',
    short_description: 'Cung cấp giải pháp livestream trọn gói từ tư vấn thiết bị, ánh sáng, âm thanh, kịch bản chốt đơn đến host livestream và đội ngũ kỹ thuật vận hành đa nền tảng.',
    category: 'DIGITAL',
    display_order: 5,
    features: [
      'Tư vấn & setup phòng livestream chuyên nghiệp chuẩn studio',
      'Đội ngũ Host / KOC livestream duyên dáng, chốt sale đỉnh cao',
      'Vận hành kỹ thuật trực tiếp trên TikTok Shop, Shopee, Facebook',
      'Tối ưu luồng traffic và quản lý minigame tăng tương tác'
    ],
    is_active: true,
    icon_name: 'Radio'
  },
  {
    id: 'srv-6',
    title: 'Xử Lý Khủng Hoảng Truyền Thông 24/7',
    badge: 'Crisis Shield 24/7',
    short_description: 'Hệ thống giám sát dư luận trực chiến 24/7, phát hiện sớm nguy cơ và thực thi quy trình 5 bước dập tắt khủng hoảng truyền thông nhanh chóng, hiệu quả.',
    category: 'DIGITAL',
    display_order: 6,
    features: [
      'Giám sát mạng xã hội và báo chí đa kênh 24/7',
      'Phản ứng nhanh trong vòng 30 phút kể từ khi phát hiện',
      'Định hướng thông điệp và kích hoạt mạng lưới báo chí hỗ trợ',
      'Xử lý dư luận tiêu cực và phục hồi hình ảnh thương hiệu'
    ],
    is_active: true,
    icon_name: 'ShieldAlert'
  },
  {
    id: 'srv-7',
    title: 'Tổ Chức Giải Bóng Đá Doanh Nghiệp & Mở Rộng',
    badge: 'Tournament & Events',
    short_description: 'Quy hoạch giải đấu chuyên nghiệp, điều hành sân bãi, trọng tài AFC, bình luận viên trực tiếp, y tế và truyền thông lan tỏa.',
    category: 'SPORTS',
    display_order: 7,
    features: [
      'Quy hoạch giải đấu và xin giấy phép tổ chức chuyên nghiệp',
      'Đội ngũ 100+ Trọng tài AFC & giám sát trận đấu liên đoàn',
      'Bình luận viên thể thao trực tiếp & Livestream 8 góc máy 4K',
      'Hệ thống an ninh, y tế cấp cứu và truyền thông đa kênh'
    ],
    is_active: true,
    icon_name: 'Trophy'
  },
  {
    id: 'srv-8',
    title: 'Tổ Chức Giải Marathon & Chạy Tiếp Sức Quy Mô Lớn',
    badge: 'Marathon & Timing',
    short_description: 'Cung đường chuẩn quốc tế AIMS, hệ thống gắn chip timing điện tử chính xác đến từng mili-giây, trạm tiếp nước và xe cấp cứu chuyên dụng.',
    category: 'SPORTS',
    display_order: 8,
    features: [
      'Cung đường chuẩn quốc tế AIMS & khảo sát địa hình chi tiết',
      'Hệ thống gắn chip timing điện tử độ chính xác tuyệt đối',
      'Trạm tiếp nước, bảo trợ y tế khẩn cấp và xe cứu thương',
      'Truyền thông bùng nổ thu hút hàng ngàn vận động viên'
    ],
    is_active: true,
    icon_name: 'Activity'
  },
  {
    id: 'srv-9',
    title: 'Đại Hội Thể Thao & Giải Đa Môn Doanh Nghiệp',
    badge: 'Olympic & Multi-Sport',
    short_description: 'Tổ chức các kỳ Olympic nội bộ kết hợp nhiều môn: Pickleball, Tennis, Cầu lông, Bóng chuyền, Kéo co gắn kết tinh thần đoàn kết.',
    category: 'SPORTS',
    display_order: 9,
    features: [
      'Tổ chức Olympic nội bộ đa môn: Pickleball, Tennis, Cầu lông...',
      'Thiết kế chuỗi hoạt động team-building gắn kết tinh thần',
      'Trọng tài liên đoàn điều hành & bảng điểm realtime',
      'Lễ bế mạc trao giải trang trọng, nâng tầm văn hóa doanh nghiệp'
    ],
    is_active: true,
    icon_name: 'Boxes'
  },
  {
    id: 'srv-10',
    title: 'Cung Cấp Đội Ngũ Trọng Tài Quốc Tế & Quốc Gia',
    badge: 'Referee Network',
    short_description: 'Mạng lưới hơn 100 trọng tài đạt chứng chỉ AFC, FIBA, FIVB, AIMS điều hành chuyên nghiệp các giải đấu thể thao trên toàn quốc.',
    category: 'SPORTS',
    display_order: 10,
    features: [
      '100% Trọng tài có bằng cấp chứng nhận từ Liên đoàn thể thao chính thức',
      'Kiểm tra thể lực định kỳ và cập nhật luật thi đấu mới nhất hàng năm',
      'Quy trình xử lý vi phạm nghiêm ngặt, cam kết tính khách quan 100%',
      'Kinh nghiệm điều phối các giải chạy marathon trên 5.000 VĐV'
    ],
    is_active: true,
    icon_name: 'Award'
  },
  {
    id: 'srv-11',
    title: 'Học Viện Thể Thao & Đào Tạo Huấn Luyện Viên',
    badge: 'Sports Academy',
    short_description: 'Đào tạo 6 môn thể thao và 4 cấp độ khóa học cùng đội ngũ HLV hàng đầu (Bằng AFC Pro, Cựu VĐV Quốc Gia, FIBA Level 2).',
    category: 'SPORTS',
    display_order: 11,
    features: [
      'Đào tạo 6 môn: Bóng đá, Điền kinh, Bóng rổ, Bóng chuyền, Tennis/Pickleball, Bơi lội',
      '4 Khóa học từ Cơ bản, Trung cấp, Nâng cao đến Đào tạo HLV',
      'Đội ngũ HLV giàu thành tích đỉnh cao trực tiếp giảng dạy',
      'Giáo trình bài bản, phát triển thể lực và kỹ chiến thuật hiện đại'
    ],
    is_active: true,
    icon_name: 'UserCheck'
  }
];

export interface VideoTypeItem {
  title: string;
  desc: string;
}

export interface CrisisStepItem {
  step: string;
  title: string;
  desc: string;
}

export interface TournamentPhaseItem {
  phase: string;
  timeframe: string;
  title: string;
  desc: string;
}

export interface RefereeHighlight {
  metric: string;
  label: string;
}

export interface SportTrainingCourse {
  name: string;
  duration: string;
  desc: string;
  target: string;
}

export interface TrainerProfile {
  name: string;
  role: string;
  cert: string;
  experience: string;
  highlight: string;
}

export const FALLBACK_DIGITAL_SERVICES: DigitalService[] = [
  {
    title: 'Quảng Cáo Google & Facebook Tối Ưu ROI',
    subtitle: 'Search, Display, Shopping, Youtube & Meta Ads',
    desc: 'Thiết lập và tối ưu chiến dịch quảng cáo đa kênh chuyên sâu với mục tiêu tối đa hóa tỷ suất sinh lời ROAS và giảm thiểu chi phí trên mỗi chuyển đổi (CPA/CPL).',
    points: [
      'Google Search, Display Network, Shopping & YouTube Ads',
      'Facebook, Instagram & Reels Performance Ads',
      'Theo dõi và phân tích ROI/ROAS realtime qua Dashboard',
      'A/B Testing liên tục mẫu quảng cáo & tệp đối tượng'
    ],
    badge: 'Performance Marketing',
    iconName: 'TrendingUp'
  },
  {
    title: 'Marketing KOL & KOC Chuyên Nghiệp',
    subtitle: 'Mạng lưới 500+ Influencer mọi lĩnh vực',
    desc: 'Kết nối thương hiệu với các KOL/KOC phù hợp nhất với tệp khách hàng mục tiêu, sáng tạo nội dung viral tự nhiên và thúc đẩy chuyển đổi doanh số bán hàng.',
    points: [
      'Lựa chọn KOL/KOC chuẩn tệp khách hàng tiềm năng',
      'Xây dựng kịch bản sáng tạo, bắt trend tự nhiên',
      'Quản lý trọn gói A-Z từ hợp đồng, sản xuất đến đăng tải',
      'Đo lường mức độ tương tác và tỷ lệ chuyển đổi đơn hàng'
    ],
    badge: 'Influencer & PR',
    iconName: 'Megaphone'
  },
  {
    title: 'Thiết Kế Website Chuẩn SEO & UX Chuyên Sâu',
    subtitle: 'Tối ưu trải nghiệm chuyển đổi & tốc độ tải trang',
    desc: 'Xây dựng website doanh nghiệp, landing page bán hàng đẳng cấp quốc tế với giao diện độc quyền, chuẩn SEO, responsive hoàn hảo trên mọi thiết bị di động.',
    points: [
      'Giao diện hiện đại, nâng tầm giá trị thương hiệu',
      'Tối ưu hành trình trải nghiệm người dùng (UX/UI)',
      'Tối ưu chuẩn SEO Onpage & Tốc độ tải trang vượt trội',
      'Hệ thống quản trị nội dung dễ sử dụng, bảo mật cao'
    ],
    badge: 'Web & Growth Tech',
    iconName: 'Globe'
  },
  {
    title: 'Sản Xuất Video TVC, Viral Clip & Video Doanh Nghiệp',
    subtitle: 'Quy trình 3 bước: Tiền kỳ - Sản xuất - Hậu kỳ 4K',
    desc: 'Sản xuất các sản phẩm video chất lượng điện ảnh với 4 định dạng chủ lực: Video giới thiệu doanh nghiệp, Video ngắn Viral mạng xã hội, TVC quảng cáo và Video sự kiện.',
    points: [
      'Studio & trang thiết bị máy quay điện ảnh 4K tiêu chuẩn',
      'Đội ngũ biên kịch, đạo diễn và kỹ xảo hậu kỳ giàu kinh nghiệm',
      'Kịch bản giữ chân người xem cao, kích thích chia sẻ',
      'Cam kết đúng tiến độ và tối ưu theo ngân sách dự án'
    ],
    badge: 'Creative Production',
    iconName: 'Video'
  },
  {
    title: 'Livestream Bán Hàng & Sự Kiện Đa Sàn',
    subtitle: 'Tư vấn setup phòng live & Vận hành chốt đơn',
    desc: 'Cung cấp giải pháp livestream trọn gói từ tư vấn thiết bị, ánh sáng, âm thanh, kịch bản chốt đơn đến host livestream và đội ngũ kỹ thuật vận hành đa nền tảng.',
    points: [
      'Tư vấn & setup phòng livestream chuyên nghiệp chuẩn studio',
      'Đội ngũ Host / KOC livestream duyên dáng, chốt sale đỉnh cao',
      'Vận hành kỹ thuật trực tiếp trên TikTok Shop, Shopee, Facebook',
      'Tối ưu luồng traffic và quản lý minigame tăng tương tác'
    ],
    badge: 'Live Commerce',
    iconName: 'Radio'
  },
  {
    title: 'Xử Lý Khủng Hoảng Truyền Thông 24/7',
    subtitle: 'Phản ứng nhanh trong 30 phút - Bảo vệ uy tín',
    desc: 'Hệ thống giám sát dư luận trực chiến 24/7, phát hiện sớm nguy cơ và thực thi quy trình 5 bước dập tắt khủng hoảng truyền thông nhanh chóng, hiệu quả.',
    points: [
      'Giám sát mạng xã hội và báo chí đa kênh 24/7',
      'Phản ứng nhanh trong vòng 30 phút kể từ khi phát hiện',
      'Định hướng thông điệp và kích hoạt mạng lưới báo chí hỗ trợ',
      'Xử lý dư luận tiêu cực và phục hồi hình ảnh thương hiệu'
    ],
    badge: 'Crisis Shield 24/7',
    iconName: 'ShieldAlert'
  }
];

export const FALLBACK_VIDEO_TYPES: VideoTypeItem[] = [
  { title: 'Video Doanh Nghiệp (Corporate Video)', desc: 'Khắc họa quy mô, tầm nhìn, sứ mệnh và văn hóa doanh nghiệp chuẩn mực để thu hút đối tác và nhà đầu tư.' },
  { title: 'Video Ngắn Viral MXH (TikTok / Reels)', desc: 'Kịch bản cuốn hút 3 giây đầu, bắt trend khéo léo, tối ưu thuật toán phân phối đạt hàng triệu lượt xem tự nhiên.' },
  { title: 'TVC Quảng Cáo Truyền Hình & Digital', desc: 'Hình ảnh chất lượng điện ảnh, âm thanh sống động, truyền tải thông điệp cốt lõi của sản phẩm chỉ trong 15-30 giây.' },
  { title: 'Video Tổng Kết Sự Kiện (Event Highlight)', desc: 'Ghi lại trọn vẹn những khoảnh khắc bùng nổ, cảm xúc thăng hoa và dấu ấn thành công của sự kiện lớn.' },
];

export const FALLBACK_CRISIS_STEPS: CrisisStepItem[] = [
  { step: '01', title: 'Giám Sát 24/7', desc: 'Hệ thống lắng nghe mạng xã hội tự động phát hiện rủi ro và các luồng ý kiến tiêu cực ngay từ khi manh nha.' },
  { step: '02', title: 'Phân Tích Đánh Giá', desc: 'Đánh giá mức độ nghiêm trọng, nguồn phát tán và tác động tiềm ẩn đến uy tín thương hiệu trong 15 phút.' },
  { step: '03', title: 'Chiến Lược Phản Hồi', desc: 'Xây dựng thông điệp nhất quán, tài liệu phát ngôn chính thức và kịch bản ứng phó cho các kịch bản phát sinh.' },
  { step: '04', title: 'Triển Khai Xử Lý', desc: 'Phối hợp cùng các cơ quan báo chí, KOLs và kích hoạt các kênh truyền thông chính thống để cân bằng dư luận.' },
  { step: '05', title: 'Phục Hồi Thương Hiệu', desc: 'Triển khai các chiến dịch truyền thông tích cực nhằm tái xây dựng niềm tin của khách hàng và đối tác.' },
];

export const FALLBACK_SPORTS_HUB = {
  title: 'Giải Pháp Tiếp Thị Thể Thao & Đào Tạo Đỉnh Cao',
  subtitle: 'Tổ hợp giải pháp tổ chức giải đấu, cung cấp trọng tài và huấn luyện thể thao chuyên nghiệp hàng đầu',
  events: [
    {
      title: 'Tổ Chức Giải Bóng Đá Doanh Nghiệp & Mở Rộng',
      desc: 'Quy hoạch giải đấu chuyên nghiệp, điều hành sân bãi, trọng tài AFC, bình luận viên trực tiếp, y tế và truyền thông lan tỏa.',
      iconName: 'Trophy'
    },
    {
      title: 'Tổ Chức Giải Marathon & Chạy Tiếp Sức Quy Mô Lớn',
      desc: 'Cung đường chuẩn quốc tế AIMS, hệ thống gắn chip timing điện tử chính xác đến từng mili-giây, trạm tiếp nước và xe cấp cứu chuyên dụng.',
      iconName: 'Activity'
    },
    {
      title: 'Đại Hội Thể Thao & Giải Đa Môn Doanh Nghiệp',
      desc: 'Tổ chức các kỳ Olympic nội bộ kết hợp nhiều môn: Pickleball, Tennis, Cầu lông, Bóng chuyền, Kéo co gắn kết tinh thần đoàn kết.',
      iconName: 'Boxes'
    }
  ],
  five_phases: [
    { phase: 'Giai Đoạn 1', timeframe: 'Tháng 1', title: 'Lập Kế Hoạch & Khảo Sát', desc: 'Xác định mục tiêu, dự toán ngân sách, khảo sát cung đường/sân bãi và xin giấy phép tổ chức từ cơ quan ban ngành.' },
    { phase: 'Giai Đoạn 2', timeframe: 'Tháng 2 - 3', title: 'Chuẩn Bị & Trọng Tài', desc: 'Huy động đội ngũ 100+ trọng tài quốc tế, phân công ban chuyên môn, setup hệ thống chip timing và chuẩn bị trang thiết bị thi đấu.' },
    { phase: 'Giai Đoạn 3', timeframe: 'Tháng 4', title: 'Chiến Dịch Marketing', desc: 'Mở cổng đăng ký VĐV, triển khai truyền thông đa kênh, booking KOLs thể thao và họp báo công bố giải đấu.' },
    { phase: 'Giai Đoạn 4', timeframe: 'Tháng 5', title: 'Tổ Chức & Vận Hành', desc: 'Vận hành trực tiếp ngày thi đấu với đội ngũ an ninh y tế túc trực, livestream 8 góc máy 4K và trao giải trang trọng.' },
    { phase: 'Giai Đoạn 5', timeframe: 'Sau Sự Kiện', title: 'Tổng Kết & Đánh Giá', desc: 'Nghiệm thu truyền thông, tổng kết dữ liệu thi đấu, gửi chứng nhận cho VĐV và báo cáo ROI chi tiết cho nhà tài trợ.' }
  ] as TournamentPhaseItem[],
  referee_stats: [
    { metric: '100+', label: 'Trọng Tài Quốc Tế & Quốc Gia' },
    { metric: '500+', label: 'Giải Đấu Đã Điều Hành' },
    { metric: '15 Năm', label: 'Kinh Nghiệm Chuyên Môn' },
    { metric: '98%', label: 'Mức Độ Hài Lòng Ban Tổ Chức' }
  ] as RefereeHighlight[],
  referee_sports: ['Bóng Đá (AFC / VFF)', 'Điền Kinh & Marathon (AIMS)', 'Bóng Rổ (FIBA)', 'Bóng Chuyền (FIVB)'],
  sports_training_list: ['Bóng Đá', 'Điền Kinh', 'Bóng Rổ', 'Bóng Chuyền', 'Quần Vợt & Pickleball', 'Bơi Lội'],
  courses: [
    { name: 'Khóa Cơ Bản (Basic)', duration: '3 Tháng', desc: 'Làm quen kỹ thuật căn bản, xây dựng nền tảng thể lực và nắm vững luật thi đấu.', target: 'Người mới bắt đầu & Doanh nghiệp' },
    { name: 'Khóa Trung Cấp (Intermediate)', duration: '6 Tháng', desc: 'Hoàn thiện kỹ chiến thuật, rèn luyện tư duy thi đấu phối hợp đồng đội.', target: 'Vận động viên phong trào' },
    { name: 'Khóa Nâng Cao (Advanced)', duration: '12 Tháng', desc: 'Huấn luyện chuyên sâu về cường độ cao, chiến thuật đỉnh cao và tâm lý thi đấu.', target: 'Đội tuyển bán chuyên & chuyên nghiệp' },
    { name: 'Khóa Đào Tạo HLV (Coaching License)', duration: '6 - 12 Tháng', desc: 'Đào tạo phương pháp sư phạm thể thao, phân tích chiến thuật và cấp chứng chỉ liên đoàn.', target: 'Huấn luyện viên tương lai' }
  ] as SportTrainingCourse[],
  head_coaches: [
    {
      name: 'HLV. Trần Minh Đức',
      role: 'Chuyên Gia Huấn Luyện Bóng Đá',
      cert: 'Bằng AFC Pro License (Liên đoàn Bóng đá Châu Á)',
      experience: '20+ Năm kinh nghiệm huấn luyện các đội tuyển trẻ và CLB V-League',
      highlight: 'Từng đào tạo nhiều tuyển thủ quốc gia tham dự SEA Games và Asian Cup.'
    },
    {
      name: 'HLV. Nguyễn Thu Hương',
      role: 'Chuyên Gia Điền Kinh & Marathon',
      cert: 'Cựu VĐV Đội Tuyển Điền Kinh Quốc Gia',
      experience: '15 Năm thi đấu và huấn luyện vận động viên marathon phong trào & chuyên nghiệp',
      highlight: 'Nhiều huy chương Vàng SEA Games cự ly 5.000m & 10.000m.'
    },
    {
      name: 'HLV. Vũ Hải Long',
      role: 'Chuyên Gia Huấn Luyện Bóng Rổ',
      cert: 'Chứng chỉ FIBA Level 2 Quốc Tế',
      experience: '12 Năm dẫn dắt các đội bóng rổ đại học và giải vô địch quốc gia',
      highlight: 'Chuyên gia xây dựng giáo án phát triển thể lực và tư duy chiến thuật hiện đại.'
    }
  ] as TrainerProfile[]
};

export interface WhyChooseUsData {
  crisis_highlight: {
    title: string;
    reaction_time: string;
    cases_handled: string;
    network: string;
    desc: string;
  };
  four_pillars: {
    title: string;
    desc: string;
    iconName: string;
  }[];
  five_steps_process: {
    step: string;
    title: string;
    desc: string;
  }[];
}

export const FALLBACK_WHY_CHOOSE_US: WhyChooseUsData = {
  crisis_highlight: {
    title: 'Điểm Mạnh Khác Biệt: Xử Lý Khủng Hoảng Truyền Thông 30 Phút',
    reaction_time: '30 Phút',
    cases_handled: '50+ Vụ Việc Lớn',
    network: 'Hơn 100 Cơ Quan Báo Chí & 500+ KOLs',
    desc: 'Trong kỷ nguyên số, một cuộc khủng hoảng có thể phá hủy thương hiệu trong vài giờ. S-Digital cam kết phản ứng trong 30 phút, sở hữu mạng lưới quan hệ sâu rộng với cơ quan báo chí và KOLs để định hướng dư luận, bảo vệ thương hiệu an toàn tuyệt đối.'
  },
  four_pillars: [
    {
      title: 'Đội Ngũ Chuyên Gia 10+ Năm Kinh Nghiệm',
      desc: 'Quy tụ các chuyên gia tiếp thị số thực chiến, đạo diễn TVC tên tuổi và các trọng tài, HLV đạt chuẩn AFC/FIBA quốc tế.',
      iconName: 'Users'
    },
    {
      title: 'Mạng Lưới Truyền Thông & KOLs Độc Quyền',
      desc: 'Liên kết trực tiếp với hơn 50 đầu báo chính thống và mạng lưới 500+ KOL/KOC thể thao, lifestyle uy tín hàng đầu.',
      iconName: 'Network'
    },
    {
      title: 'Năng Lực Tổ Chức Giải Đấu Chuẩn Quốc Tế',
      desc: 'Kinh nghiệm vận hành những giải đấu thể thao trên 5.000 vận động viên với hệ thống chip timing, an ninh y tế khép kín.',
      iconName: 'Trophy'
    },
    {
      title: 'Cam Kết Hiệu Quả & Minh Bạch Ngân Sách',
      desc: 'Báo cáo số liệu thời gian thực qua Dashboard tự động, không chi phí ẩn, cam kết hoàn thành vượt các KPI đề ra.',
      iconName: 'ShieldCheck'
    }
  ],
  five_steps_process: [
    { step: '01', title: 'Tiếp Nhận & Khảo Sát Nhu Cầu', desc: 'Lắng nghe mục tiêu kinh doanh, phân tích hiện trạng thương hiệu và nghiên cứu đối thủ cạnh tranh.' },
    { step: '02', title: 'Xây Dựng Đề Xuất Chiến Lược', desc: 'Thiết kế kế hoạch tổng thể, lựa chọn kênh tiếp thị, dự toán ngân sách và cam kết KPI rõ ràng.' },
    { step: '03', title: 'Ký Kết Hợp Đồng & Setup', desc: 'Thống nhất các điều khoản pháp lý minh bạch, phân bổ nhân sự chuyên trách và khởi tạo tài nguyên dự án.' },
    { step: '04', title: 'Triển Khai & Tối Ưu Realtime', desc: 'Vận hành chiến dịch đa kênh, theo dõi số liệu từng giờ và liên tục điều chỉnh tối ưu hiệu suất sinh lời.' },
    { step: '05', title: 'Đánh Giá & Bàn Giao Báo Cáo', desc: 'Tổng kết kết quả so với KPI cam kết, bàn giao dữ liệu khách hàng và tư vấn định hướng phát triển tiếp theo.' }
  ]
};

export interface TestimonialItem {
  author: string;
  role: string;
  brand: string;
  avatarText: string;
  content: string;
  rating: number;
}

export const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    author: 'Nguyễn Thanh Tùng',
    role: 'Giám Đốc Marketing',
    brand: 'Công ty Cổ phần Nước Giải Khát ABC (Revive)',
    avatarText: 'TT',
    content:
      'S-Digital đã tổ chức một chiến dịch truyền thông giải chạy marathon xuất sắc vượt ngoài mong đợi, vượt 150% KPI nhận diện ban đầu và tạo hiệu ứng lan tỏa thương hiệu mạnh mẽ trên toàn quốc.',
    rating: 5
  },
  {
    author: 'Lê Hoàng Nam',
    role: 'CEO & Founder',
    brand: 'Thương hiệu Thời trang Thể thao XYZ (Active+)',
    avatarText: 'HN',
    content:
      'Hệ thống quảng cáo đa kênh kết hợp booking KOLs thể thao của S-Digital mang lại tỷ lệ chuyển đổi doanh số ấn tượng nhất từ trước đến nay cho chúng tôi. Chi phí trên mỗi đơn hàng giảm hơn 35%.',
    rating: 5
  },
  {
    author: 'Phạm Thu Trang',
    role: 'Trưởng Phòng PR & Đối Ngoại',
    brand: 'Tập đoàn Bất Động Sản DEF',
    avatarText: 'TT',
    content:
      'Khả năng ứng biến và xử lý khủng hoảng truyền thông của S-Digital cực kỳ ấn tượng. Đội ngũ phản ứng nhanh trong 30 phút, dập tắt tin đồn thất thiệt và bảo vệ trọn vẹn uy tín thương hiệu trong giai đoạn nhạy cảm.',
    rating: 5
  }
];

export interface CaseStudyItem {
  id?: string;
  title: string;
  slug?: string;
  client_name: string;
  thumbnail_url?: string;
  challenge: string;
  solution: string;
  results: {
    athletes: string;
    articles: string;
    views: string;
    roi?: string;
  };
  scope_items?: string[];
  is_featured?: boolean;
}

export const FALLBACK_CASE_STUDIES: CaseStudyItem[] = [
  {
    title: 'Giải Marathon Quốc Tế Thành Phố 2025',
    slug: 'giai-marathon-quoc-te-thanh-pho',
    client_name: 'Ủy Ban TDTT & Liên Đoàn Thể Thao',
    challenge:
      'Tổ chức giải marathon quy mô trên 5.000 vận động viên tham gia, đảm bảo tuyệt đối an toàn đường chạy, chính xác thời gian thi đấu và thu hút truyền thông đa kênh lan tỏa toàn quốc.',
    solution:
      'Lập kế hoạch tổng thể 6 tháng, quy chuẩn cung đường đạt chuẩn AIMS, huy động 100+ trọng tài quốc tế và tình nguyện viên, tích hợp hệ thống timing chip điện tử, bảo trợ y tế khẩn cấp và triển khai chiến dịch truyền thông đa nền tảng kết hợp 20+ KOLs thể thao.',
    results: {
      athletes: '5.2K Vận Động Viên',
      articles: '50+ Bài Báo Uy Tín',
      views: '2M Lượt Xem Trực Tiếp & Lan Tỏa'
    },
    scope_items: [
      'Thiết kế bộ nhận diện thương hiệu độc quyền và ấn phẩm thi đấu',
      'Booking 20+ KOLs, VĐV nổi tiếng tham gia thi đấu và lan tỏa thông điệp',
      'Livestream trực tiếp toàn bộ giải chạy với 8 góc máy 4K hiện đại',
      'Cung cấp đội ngũ 60+ Trọng tài quốc tế & Điều phối an ninh đường chạy'
    ],
    is_featured: true
  }
];

export const FALLBACK_CASE_STUDY = FALLBACK_CASE_STUDIES[0];

export interface PricingPlanItem {
  id?: string;
  tier_name: string;
  target_audience: string;
  price_display: string;
  period?: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export interface QualityCommitment {
  title: string;
  desc: string;
  iconName: string;
}

export const FALLBACK_PRICING: PricingPlanItem[] = [
  {
    tier_name: 'Gói Cơ Bản (Starter)',
    target_audience: 'Phù hợp cho doanh nghiệp nhỏ & startup mới bước vào kỷ nguyên số',
    price_display: 'Từ 15 Triệu',
    period: '/tháng',
    badge: 'Khởi Nghiệp',
    popular: false,
    features: [
      'Quản trị & tối ưu quảng cáo Facebook / Google Ads cơ bản',
      'Sáng tạo 12 bài viết & thiết kế hình ảnh fanpage mỗi tháng',
      'Báo cáo đo lường chuyển đổi định kỳ hàng tháng',
      'Hỗ trợ tư vấn chiến lược marketing 1-1 theo yêu cầu',
      'Hỗ trợ kỹ thuật và giải đáp thắc mắc trong giờ hành chính'
    ]
  },
  {
    tier_name: 'Gói Chuyên Nghiệp (Growth)',
    target_audience: 'Dành cho doanh nghiệp vừa đang mở rộng và đẩy mạnh doanh thu',
    price_display: 'Từ 35 Triệu',
    period: '/tháng',
    badge: 'PHỔ BIẾN NHẤT',
    popular: true,
    features: [
      'Quảng cáo đa nền tảng (Meta, Google, TikTok) tối ưu CPA/ROAS',
      'Sản xuất 4 video viral ngắn (Reels/TikTok) + 1 TVC ngắn định kỳ',
      'Mạng lưới booking 3-5 KOLs/KOCs chất lượng theo ngành nghề',
      'Tối ưu phễu chuyển đổi Landing Page & SEO website chuyên sâu',
      'Báo cáo chi tiết realtime qua Dashboard tự động 24/7',
      'Ưu tiên xử lý sự cố truyền thông khẩn cấp'
    ]
  },
  {
    tier_name: 'Gói Doanh Nghiệp (Enterprise)',
    target_audience: 'Giải pháp toàn diện & may đo theo yêu cầu cho các tập đoàn lớn',
    price_display: 'Liên Hệ Báo Giá',
    period: 'Báo giá riêng',
    badge: 'May Đo Riêng',
    popular: false,
    features: [
      'Trọn gói Marketing Omni-channel đa kênh độc quyền',
      'Tổ chức & vận hành giải đấu thể thao, ngày hội thể thao doanh nghiệp',
      'Đội ngũ Trọng tài & Huấn luyện viên thể lực chuẩn AFC/FIBA',
      'Quy trình xử lý khủng hoảng truyền thông trực chiến 24/7 (Phản ứng 30 phút)',
      'Dedicated Account Director & Team ngũ chuyên gia riêng biệt',
      'Tư vấn chiến lược thương hiệu cấp cao và bảo trợ truyền thông'
    ]
  }
];

export const FALLBACK_COMMITMENTS: QualityCommitment[] = [
  {
    title: 'Minh Bạch Tuyệt Đối',
    desc: 'Báo cáo chi phí và hiệu quả realtime, không phát sinh chi phí ẩn, minh bạch 100% từng đồng ngân sách đầu tư.',
    iconName: 'ShieldCheck'
  },
  {
    title: 'Chất Lượng Đảm Bảo',
    desc: 'Cam kết chất lượng ấn phẩm đạt chuẩn quốc tế và luôn nỗ lực vượt các chỉ tiêu KPI đã cam kết trong hợp đồng.',
    iconName: 'Award'
  },
  {
    title: 'Hỗ Trợ Trực Chiến 24/7',
    desc: 'Đội ngũ chuyên viên và bộ phận kỹ thuật sẵn sàng tiếp nhận, xử lý mọi yêu cầu khẩn cấp bất kể ngày đêm.',
    iconName: 'Clock'
  },
  {
    title: 'Đổi Mới Liên Tục',
    desc: 'Liên tục cập nhật các thuật toán, công nghệ trí tuệ nhân tạo và xu hướng nội dung thịnh hành nhất toàn cầu.',
    iconName: 'Sparkles'
  }
];

export interface BlogPostItem {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  thumbnail_url?: string;
  category?: string;
  author?: string;
  published_at?: string;
  read_time?: string;
}

export const FALLBACK_BLOGS: BlogPostItem[] = [
  {
    title: 'Chiến Lược Marketing Đa Kênh Tối Ưu ROI Cho Doanh Nghiệp 2026',
    slug: 'chien-luoc-marketing-da-kenh-toi-uu-roi-2026',
    excerpt: 'Khám phá phương pháp phối hợp nhịp nhàng giữa Google Ads, Meta Ads và TikTok Ads nhằm hạ thấp chi phí CPA và tăng tỷ lệ chuyển đổi đơn hàng vượt bậc.',
    category: 'Digital Marketing',
    author: 'S-Digital Strategy Team',
    published_at: '15/02/2026',
    read_time: '5 phút đọc'
  },
  {
    title: 'Xu Hướng Thể Thao Doanh Nghiệp: Gắn Kết Đội Ngũ & Nâng Tầm Thương Hiệu',
    slug: 'xu-huong-the-thao-doanh-nghiep-2026',
    excerpt: 'Tại sao ngày càng nhiều tập đoàn hàng đầu lựa chọn tổ chức giải chạy marathon và giải bóng đá nội bộ làm công cụ xây dựng văn hóa doanh nghiệp và PR thương hiệu.',
    category: 'Sports Marketing',
    author: 'Ban Thể Thao S-Digital',
    published_at: '20/02/2026',
    read_time: '6 phút đọc'
  },
  {
    title: 'Cẩm Nang Xử Lý Khủng Hoảng Truyền Thông Trong Kỷ Nguyên Số',
    slug: 'cam-nang-xu-ly-khung-hoang-truyen-thong-ky-nguyen-so',
    excerpt: 'Quy trình chuẩn 5 bước và nguyên tắc vàng "Phản ứng 30 phút" giúp doanh nghiệp dập tắt tin đồn thất thiệt và bảo vệ hình ảnh thương hiệu trong thời khắc sinh tử.',
    category: 'Crisis Management',
    author: 'Chuyên gia PR S-Digital',
    published_at: '25/02/2026',
    read_time: '7 phút đọc'
  }
];