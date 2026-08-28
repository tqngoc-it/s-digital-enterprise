# S-DIGITAL ENTERPRISE SYSTEM SPECIFICATION (PUBLIC SITE 100% CONTENT + ADMIN CMS)

## 1. NGUYÊN TẮC KỸ THUẬT BẤT DI BẤT DỊCH
- **Role:** Senior Fullstack Developer (Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide React, Supabase SSR).
- **Phạm vi:** Chỉ thực thi trong thư mục `frontend/`. Tuyệt đối không thay đổi hay tạo lại database Supabase.
- **Data Architecture:** 
  - `app/page.tsx` là Server Component truy vấn song song từ các bảng Supabase hiện có (`company_info`, `partners`, `pricing_plans`, `case_studies`, `blogs`, `leads`).
  - Sử dụng kho dữ liệu `@/lib/fallbackData` làm fallback khi bảng rỗng.
  - Form liên hệ gửi dữ liệu qua Server Action vào bảng `leads` (các trường: `full_name`, `email`, `phone`, `message`, `status: 'NEW'`).
  - Giữ nguyên hiệu ứng `TypewriterTitle` nhấp nháy chữ "Toàn Diện" màu `#FF5722`.
- **Admin CMS (`/admin/*`):** Giữ nguyên phân quyền Auth, cung cấp đầy đủ giao diện Dashboard và các trang CRUD quản lý Leads, Dịch vụ, Đối tác, Gói giá, Case Studies, Blogs.

---

## 2. ÁNH XẠ CHÍNH XÁC DATABASE SUPABASE HIỆN CÓ
- **`leads`:** `id`, `full_name`, `email`, `phone`, `company_name`, `message`, `source`, `status`, `admin_notes`, `created_at`
- **`company_info`:** `id`, `company_name`, `brand_slogan`, `about_text`, `highlights_stats` (jsonb), `why_choose_us` (jsonb), `work_process` (jsonb), `commitments` (jsonb), `address`, `contact_email`, `contact_phone`, `working_hours` (jsonb), `copyright_text`
- **`partners`:** `id`, `name`, `logo_url`, `type`, `industry`, `website_url`, `display_order`, `created_at`
- **`pricing_plans`:** `id`, `tier_name`, `target_audience`, `price_display`, `features` (jsonb)
- **`case_studies`:** `id`, `title`, `slug`, `client_name`, `thumbnail_url`, `challenge`, `solution`, `results` (jsonb), `is_featured`, `created_at`
- **`blogs` / `blog_posts`:** `id`, `title`, `slug`, `excerpt`, `content`, `thumbnail_url`, `status`, `published_at`

---

## 3. BẢN ĐỒ NỘI DUNG 100% PUBLIC SITE (TỪ FILE KHẢO SÁT)

1. **Header & Navbar:** Logo S-Digital, Home (`#home`), About (`#about`), Services (`#services`), Why Choose Us (`#why-us`), Customers (`#customers`), Solutions (`#solutions`), Pricing (`#pricing`), Blog (`#blog`), Contact (`#contact`), Nút "Tư vấn ngay ↗".
2. **Hero Banner:**
   - Badge: "Tổ Hợp Tiếp Thị Số & Giải Pháp Thể Thao Đột Phá"
   - Tiêu đề 2 dòng: "Giải Pháp Truyền Thông &" + "Marketing" `<TypewriterTitle text="Toàn Diện" />` (chữ cam `#FF5722`).
   - Mô tả: "Chúng tôi giúp doanh nghiệp tăng trưởng bền vững - xây dựng thương hiệu - thu hút khách hàng - tối ưu chuyển đổi bằng hệ thống marketing đa kênh kết hợp với các giải pháp truyền thông thể thao chuyên nghiệp."
   - 2 Nút: "Tư Vấn Miễn Phí" (`#contact`) & "Tìm Hiểu Thêm" (`#services`).
3. **Thành Tựu Nổi Bật (Milestones):**
   - 95% - Khách Hàng Hài Lòng (Tỷ lệ khách hàng đánh giá dịch vụ xuất sắc và quay lại hợp tác)
   - 80% - Tăng Trưởng ROI (Mức tăng trưởng trung bình về lợi nhuận đầu tư cho các chiến dịch quảng cáo)
   - 90% - Dự Án Thành Công (Tỷ lệ dự án hoàn thành đúng hạn và đạt mục tiêu đề ra)
   - 85% - Tăng Nhận Diện (Mức tăng trưởng trung bình về độ nhận diện thương hiệu sau các chiến dịch)
4. **Về Chúng Tôi (About Us):**
   - H1: "Về Chúng Tôi" | H2: "Đối Tác Tin Cậy Cho Sự Phát Triển"
   - 2 đoạn giới thiệu định vị thương hiệu và 4 thẻ năng lực cốt lõi.
