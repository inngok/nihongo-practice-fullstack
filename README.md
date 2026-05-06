# Nihongo Practice App

Nihongo Practice App là một nền tảng học tiếng Nhật Fullstack hiện đại, sở hữu giao diện tối giản theo trường phái Typographical (tập trung vào kiểu chữ và trải nghiệm đọc), loại bỏ các yếu tố đồ họa rườm rà để người học đạt được mức độ tập trung tối đa.

---

## Điểm Đặc Trưng Của Dự Án

### 1. Thuật Toán Ôn Tập Giãn Cách (Spaced-Repetition System - SRS)
* Ghi nhớ tối đa: Tích hợp thuật toán SM-2 (SuperMemo-2) tối ưu hóa, tự động tính toán thời gian lặp lại của từng thẻ ghi nhớ dựa trên mức độ tự đánh giá của người học (Quên, Khó, Nhớ, Rất tốt).
* Tiết kiệm thời gian: Hệ thống chỉ hiển thị những từ vựng hoặc chữ Hán thực sự đến hạn cần ôn tập hàng ngày, giúp ghi nhớ sâu mà không bị quá tải.

### 2. Thiết Kế Đa Phân Loại Giáo Trình (Multi-Category Textbooks)
* Không trùng lặp: Cho phép một giáo trình đồng thời thuộc nhiều phân loại học tập khác nhau (Ví dụ: sách vừa chứa Từ Vựng và Ngữ Pháp).
* Phân luồng thông minh: Sách tự động xuất hiện ở các trang học tập tương ứng, giúp người học tiếp cận toàn diện nội dung sách mà quản trị viên không cần nhân bản dữ liệu trong Database.

### 3. Trình Nhập Dữ Liệu Tự Động Hóa (Smart AI Importer)
* Xử lý thông minh: Sử dụng sức mạnh của mô hình AI để tự động phân tích, chuẩn hóa và phân mục các văn bản tiếng Nhật thô hoặc tài liệu chụp từ sách thành định dạng dữ liệu chuẩn, sẵn sàng đưa vào hệ thống học tập.

### 4. Triết Lý Thiết Kế Tối Giản (Minimalist Aesthetics)
* Không xao nhãng: Giao diện được thiết kế phẳng, loại bỏ hoan toàn các biểu tượng không cần thiết, tập trung 100% vào sự rõ ràng của mặt chữ và bố cục phẳng sang trọng.

---

## Công Nghệ Sử Dụng

* Frontend: React (Vite) - Đảm bảo tốc độ tải trang nhanh, mượt mà và khả năng chia sẻ thành phần linh hoạt.
* Styling: Vanilla CSS kết hợp TailwindCSS - Tạo dựng hệ thống giao diện phẳng, tối giản.
* Backend: Java Spring Boot - Kiến trúc phân lớp vững chắc, hiệu năng cao và xử lý logic nghiệp vụ an toàn.
* Security: Spring Security & JWT - Đăng ký, đăng nhập bảo mật bằng cơ chế mã hóa Tokens (Access & Refresh Token).
* Database: PostgreSQL - Cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ và đồng bộ dữ liệu học tập nhất quán.

---

## Hướng Dẫn Khởi Chạy Local

### 1. Khởi Chạy Backend (Spring Boot)
1. Tạo một cơ sở dữ liệu trống trên PostgreSQL.
2. Cấu hình thông tin kết nối database của bạn trong file: `practice-nihongo-backend/src/main/resources/application.properties`.
3. Chạy lệnh:
   ```bash
   cd practice-nihongo-backend
   .\mvnw.cmd clean spring-boot:run
   ```

### 2. Khởi Chạy Frontend (React Vite)
1. Chạy lệnh cài đặt và khởi động:
   ```bash
   cd practice-nihongo-frontend
   npm install
   npm run dev
   ```

---
Nền tảng học tập và phát triển dự án tiếng Nhật hiệu quả.
