# 🎈 HọcVui - Nền Tảng Giảng Dạy Tương Tác & Gamification Tiểu Học

**HọcVui** là ứng dụng web tương tác trực quan được thiết kế chuyên biệt cho giáo viên và học sinh tiểu học (Lớp 1 đến Lớp 5). Nền tảng kết hợp các công cụ trò chơi hóa (vòng quay may mắn, hộp quà bí mật, thẻ bài ma thuật, đồng hồ đếm ngược sinh động, pháo hoa ngôi sao) và phân hệ quản lý lớp học từ file Excel.

---

## ✨ Điểm nổi bật

1. **🏫 Quản lý Lớp & Học sinh**:
   - Nhập danh sách học sinh từ file **Excel (.xlsx, .xls)** hoặc **CSV** chỉ với 1 thao tác kéo thả.
   - Hỗ trợ tải file Excel mẫu chuẩn sẵn.
   - Tự động gán hình đại diện con vật ngộ nghĩnh (🐶, 🐱, 🦁, 🦄, 🐼...).
   - Chỉnh sửa, thêm bớt học sinh trực tiếp trên giao diện dạng thẻ lưới hoặc bảng chi tiết.
   - Hệ thống đếm sao thưởng tích lũy cho từng em.

2. **🎡 Bộ Công cụ Giảng dạy Tương tác (Interactive Teaching Suite)**:
   - **3 chế độ chọn học sinh ngẫu nhiên**:
     - 🎡 **Vòng quay may mắn (Lucky Wheel)**: Canvas quay mượt mà với âm thanh tạch tạch và kim chỉ chuẩn xác.
     - 🎁 **Hộp quà bí mật (Mystery Gift Box)**: Hộp quà 3D rung lắc rồi bật mở tên học sinh.
     - 🎴 **Lá bài ma thuật (Card Flip)**: Xáo bài và lật thẻ bài may mắn.
   - **Chế độ "Không gọi trùng"**: Học sinh đã được gọi sẽ tự động được loại trừ trong buổi học để đảm bảo công bằng cho cả lớp.
   - **Đọc tên học sinh bằng giọng nói (Text-to-Speech)** qua loa máy tính/lớp học.

3. **🖥️ Màn hình Trình chiếu Máy chiếu & TV (Presentation Stage)**:
   - Chế độ toàn màn hình (Fullscreen) tương phản cao, phông chữ lớn chống lóa mắt.
   - **Đồng hồ đếm ngược (Countdown Timer)**: Các mốc 10s, 15s, 30s, 45s, 60s có âm thanh tíc-tắc hồi hộp và chuông báo hết giờ.
   - Hiển thị 4 lựa chọn trắc nghiệm sắc màu và nút **"Hiện Đáp Án"** kèm giải thích chi tiết.
   - Chấm điểm và khen thưởng 1-click trực tiếp trên màn chiếu:
     - ⭐ **+1 Sao (Đúng rồi)**: Kèm âm thanh ting-ting và pháo hoa ngôi sao.
     - 🌟 **+2 Sao (Xuất sắc)**: Kèm âm thanh chúc mừng hoành tráng và pháo hoa đại tiệc.
     - 👏 **Cố lên**: Âm thanh vỗ tay khích lệ tinh thần.

4. **📚 Ngân hàng Bài tập & Câu hỏi Phân cấp**:
   - Cấu trúc cây thư mục theo **Môn học** (Toán, Tiếng Việt, Tự nhiên & Xã hội, Tiếng Anh, Đạo đức...), **Khối lớp (1-5)** và **Mức độ khó** (🟢 Dễ - 🟡 Vừa - 🔴 Thử thách).
   - Tích hợp sẵn bộ câu hỏi mẫu phong phú để thầy cô dùng được ngay.

5. **🏆 Bảng Vinh Danh & Xuất Báo Cáo (Hall of Fame)**:
   - Bục vinh danh Podium (Quán quân 👑, Hạng nhì 🥈, Hạng ba 🥉) cho các bạn có nhiều sao nhất.
   - Xuất bảng tổng kết điểm sao của lớp ra file **Excel (.xlsx)** để báo cáo phụ huynh hoặc tổng kết tuần.

6. **⚡ Offline-First & Sao Lưu An Toàn**:
   - Hoạt động 100% không phụ thuộc Internet trên lớp học.
   - Bộ âm thanh tổng hợp trực tiếp bằng Web Audio API không cần tải file ngoài.
   - Tính năng xuất/nhập file sao lưu JSON tiện lợi khi đổi máy tính.

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Yêu cầu hệ thống
- Node.js version 18+ (khuyên dùng Node 20 hoặc 22+)
- Trình duyệt hiện đại: Chrome, Edge, Safari, Firefox...

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

### 4. Đóng gói bản Production
```bash
npm run build
npm start
```
