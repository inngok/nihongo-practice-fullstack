# Nihongo Practice

Ứng dụng Web Fullstack hỗ trợ học tiếng Nhật chuyên sâu.
Hệ thống kết hợp phương pháp học khoa học Spaced-Repetition, trí tuệ nhân tạo AI tương tác thời gian thực và phân tích dữ liệu đề thi JLPT thực tế nhằm mang lại hiệu quả học tập tối ưu.

## Điểm nhấn công nghệ và tính năng vượt trội

### 1. Học sâu nhớ lâu với thuật toán SRS (SM-2)
* Loại bỏ hoàn toàn phương pháp học vẹt truyền thống. Hệ thống tự động đo lường độ ghi nhớ của bạn trên từng thẻ Flashcard, tự tính toán và lên lịch ôn tập vào "thời điểm vàng" trước khi não bộ chuẩn bị quên, giúp ghi nhớ lâu dài với thời gian tối thiểu.

### 2. Luyện phản xạ giao tiếp tự nhiên với Trợ lý AI
* Nhập vai trực quan vào các tình huống thực tế tại Nhật Bản (tán gẫu với bạn thân, gọi mì Ramen, nhận phòng khách sạn bằng kính ngữ, hỏi đường tại Shibuya, phỏng vấn xin việc).
* AI đóng vai trò gia sư sửa lỗi trợ từ, lỗi chính tả và ngữ pháp thời gian thực, đồng thời đề xuất các mẫu câu trả lời chuẩn bản xứ để bạn tích lũy phản xạ.
* Giao diện được tối ưu hóa vượt trội trên di động bằng công nghệ chiều cao động (100dvh) và màn hình overlay nhận xét tiện lợi, tránh hoàn toàn lỗi che khuất bàn phím hay khuất nút gửi.

### 3. Học trúng trọng tâm với dữ liệu JLPT thực tế
* Phân tích và thống kê tần suất xuất hiện của từ vựng từ các đề thi JLPT thật qua các năm.
* Hệ thống xếp hạng trực quan theo mức độ ưu tiên bằng huy hiệu đặc biệt (tần suất từ 2 lần trở lên), kết hợp bộ lọc thông minh theo đợt thi giúp bạn ôn luyện đúng những gì sẽ thi.

### 4. Cá nhân hóa lộ trình với Sổ tay đa cấp
* Tạo và quản lý kho từ vựng cá nhân dưới dạng cây thư mục không giới hạn cấp độ, cho phép thêm ghi chú chi tiết và đính kèm tài liệu học tập của riêng bạn.

### 5. Trình quản trị dữ liệu thông minh
* Tự động phân tích, chuẩn hóa cấu trúc file Excel/CSV phức tạp (hỗ trợ tự động ánh xạ các định dạng cột tiếng Nhật/tiếng Việt như KANJI, CÁCH ĐỌC, Ý NGHĨA). Admin nhập hàng nghìn từ vựng cùng đợt thi chỉ trong vài giây.

## Công nghệ sử dụng

* **Frontend**: React (Vite), Tailwind CSS, Ant Design
* **Backend**: Java Spring Boot, Spring Security, JWT
* **Cơ sở dữ liệu**: PostgreSQL
* **Hạ tầng**: Docker, Docker Compose