5. **Hệ Sinh Thái Dịch Vụ (2 Nhóm Lớn):**
   - **Nhóm 1: Marketing Số (Digital Suite):**
     + Quảng cáo Google & Facebook (Search, Display, Shopping, Youtube, FB/Instagram, Phân tích ROI).
     + Marketing KOL & KOC (Lựa chọn KOL, kịch bản sáng tạo, quản lý A-Z, đo lường).
     + Thiết Kế Website Chuyên Nghiệp (Giao diện ấn tượng, Tối ưu UX, Chuẩn SEO & Responsive, Quản lý dễ dàng).
     + Sản Xuất Video Chuyên Nghiệp (Quy trình 3 bước; 4 loại: Doanh nghiệp, MXH, TVC, Sự kiện).
     + Livestream Bán Hàng & Sự Kiện (Tư vấn setup hệ thống & Vận hành chốt đơn).
     + Xử Lý Khủng Hoảng Truyền Thông (Quy trình 5 bước: Giám sát 24/7 -> Phân tích -> Chiến lược -> Triển khai -> Phục hồi).
   - **Nhóm 2: Truyền Thông Thể Thao & Đào Tạo (Sports Hub):**
     + Tổ chức sự kiện: Giải Bóng Đá, Giải Marathon (Timing chip & y tế), Giải Đa Môn.
     + Quy trình 5 giai đoạn: Tháng 1 (Kế hoạch) -> Tháng 2-3 (Chuẩn bị & Trọng tài) -> Tháng 4 (Marketing) -> Tháng 5 (Tổ chức) -> Sau sự kiện (Đánh giá).
     + Cung cấp trọng tài quốc tế: 100+ Trọng tài, 500+ Giải đấu, 15 Năm kinh nghiệm, 98% Hài lòng (Bóng đá, Điền kinh, Bóng chuyền, Bóng rổ).
     + Đào tạo 6 môn thể thao (Bóng đá, Điền kinh, Bóng rổ, Bóng chuyền, Quần vợt, Bơi lội) & 4 khóa học (Cơ bản 3T, Trung cấp 6T, Nâng cao 12T, HLV 6-12T).
     + Đội ngũ HLV tiêu biểu (HLV Bóng đá AFC Pro 20 năm, HLV Điền kinh cựu VĐV QG, HLV Bóng rổ FIBA Level 2).
6. **Tại Sao Chọn Chúng Tôi (Why Choose Us):**
   - Điểm mạnh xử lý khủng hoảng: Phản ứng nhanh 30 phút, Kinh nghiệm 50+ ca lớn, Mạng lưới rộng.
   - 4 Trụ cột năng lực & Quy trình 5 bước làm việc chuyên nghiệp.
7. **Khách Hàng & Đối Tác Chiến Lược (Customers & Partners):**
   - 16 Khách hàng lớn: ByteDance, Vietcombank, VietinBank, MB Bank, Trung Nguyên Legend, Alibaba.com, Big C / GO!, GUMAC, Realme, YOBE, VN Ngày Nay, Lavatino, Blum, Midea, J&T Express, Hi.
   - 9 Đối tác: TenMax, Moonlight Productions, Adf.ly, Điền Quân Media, Novaon, ĐH TDTT TP.HCM, ĐH Sư Phạm Hà Nội, ĐH Sư Phạm TDTT TP.HCM, Vietnam VPC Pickleball Open Cup.
8. **Solutions, Case Study & Testimonials:**
   - 3 Testimonials từ Giám đốc Marketing Cty ABC, CEO Thời trang XYZ, Trưởng phòng PR Tập đoàn DEF.
   - Case Study Tiêu Biểu: Giải Marathon Thành Phố (5.2K Vận Động Viên, 50+ Bài Báo, 2M Lượt Xem).
9. **Gói Dịch Vụ Linh Hoạt (Pricing):**
   - Gói Cơ Bản (Từ 15 triệu/tháng) | Gói Chuyên Nghiệp (Từ 35 triệu/tháng - Phổ biến) | Gói Doanh Nghiệp (Liên hệ báo giá).
   - 4 Cam kết: Minh Bạch, Chất Lượng Đảm Bảo, Hỗ Trợ 24/7, Đổi Mới Liên Tục.
10. **Blog Tin Tức:** 3 bài viết chia sẻ kiến thức Marketing & Thể thao.
11. **Liên Hệ & Form Tiếp Nhận Leads:**
   - 101 Đường số 1, cư xá Đô Thành phường Bàn Cờ TP.HCM | Hotline: 0826 868 979 | Email: contact@s-digital.com.vn.
   - Form gửi Lead (Họ tên*, Email*, SĐT, Lời nhắn*), validate 2 chiều, loading spinner và popup thành công.

---

## 4. QUẢN TRỊ ADMIN CMS (`/admin/*`)
- `/admin`: Dashboard thống kê số lượng Leads, Doanh nghiệp, Dịch vụ, Đối tác.
- `/admin/leads`: Bảng quản lý Leads, lọc trạng thái, cập nhật trạng thái liên hệ (`NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`, `REJECTED`).
- `/admin/services`, `/admin/partners`, `/admin/pricing`, `/admin/case-studies`, `/admin/blogs`: Các module CRUD hoàn chỉnh gọi `revalidatePath('/')` sau khi cập nhật.