# S-DIGITAL ENTERPRISE · CODE REVIEW & TECHNICAL ARCHITECTURE GUIDE
> **Tài liệu chuẩn bị thuyết trình kỹ thuật & Kịch bản phản biện kiến trúc hệ thống**  
> **Dự án:** S-Digital Media & Sports Platform  
> **Phiên bản:** v1.2.0 (Giai đoạn MVP & Tích hợp Bộ 3 Module Trí Tuệ Nhân Tạo)  
> **Ngày cập nhật:** 05/09/2026  

---

## MỤC LỤC TỔNG QUAN
1. [Bối cảnh kiến trúc & Lộ trình tái cấu trúc (Architectural Context & Roadmap)](#1-bối-cảnh-kiến-trúc--lộ-trình-tái-cấu-trúc)
2. [Bản đồ mã nguồn & Vai trò các tệp (Source Code Map)](#2-bản-đồ-mã-nguồn--vai-trò-các-tệp)
3. [Chi tiết kỹ thuật 3 Module Phân tích & Xử lý Nghiệp vụ](#3-chi-tiết-kỹ-thuật-3-module-phân-tích--xử-lý-nghiệp-vụ)
4. [Nguyên tắc thiết kế & Chuẩn hóa Doanh nghiệp (Enterprise Standards)](#4-nguyên-tắc-thiết-kế--chuẩn-hóa-doanh-nghiệp)
5. [Bộ câu hỏi & Kịch bản phản biện khi Review Code (Mock Q&A)](#5-bộ-câu-hỏi--kịch-bản-phản-biện-khi-review-code)

---

## 1. BỐI CẢNH KIẾN TRÚC & LỘ TRÌNH TÁI CẤU TRÚC

### 1.1. Thực trạng Kiến trúc Hiện tại: Next.js App Router BFF / Monolith
Hiện tại, toàn bộ các tác vụ CRUD dữ liệu nền tảng và các API Route thẩm định/phân tích đều được đặt trực tiếp bên trong thư mục `frontend/app/api/*` và `frontend/app/actions/*`.

```
[Client Browser]
       │
       ▼ (Same-Origin HTTPS)
┌─────────────────────────────────────────────────────────┐
│ Next.js App Router (frontend/) - BFF Pattern           │
│  ├─ Server Components (SSR / ISR / Dynamic Rendering)   │
│  ├─ Server Actions (app/actions/* - Safe Mutations)     │
│  └─ Route Handlers (app/api/* - REST Endpoints)         │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼ (Server-to-Server)         ▼ (REST API HTTPS)
┌──────────────────────────────┐ ┌───────────────────────────┐
│  Supabase Managed Database   │ │  Google Gemini 3.7 Flash  │
│  PostgreSQL (Tables, RLS)    │ │  Generative AI REST API   │
└──────────────────────────────┘ └───────────────────────────┘
```

### 1.2. Lý do Kỹ thuật cho Quyết định Giai đoạn MVP
1. **Tối ưu hóa Thời gian ra mắt (Time-to-Market)**:
   - Tận dụng sức mạnh toàn diện của Next.js 16+ App Router với cơ chế Backend-for-Frontend (BFF).
   - Rút ngắn chu kỳ phát triển sản phẩm mà không cần duy trì 2 quy trình CI/CD và 2 hạ tầng máy chủ riêng biệt trong giai đoạn thử nghiệm thị trường.
2. **Loại bỏ rủi ro nghẽn CORS & Network Latency**:
   - Mọi request từ giao diện khách hàng (Client UI) tới API xử lý đều là **Same-Origin request**.
   - Triệt tiêu 100% các lỗi phức tạp về CORS preflight request (`OPTIONS`), tiết kiệm 1 vòng RTT (Round Trip Time), mang lại phản hồi nhanh nhất cho người dùng.
3. **Bảo toàn tính nhất quán kiểu dữ liệu (End-to-End Type Safety)**:
   - TypeScript interface (`LeadItem`, `RecommendRequest`, `ScoreLeadResponse`) được chia sẻ trực tiếp giữa Client UI, Server Actions và Route Handlers mà không cần công cụ build schema trung gian.
4. **On-Demand Cache Revalidation**:
   - Sử dụng trực tiếp `revalidatePath('/')` ngay trong các Server Actions để cập nhật landing page tức thì khi quản trị viên chỉnh sửa nội dung, không cần trigger webhook phức tạp từ backend ngoài.

### 1.3. Lộ trình Refactor sang Kiến trúc Phân tầng Độc lập (Giai đoạn tiếp theo)
Thư mục `backend/` trong dự án đã được khởi tạo bằng **NestJS 11** với các module cơ sở (`AppModule`, `SupabaseModule`, `LeadsModule`). Kế hoạch di chuyển chi tiết như sau:

```
[Next.js Client]  ───(JSON REST/gRPC)───►  [NestJS Backend Gateway]
                                                    │
                   ┌────────────────────────────────┴───────────────────────────────┐
                   ▼                                                                ▼
         ┌───────────────────┐                                            ┌───────────────────┐
         │ LeadsService      │                                            │ ScoringService    │
         │ - Input Validation│                                            │ - Gemini Engine   │
         │ - Supabase ORM    │                                            │ - BullMQ Worker   │
         └───────────────────┘                                            └───────────────────┘
```

* **Bước 1**: Di chuyển logic xác thực và lưu trữ Lead từ `frontend/app/actions/leads.ts` sang `backend/src/leads/leads.service.ts`.
* **Bước 2**: Tách endpoint `/api/admin/score-lead` thành `ScoringService` trong NestJS.
* **Bước 3**: Tích hợp hàng đợi bất đồng bộ **BullMQ + Redis** tại backend để chấm điểm Lead nền (Background Processing), đảm bảo request gửi form của khách hàng luôn phản hồi dưới 200ms mà không phải chờ API thẩm định.
* **Bước 4**: Thiết lập Webhook Gateway tự động gửi thông báo Leads tiềm năng cao về nhóm Telegram / Zalo Doanh nghiệp của ban lãnh đạo S-Digital.

---

## 2. BẢN ĐỒ MÃ NGUỒN & VAI TRÒ CÁC TỆP

| Đường dẫn tệp | Vai trò kiến trúc | Trách nhiệm kỹ thuật chính |
| :--- | :--- | :--- |
| `frontend/app/api/chat/route.ts` | **AI Route Handler** | Tiếp nhận câu hỏi tư vấn từ widget chat, kết nối Gemini REST API với bối cảnh thương hiệu, điều phối câu trả lời. |
| `frontend/lib/ai/knowledgeBase.ts` | **Domain Knowledge Base** | Nguồn tri thức doanh nghiệp độc quyền: Năng lực số (Digital Suite), điều hành thể thao (Sports Hub), thông số giải Marathon AIMS, mạng lưới 100+ trọng tài AFC/FIBA, quy trình xử lý khủng hoảng 30 phút. |
| `frontend/app/api/recommend/route.ts` | **AI Strategic Planner** | Tiếp nhận 4 trường thông tin bài toán khách hàng (ngành nghề, mục tiêu, ngân sách, ghi chú); trả về gói giải pháp chuẩn JSON; fallback ma trận 5 kịch bản. |
| `frontend/app/api/admin/score-lead/route.ts` | **AI Lead Scoring Engine** | Tiếp nhận hồ sơ khách gửi từ Website; đóng vai Giám đốc Kinh doanh B2B thẩm định thang điểm 0-100; phân loại mức tiềm năng; trích xuất kịch bản tư vấn và giá trị hợp đồng. Tích hợp Smart Fallback Matrix. |
| `frontend/app/admin/page.tsx` | **Admin Dashboard Overview** | Trang tổng quan hệ thống hiển thị 6 khối KPI thời gian thực kết nối Supabase, tuyệt đối không chứa dữ liệu mock cứng, tối ưu On-Demand Revalidation. |
| `frontend/app/admin/leads/page.tsx` | **Server Page Wrapper** | Truy vấn dữ liệu thực từ bảng `leads` của Supabase bằng `createServerSupabaseClient()`, chuyển dữ liệu an toàn xuống Client Component. |
| `frontend/app/admin/leads/LeadsClient.tsx` | **Leads Management UI** | Giao diện điều hành danh sách liên hệ thực tế: Bộ lọc tìm kiếm & mức tiềm năng, cột thẩm định chất lượng, hiển thị thanh điểm tiến độ, Modal chi tiết cơ hội và trigger thẩm định on-demand. |

---

## 3. CHI TIẾT KỸ THUẬT 3 MODULE PHÂN TÍCH & XỬ LÝ NGHIỆP VỤ

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                BỘ 3 MODULE THẨM ĐỊNH & TƯ VẤN                          │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ MODULE 1: TƯ VẤN 24/7    │ MODULE 2: HOẠCH ĐỊNH GÓI    │ MODULE 3: THẨM ĐỊNH LEAD B2B  │
│ (/api/chat)              │ (/api/recommend)            │ (/api/admin/score-lead)       │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Hội thoại đa tầng      │ • Khảo sát 3 bước trực quan │ • Thang điểm chuẩn: 0 - 100   │
│ • Bối cảnh S-Digital B2B │ • JSON Mode cưỡng chế       │ • Phân cấp chuẩn doanh nghiệp │
│ • Phòng thủ 3 lớp sâu    │ • Fallback ma trận 5 nhánh  │ • Kịch bản tiếp cận (15p/2h)  │
│ • Định tuyến Hotline     │ • Không chứa emoji          │ • Giá trị hợp đồng ước tính   │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

### 3.1. Module 1: Trợ lý Hội thoại Tư vấn Trực tuyến 24/7 (`/api/chat`)
* **Kiến trúc**: Stateful Multi-turn Conversation, duy trì lịch sử hội thoại dạng mảng `{ role, content }[]`.
* **Cơ chế Phòng thủ 3 Bước (3-Layer Resilience Architecture)**:
  1. **Lớp 1 (Primary)**: Google Gemini API qua endpoint `gemini-3.7-flash` trực tiếp bằng REST fetch với timeout signal 15 giây.
  2. **Lớp 2 (Model Fallback)**: Tự động đảo sang model dự phòng `gemini-2.5-flash` nếu model chính gặp lỗi khu vực hoặc quá tải.
  3. **Lớp 3 (Rule-based Fallback)**: Kích hoạt bộ phản hồi nội bộ chuẩn hóa từ `knowledgeBase.ts`, điều hướng người dùng tới hotline `0826 868 979`, đảm bảo người dùng không bao giờ thấy lỗi crash.

### 3.2. Module 2: Hoạch định Gói Giải pháp Chiến lược (`/api/recommend`)
* **Quy trình Khảo sát 3 bước**: Tiếp nhận thông số từ Wizard (Ngành nghề $\rightarrow$ Mục tiêu $\rightarrow$ Mức ngân sách).
* **Cấu hình Gemini Engine**:
  ```typescript
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 1000,
    responseMimeType: 'application/json', // Buộc mô hình trả về JSON thuần túy
  }
  ```
* **Hàm làm sạch & Parser**: Áp dụng Regex bóc tách chuỗi Markdown fence (````json ... ````) trước khi `JSON.parse()`.
* **Ma trận Fallback định sẵn 5 Kịch bản (`computeSmartFallback`)**:
  - *Nhánh Thể thao / Marathon*: Đề xuất gói AIMS + chip timing + trọng tài quốc tế (từ 45tr).
  - *Nhánh Khủng hoảng*: Đề xuất gói trực chiến 24/7 phản ứng 30 phút (từ 30tr).
  - *Nhánh Ngân sách < 20tr*: Đề xuất gói Starter (từ 15tr/tháng).
  - *Nhánh Ngân sách > 100tr*: Đề xuất gói Enterprise Omni-channel may đo.
  - *Nhánh Tiêu chuẩn 20-100tr*: Đề xuất gói Growth (từ 35tr/tháng - phổ biến nhất).

### 3.3. Module 3: Thẩm định Điểm số & Phân loại Cơ hội B2B (`/api/admin/score-lead`)
* **Mô hình thẩm định**: Đóng vai Giám đốc Kinh doanh B2B cấp cao của S-Digital thẩm định độ sẵn sàng ký kết của Lead.
* **Tiêu chí chấm điểm & Trọng số nghiệp vụ**:
  $$\text{Score} = \text{Xác thực liên hệ (25\%)} + \text{Quy mô ngân sách (35\%)} + \text{Độ phù hợp dịch vụ (20\%)} + \text{Mức độ cấp thiết (20\%) }$$
* **Chuẩn hóa Phân cấp Doanh nghiệp (Lead Tiers)**:
  - **Tiềm năng cao** (Điểm 75 - 100): Hồ sơ doanh nghiệp rõ ràng, ngân sách lớn, nhu cầu cấp bách. Kịch bản yêu cầu Trưởng phòng B2B gọi trong 15 phút.
  - **Tiềm năng** (Điểm 45 - 74): Nhu cầu thực tế, ngân sách tầm trung, cần tư vấn định hướng thêm trong 2 giờ.
  - **Ít tiềm năng** (Điểm 0 - 44): Thông tin sơ sài, thiếu SĐT hoặc công ty, ngân sách quá thấp hoặc nội dung không rõ ràng. Đưa vào luồng email tự động.
* **Smart Heuristic Fallback**: Khi không có API Key hoặc API bận, thuật toán nội bộ tự động phân tích:
  - Tên miền email (phân biệt email doanh nghiệp riêng vs gmail/yahoo/hotmail).
  - Định dạng số điện thoại hợp lệ qua Regex.
  - Từ khóa dịch vụ giá trị cao (marathon, thể thao, khủng hoảng, kols, tvc).
  - Độ dài lời nhắn để tính điểm chính xác và trả về đầy đủ JSON theo hợp đồng dữ liệu.

---

## 4. NGUYÊN TẮC THIẾT KẾ & CHUẨN HÓA DOANH NGHIỆP

### 4.1. Phong cách Thẩm mỹ Dark Tech B2B
- Giao diện quản trị nhất quán với gam màu tối công nghệ cao:
  - Nền bảng và container: `#0B0F19` kết hợp `#070A10`.
  - Đường viền và phân cách: `border-slate-800` và `border-white/10`.
  - Chữ hiển thị: `text-white` (tiêu đề), `text-slate-300` (nội dung), `text-slate-500` (meta).
  - Điểm nhấn thương hiệu: Màu cam cháy `#FF5722` (S-Digital Accent) và xanh Cyan `#00E5FF`.

### 4.2. Triệt tiêu Hoàn toàn Từ ngữ Kỹ thuật & Emoji
Theo yêu cầu khắt khe của môi trường B2B chuyên nghiệp:
- **Loại bỏ 100% biểu tượng cảm xúc (emoji)** khỏi phản hồi của hệ thống và giao diện quản trị.
- **Xóa bỏ các từ ngữ mang tính rập khuôn**: Không sử dụng các từ "AI", "Robot", "Model AI" trên giao diện Admin Leads.
- **Chuẩn hóa thuật ngữ kinh doanh**:
  - Cột thẩm định: **"Thẩm định chất lượng"** (kèm điểm `xx/100` và thanh tiến độ).
  - Badge phân cấp: **"Tiềm năng cao"** / **"Tiềm năng"** / **"Ít tiềm năng"**.
  - Tiêu đề modal: **"Thẩm định cơ hội & Đề xuất tiếp cận"**.
  - Khối phân tích: **"Nhận định nhu cầu"** và **"Kịch bản tư vấn đề xuất"**.

### 4.3. Loại bỏ Toàn bộ Dữ liệu Giả lập (Zero Mock Data)
- Toàn bộ danh sách Lead cứng (hardcoded mock data) đã được dọn sạch hoàn toàn khỏi mã nguồn.
- Trang Quản trị Leads chỉ kết nối trực tiếp với nguồn dữ liệu thực từ bảng Supabase.
- **Xử lý Empty State trang nhã**: Khi chưa có dữ liệu từ Website, hệ thống hiển thị thông báo tối giản:
  > *"Chưa có liên hệ mới từ khách hàng. Dữ liệu sẽ xuất hiện khi có khách gửi yêu cầu từ Website."*

---

## 5. BỘ CÂU HỎI & KỊCH BẢN PHẢN BIỆN KHI REVIEW CODE

Dưới đây là 6 câu hỏi kỹ thuật cốt lõi thường gặp nhất trong các buổi Code Review cùng câu trả lời chuẩn xác:

---

### Câu hỏi 1: Tại sao toàn bộ API Route lại đặt ở `frontend/app/api` mà không viết ở `backend/`?
> **Câu trả lời phản biện:**  
> *"Dự án hiện đang áp dụng kiến trúc **BFF (Backend-For-Frontend)** tích hợp sẵn trong Next.js App Router cho Giai đoạn 1 (MVP). Việc này mang lại 3 lợi thế chiến lược:*  
> 1. *Giảm thiểu rủi ro nghẽn CORS và tiết kiệm 1 bước mạng (network hop) giữa trình duyệt và server trung gian.*  
> 2. *Tận dụng sức mạnh full-stack TypeScript để chia sẻ trực tiếp Data Transfer Object (DTO) giữa form giao diện và Route Handler, loại bỏ sự sai lệch schema.*  
> 3. *Đồng thời, tại thư mục `backend/`, chúng em đã xây dựng nền tảng sẵn có bằng NestJS (`LeadsModule`, `SupabaseModule`). Trong Giai đoạn 2, các logic xử lý nghiệp vụ nặng và AI background processing sẽ được tách sang NestJS kết hợp cùng hàng đợi BullMQ để mở rộng quy mô độc lập."*

---

### Câu hỏi 2: Nếu Gemini API bị nghẽn mạng, gặp lỗi 429 (Rate Limit) hoặc mất kết nối thì hệ thống có bị treo không?
> **Câu trả lời phản biện:**  
> *"Hệ thống được thiết kế theo nguyên tắc **Graceful Degradation (Suy thoái mềm)** với cơ chế bảo vệ đa tầng:*  
> 1. *Mọi lời gọi `fetch` đến Gemini REST API đều được gắn `signal: AbortSignal.timeout(15000)` để ngăn ngừa request bị treo vô hạn.*  
> 2. *Toàn bộ khối gọi bên ngoài đều bọc trong `try...catch`. Ngay khi bắt được lỗi (HTTP 429, 500, timeout, hoặc thiếu API Key), hàm sẽ ngay lập tức kích hoạt **Smart Fallback Matrix** (`computeSmartLeadScore` / `computeSmartFallback`).*  
> 3. *Thuật toán nội bộ sẽ tự động phân tích dữ liệu đầu vào (domain email, SĐT, ngân sách, từ khóa dịch vụ) để tạo ra kết quả JSON hợp lệ 100%, đảm bảo hệ thống luôn phản hồi mượt mà và người dùng không bao giờ gặp lỗi crash."*

---

### Câu hỏi 3: Làm sao đảm bảo mô hình Generative AI luôn trả về định dạng JSON hợp lệ để hệ thống parse an toàn?
> **Câu trả lời phản biện:**  
> *"Chúng em áp dụng cơ chế 3 lớp bảo vệ cấu trúc:*  
> 1. *Ở tầng API config: Thiết lập `responseMimeType: 'application/json'` trong `generationConfig`, buộc Gemini chỉ xuất cú pháp JSON.*  
> 2. *Ở tầng System Prompt: Quy định schema JSON tường minh và cấm hoàn toàn ký tự thừa.*  
> 3. *Ở tầng Parser: Viết hàm chuyên dụng `parseGeminiScoreResponse` sử dụng Regex để loại bỏ các đoạn bọc markdown (````json ... ````), kiểm tra các trường bắt buộc (`score`, `tier`, `summary`, `actionPlan`), đồng thời ép kiểu an toàn (clamp điểm số từ 0 - 100). Nếu chuỗi không parse được, hệ thống tự động chuyển sang Fallback heuristic mà không làm sập ứng dụng."*

---

### Câu hỏi 4: Dữ liệu nhạy cảm như API Key được bảo mật thế nào? Có nguy cơ bị lộ xuống Client không?
> **Câu trả lời phản biện:**  
> *"API Key được bảo vệ tuyệt đối theo quy chuẩn bảo mật của Next.js:*  
> 1. *Biến môi trường `GEMINI_API_KEY` chỉ được đọc trong Server Context (`process.env.GEMINI_API_KEY`) tại các Route Handlers thuộc thư mục `frontend/app/api/*`.*  
> 2. *Các Route Handlers chạy hoàn toàn trên Node.js runtime của máy chủ, mã nguồn và biến môi trường không bao giờ được đóng gói vào client-side JavaScript bundle.*  
> 3. *Phía Client Component (`LeadsClient.tsx`) chỉ gọi endpoint nội bộ (`/api/admin/score-lead`) thông qua HTTP POST nội bộ, hoàn toàn không tiếp xúc trực tiếp với API Key của Google."*

---

### Câu hỏi 5: Tiêu chí chấm điểm của Module Thẩm định Lead có bị thiên vị quá mức vào ngân sách không?
> **Câu trả lời phản biện:**  
> *"Thang điểm 100 được phân bổ theo ma trận trọng số kinh doanh B2B cân bằng:*  
> - *Tính xác thực liên hệ (25%): Đánh giá email tên miền doanh nghiệp, số điện thoại hợp lệ và tên công ty cụ thể.*  
> - *Quy mô ngân sách (35%): Phân cấp khả năng chi trả phù hợp với các gói Starter (15tr), Growth (35tr) hay Enterprise (>100tr).*  
> - *Độ tương thích dịch vụ (20%): Kiểm tra nhu cầu có khớp với thế mạnh cốt lõi của S-Digital hay không (Tổ chức Marathon chuẩn AIMS, trọng tài quốc tế, xử lý khủng hoảng, Performance Ads).*  
> - *Mức độ cấp thiết & chi tiết (20%): Độ dài và mức độ cụ thể trong bài toán kinh doanh của khách.*  
> *Nhờ đó, một khách hàng có ngân sách vừa phải nhưng thông tin doanh nghiệp minh bạch và bài toán rõ ràng vẫn đạt mức Tiềm năng cao (HOT) để đội ngũ kinh doanh ưu tiên chăm sóc."*

---

### Câu hỏi 6: Dữ liệu trên bảng Admin Leads hiện tại lấy từ đâu? Làm sao để kiểm chứng một Lead thực tế trong buổi demo?
> **Câu trả lời phản biện:**  
> *"Dữ liệu trên bảng Admin Leads hiện tại được lấy **100% từ bảng `leads` trong cơ sở dữ liệu Supabase** thông qua hàm `createServerSupabaseClient()` tại `frontend/app/admin/leads/page.tsx`.*  
> *Toàn bộ dữ liệu mock cứng đã bị gỡ bỏ hoàn toàn. Nếu cơ sở dữ liệu trống, hệ thống sẽ hiển thị giao diện Empty State chuẩn mực.*  
> *Để kiểm chứng trực tiếp trong buổi Review:*  
> 1. *Mở trang chủ Landing Page và cuộn xuống mục Form Liên Hệ.*  
> 2. *Điền thông tin một khách hàng doanh nghiệp thực tế và ấn gửi.*  
> 3. *Truy cập trang Quản lý Leads (`/admin/leads`), lead mới sẽ xuất hiện ngay lập tức.*  
> 4. *Bấm nút **'Thẩm định ngay'**, hệ thống sẽ gọi API `/api/admin/score-lead`, chấm điểm và cập nhật badge 'Tiềm năng cao/Tiềm năng/Ít tiềm năng' cùng kịch bản tư vấn chi tiết trong Modal trong vòng chưa tới 2 giây."*

---

## TỔNG KẾT
Tài liệu này đóng vai trò là kim chỉ nam kỹ thuật cho toàn bộ nhóm phát triển S-Digital Media & Sports. Khi trình bày, hãy nhấn mạnh vào **tính thực chiến**, **khả năng chống chịu lỗi cao (Resilience)** và **tư duy kiến trúc mở đường cho microservices giai đoạn tiếp theo**.
