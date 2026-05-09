# Nihongo Practice App

Một nền tảng học tiếng Nhật Fullstack hiện đại với thiết kế tối giản, tập trung tối đa vào trải nghiệm đọc và học tập.

## Tính năng nổi bật

* **Spaced-Repetition System (SRS):** Tích hợp thuật toán SM-2 tối ưu hóa thời gian lặp lại của flashcard, giúp ghi nhớ lâu và tiết kiệm thời gian ôn tập.
* **Sổ Tay Cá Nhân (Personal Notebook):** Lưu trữ từ vựng linh hoạt với hệ thống thư mục đa cấp (hỗ trợ tạo thư mục con, thêm ghi chú ngày tháng và đính kèm link tài liệu).
* **Quản Lý Giáo Trình Thông Minh:** Hỗ trợ đa phân loại (Từ vựng, Ngữ pháp, Kanji) trên cùng một tài liệu học mà không cần nhân bản dữ liệu.
* **AI Smart Importer:** Tích hợp AI để tự động trích xuất, chuẩn hóa và nhập dữ liệu bài học nhanh chóng.

## Công nghệ sử dụng

* **Frontend:** React (Vite), Tailwind CSS (Giao diện phẳng, tối giản).
* **Backend:** Java Spring Boot (RESTful API), Spring Security & JWT (Xác thực).
* **Database:** PostgreSQL.

## Khởi chạy dự án (Local)

### 1. Backend
1. Tạo database trống trên PostgreSQL.
2. Cấu hình kết nối trong `practice-nihongo-backend/src/main/resources/application.properties`.
3. Khởi chạy:
   ```bash
   cd practice-nihongo-backend
   ./mvnw clean spring-boot:run
   ```

### 2. Frontend
1. Cài đặt dependencies và chạy dev server:
   ```bash
   cd practice-nihongo-frontend
   npm install
   npm run dev
   ```
