# 9 BALL — Nhóm 17

Game bi-a 9 bi chơi trên trình duyệt, hỗ trợ chế độ chơi với máy, chơi với người và luyện tập.

---

## Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) phiên bản **18** trở lên
- npm (đi kèm với Node.js)

---

## Hướng dẫn cài đặt & chạy chương trình

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy ở chế độ phát triển (Development)

```bash
npm run dev
```

Mở trình duyệt và truy cập: **http://localhost:5173**

### 3. Build bản production

```bash
npm run build
```

### 4. Xem trước bản production sau khi build

```bash
npm run preview
```

---

## Cấu trúc thư mục

```
src/
├── main.tsx              # Điểm khởi đầu React
├── App.tsx               # Định nghĩa các route
└── react/
    ├── MainMenu.tsx      # Màn hình menu chính
    ├── ChooseMode.tsx    # Chọn số ván đấu
    ├── HowToPlay.tsx     # Hướng dẫn chơi
    ├── LegacyGameCanvas.tsx  # Màn hình chơi chính
    └── PracticeCanvas.tsx    # Màn hình luyện tập
```

---

## Hướng dẫn chơi

### Luật cơ bản

**9 Ball** là môn bi-a chơi với 9 bi đánh số từ 1 đến 9 và 1 bi cái (bi trắng).

| Bi | Màu |
|----|-----|
| 1 | Vàng |
| 2 | Xanh dương |
| 3 | Đỏ |
| 4 | Tím |
| 5 | Cam |
| 6 | Xanh lá |
| 7 | Nâu đỏ |
| 8 | Đen |
| 9 | Vàng sọc |

---

### Mục tiêu

Đưa **bi số 9** vào lỗ — dù là cú đánh trực tiếp hay gián tiếp (bi cái đánh bi thấp nhất, bi đó bật vào bi 9 rơi lỗ đều tính thắng ván).

---

### Cách đánh

- Trong **mỗi cú đánh**, bi cái **phải chạm bi có số nhỏ nhất** trên bàn **trước tiên**.
- Không bắt buộc phải đánh bi số nhỏ nhất vào lỗ — chỉ cần chạm nó trước, sau đó bất kỳ bi nào rơi lỗ đều hợp lệ.
- Nếu bi 9 rơi lỗ hợp lệ ở bất kỳ thời điểm nào → **thắng ván ngay lập tức**.

---

### Cách thắng trận

Chọn hình thức thi đấu:

| Chế độ | Mô tả |
|--------|-------|
| **Chạm 3** | Thắng 3 ván trước → thắng trận (trận ngắn) |
| **Chạm 5** | Thắng 5 ván trước → thắng trận (tiêu chuẩn) |
| **Chạm 7** | Thắng 7 ván trước → thắng trận (chuyên nghiệp) |

---

### Các loại lỗi (Foul)

Khi bị lỗi, đối thủ nhận được **ball in hand** (được đặt bi cái ở bất kỳ vị trí nào trên bàn).

| # | Tên lỗi | Mô tả |
|---|---------|-------|
| 1 | **Đánh chết cái** | Bi cái rơi xuống lỗ (scratch) — lỗi dù có chạm đúng bi thấp nhất trước hay không |
| 2 | **Không chạm bi thấp nhất trước** | Bi cái chạm bi có số lớn hơn trước bi nhỏ nhất |
| 3 | **Không chạm bi nào** | Bi cái không chạm bất kỳ bi nào trong cú đánh |
| 4 | **Không có bi chạm thành sau tiếp xúc** | Sau khi bi cái chạm bi, không có bi nào (kể cả bi cái) chạm thành bàn, và không có bi nào rơi lỗ |
| 5 | **Không đủ bi chạm thành khi phá** | Trong cú phá bóng (cú đầu tiên), ít hơn 4 bi chạm thành bàn |

> **Lỗi liên tiếp:** Nếu một người chơi phạm lỗi **3 lần liên tiếp**, ván đó kết thúc và đối thủ thắng ván.

---

### Điều khiển

#### Máy tính (Desktop)

| Thao tác | Mô tả |
|----------|-------|
| **Di chuyển chuột** | Xoay góc đánh |
| **Kéo thanh lực** | Điều chỉnh lực đánh |
| **Click & kéo bi cái** | Đặt bi cái (khi được ball in hand) |
| **Click vào vòng tròn spin** | Cài đặt hiệu ứng xoáy (spin/English) |

#### Thiết bị cảm ứng (Mobile/Tablet)

| Thao tác | Mô tả |
|----------|-------|
| **Chạm & kéo** | Xoay góc đánh / kéo thanh lực |
| **Chạm bi cái & kéo** | Đặt bi cái (khi được ball in hand) |

---

### Các chế độ chơi

| Chế độ | Mô tả |
|--------|-------|
| **Chơi với máy** | Đấu 1 vs 1 với AI |
| **Chơi với người** | Đấu 2 người trên cùng 1 thiết bị |
| **Luyện tập** | Tự do luyện kỹ thuật, không tính điểm, bi 9 tự hồi sau khi rơi lỗ |

---

### Mẹo chơi

- Luôn tính trước **vị trí bi cái** sau cú đánh để thuận lợi cho cú tiếp theo.
- Không cần đánh thẳng vào bi thấp nhất — có thể đánh bi thấp nhất nhẹ để **điều hướng bi 9** vào lỗ.
- Khi còn ít bi, ưu tiên **kiểm soát vị trí** hơn là cố đánh bi vào lỗ.
- Sử dụng **spin (xoáy)** để thay đổi quỹ đạo bi cái sau va chạm.
