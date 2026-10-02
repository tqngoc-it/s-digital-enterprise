# S-Digital Enterprise Platform

> Nền tảng số hóa dịch vụ doanh nghiệp và thẩm định khách hàng tiềm năng tự động ứng dụng Trí tuệ Nhân tạo (Google Gemini AI), xây dựng trên kiến trúc Monorepo với Next.js và NestJS.

[![Production Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://s-digital-vn.vercel.app)
[![Production Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=flat&logo=google)](https://ai.google.dev/)

---

## 1. Thông Tin Triển Khai (Live Deployment)

* **Giao diện người dùng (Frontend):** https://s-digital-vn.vercel.app
* **Giao diện quản trị (Admin Portal):** https://s-digital-vn.vercel.app/admin
* **Chỉ dẫn tìm kiếm (Robots.txt):** https://s-digital-vn.vercel.app/robots.txt
* **Sơ đồ trang (Sitemap.xml):** https://s-digital-vn.vercel.app/sitemap.xml
* **Máy chủ Backend API:** Render Cloud Web Service
* **Hệ thống giám sát Uptime:** UptimeRobot HTTP Monitor (chu kỳ ping giữ ấm máy chủ 5 phút/lần)

---

## 2. Kiến Trúc Công Nghệ (Tech Stack)

### Frontend
* **Framework:** Next.js 14/15 (App Router, TypeScript)
* **Styling & UI:** Tailwind CSS, Lucide Icons
* **Triển khai:** Vercel Serverless & Edge Network

### Backend
* **Framework:** NestJS (Node.js, TypeScript)
* **Cơ sở dữ liệu:** Supabase (PostgreSQL) kết hợp REST API Client
* **Bảo mật & Điều phối:** `helmet`, `@nestjs/throttler`, CORS configuration
* **Triển khai:** Render Cloud Web Service

### Trí tuệ Nhân tạo (AI Integration)
* **Mô hình cốt lõi:** Google Gemini 1.5 Series
* **Cơ chế chịu lỗi:** Smart Fallback Engine (thuật toán đánh giá dự phòng tự động khi dịch vụ AI bên ngoài gián đoạn)

---

## 3. Các Tính Năng Trọng Tâm

### Trải nghiệm Người dùng & AI
* **Trợ lý tư vấn trực tuyến (AI Chatbot Widget):** Tiếp nhận câu hỏi của khách hàng và phản hồi theo thời gian thực (Streaming Response) tối ưu trên Next.js Route Handlers.
* **Trình đề xuất giải pháp thông minh (Smart Recommendation Wizard):** Hướng dẫn người dùng chọn quy mô, ngân sách và phân loại dịch vụ phù hợp thông qua thuật toán phân tích nhu cầu.
* **Hệ thống thẩm định Lead tự động (AI Lead Scoring):** Tự động chấm điểm độ tiềm năng (Thang điểm 100), phân hạng (*HOT / WARM / COLD*) và trích xuất tóm tắt nhu cầu khi khách hàng gửi biểu mẫu liên hệ.
* **Cơ chế chịu lỗi Smart Fallback:** Đảm bảo hệ thống vận hành liên tục; tự động chuyển đổi sang bộ quy tắc tính điểm nội bộ khi Google Gemini API phản hồi mã lỗi `503 Service Unavailable` hoặc cạn hạn mức.

### Quản trị Hệ thống (Admin Portal)
* **Quản lý Vòng đời Lead:** Tiếp nhận dữ liệu, hiển thị phân tích AI, cập nhật trạng thái xử lý và hỗ trợ chấm điểm lại (*Rescore*) thủ công.
* **Hệ thống quản lý nội dung đa phân hệ (Full CRUD):**
  * Quản trị Danh mục Dịch vụ (`services`)
  * Quản trị Bảng giá Giải pháp (`pricing`)
  * Quản trị Bài viết Tin tức (`blogs`)
  * Quản trị Dự án Tiêu biểu (`case-studies`)
  * Quản trị Đối tác Doanh nghiệp (`partners`)
  * Quản trị Chỉ số Thống kê Doanh nghiệp (`stats`)

---

## 4. Tiêu Chuẩn Kỹ Thuật & Bảo Mật

### Bảo vệ Đa tầng (Backend Hardening)
* **HTTP Security Headers (`helmet`):** Ẩn dấu vết framework (`X-Powered-By`), ngăn chặn clickjacking, ép buộc MIME sniffing protection và XSS filtering.
* **Chính sách Nguồn gốc (CORS):** Giới hạn nghiêm ngặt quyền truy xuất API chỉ từ domain Frontend được ủy quyền và môi trường phát triển cục bộ.
* **Bộ giới hạn tần suất (Rate Limiting via `ThrottlerModule`):**
  * *Global Limiter:* Tối đa 60 requests/phút trên toàn hệ thống.
  * *AI & Sensitive Endpoints:* Siết chặt tối đa 5 requests/phút cho các API tiếp nhận và thẩm định Lead (`/api/leads`, `/score`, `/rescore`) nhằm triệt tiêu nguy cơ cạn kiệt API token và tấn công DoS.

### Tối ưu Công cụ Tìm kiếm (Production SEO)
* **Sơ đồ Website tự động (`sitemap.ts`):** Tự sinh tệp XML chuẩn hóa danh mục các trang chính kèm thông số tần suất cập nhật (`changeFrequency`) và mức độ ưu tiên (`priority`).
* **Kiểm soát Thu thập Dữ liệu (`robots.ts`):** Cấp quyền lập chỉ mục toàn bộ giao diện người dùng, đồng thời chặn triệt để bot tìm kiếm cào vào khu vực quản trị (`/admin`) và các endpoint dữ liệu (`/api/`).
* **Metadata & OpenGraph (`layout.tsx`):** Cung cấp đầy đủ thẻ tiêu đề chuẩn hóa, mô tả, từ khóa và hình ảnh xem trước (OG Image 1200x630) tối ưu khi chia sẻ trên các nền tảng mạng xã hội.

---

## 5. Cấu Trúc Mã Nguồn (Repository Structure)

```text
s-digital-enterprise/
├── backend/                       # Máy chủ Backend NestJS
│   ├── src/
│   │   ├── blogs/                 # Module quản lý bài viết
│   │   ├── case-studies/          # Module quản lý dự án
│   │   ├── leads/                 # Module tiếp nhận & thẩm định Lead (AI Scoring)
│   │   ├── partners/              # Module quản lý đối tác
│   │   ├── pricing/               # Module quản lý bảng giá
│   │   ├── services/              # Module quản lý dịch vụ
│   │   ├── stats/                 # Module quản lý thống kê
│   │   ├── supabase/              # Dịch vụ tích hợp cơ sở dữ liệu Supabase
│   │   ├── app.module.ts          # Module gốc cấu hình Throttler & DI
│   │   └── main.ts                # Điểm khởi chạy hệ thống, cấu hình Helmet & CORS
│   └── package.json
│
├── frontend/                      # Ứng dụng Next.js App Router
│   ├── app/
│   │   ├── (public)/              # Các trang giao diện công khai cho người dùng
│   │   ├── admin/                 # Khu vực quản trị và dashboard
│   │   ├── api/                   # Serverless Route Handlers (Chat AI & Recommend)
│   │   ├── layout.tsx             # Root layout cấu hình Metadata & OpenGraph
│   │   ├── robots.ts              # Cấu hình bot tìm kiếm
│   │   └── sitemap.ts             # Bộ tạo sơ đồ website tự động
│   ├── components/                # UI Components tái sử dụng
│   └── package.json
│
└── README.md
```

---

## 6. Hướng Dẫn Cài Đặt Môi Trường Phát Triển Cục Bộ (Local Setup)

### 1. Yêu cầu Tiên quyết
* **Node.js**: Phiên bản >= 18.18.0
* **Trình quản lý gói**: `npm` hoặc `yarn`
* **Hệ cơ sở dữ liệu**: Đã tạo dự án trên Supabase (PostgreSQL)
* **Google AI Studio**: Đã cấp API Key cho mô hình Gemini 1.5

### 2. Tải mã nguồn về máy
```bash
git clone https://github.com/tqngoc-it/s-digital-enterprise.git
cd s-digital-enterprise
```

### 3. Khởi tạo Backend (NestJS Server)
```bash
cd backend
npm install
```

Tạo tệp `.env` tại thư mục `backend/`:
```env
PORT=8000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=<your-service-role-or-anon-key>
GEMINI_API_KEY=<your-google-gemini-api-key>
```

Khởi chạy backend:
```bash
npm run start:dev
# Backend chạy tại: http://localhost:8000
```

### 4. Khởi tạo Frontend (Next.js App Router)
```bash
cd ../frontend
npm install
```

Tạo tệp `.env.local` tại thư mục `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
GEMINI_API_KEY=<your-google-gemini-api-key>
```

Khởi chạy frontend:
```bash
npm run dev
# Website chạy tại: http://localhost:3000
# Quản trị chạy tại: http://localhost:3000/admin
```

---

## 7. Thông Tin Tác Giả & Bản Quyền (Author & License)

* **Họ và tên:** Trần Quang Ngọc
* **Vai trò:** Fullstack Developer (Next.js, NestJS, AI Integration, DevOps)
* **GitHub Profile:** [@tqngoc-it](https://github.com/tqngoc-it)
* **Mã nguồn dự án:** https://github.com/tqngoc-it/s-digital-enterprise
* **Email liên hệ:** ngoctrai1239@gmail.com
* **Mục đích:** TOPIC thực tập công nghiệp 
* **Bản quyền (License):** MIT License