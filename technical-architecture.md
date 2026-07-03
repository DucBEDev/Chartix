# Kiến trúc Kỹ thuật: Tích hợp Dữ liệu & AI cho Chartix

Tài liệu này mô tả chi tiết cách vận hành hệ thống, lấy dữ liệu và kiến trúc luồng AI cho dự án Chartix. Các quyết định kỹ thuật đã được thống nhất dựa trên yêu cầu tối ưu chi phí và hiệu năng.

## 1. Nguồn Dữ liệu & APIs (Data Sources)

| Loại dữ liệu | Nguồn sử dụng (Free Tier) | Cách triển khai |
| :--- | :--- | :--- |
| **Giá Real-time (Crypto)** | **Binance WebSocket API** | Frontend kết nối thẳng Websocket hoặc thông qua NestJS. Data lấy dạng nến OHLCV. |
| **Giá Real-time (Forex)** | **Twelve Data / AlphaVantage** | Gọi qua NestJS và **bắt buộc cache trên Redis** để tránh bị chặn (rate-limit). |
| **Tin tức (News)** | **CryptoPanic API** & **RSS Feeds** | NestJS sử dụng Cronjob (mỗi 15-30 phút) tự động fetch tin tức mới, lọc và lưu vào PostgreSQL. **Có Cronjob xóa các tin tức cũ hơn 30 ngày để tối ưu dung lượng DB miễn phí.** |
| **Lịch Kinh tế (Events)** | **Investing.com RSS** / Scrape | Tạm thời cào dữ liệu (scrape) từ HTML/RSS để lấy data thật. Nếu lỗi sẽ có cơ chế fallback sang mock data. |

## 2. Tổ chức Biểu đồ giá (Frontend Chart)
- **Thư viện sử dụng**: **TradingView Lightweight Charts** (Miễn phí, mã nguồn mở, cực kỳ tối ưu và nhẹ).
- **Luồng hoạt động**:
  1. Component React khởi tạo biểu đồ trống.
  2. Frontend gọi API để lấy dữ liệu nến lịch sử (Historical K-lines) đẩy vào chart.
  3. Frontend mở luồng WebSocket để nhận giá mới liên tục, cập nhật cây nến cuối cùng trên biểu đồ.
  4. Các tín hiệu dự đoán AI (Buy/Sell/Confidence) sẽ được vẽ chồng (overlay) lên biểu đồ.

## 3. Kiến trúc & Luồng RAG cho Chatbot (Core #1)

Chatbot không chỉ trả lời suông mà sẽ được cung cấp "Kiến thức chuyên môn" và "Tin tức mới nhất".

- **Mô hình Embedding**: `sentence-transformers/all-MiniLM-L6-v2` (chạy offline bằng Python FastAPI, không tốn phí).
- **Cơ sở dữ liệu Vector (Vector DB)**: **ChromaDB**. Lưu dữ liệu dạng file tĩnh local ngay trong thư mục `ai-service`, cực kỳ dễ setup.
- **Mô hình LLM**: Sử dụng **Groq API (Llama 3)**. Lý do: Tốc độ trả lời cực nhanh, free tier rộng rãi.
- **Luồng RAG (Retrieval-Augmented Generation) hoạt động**:
  1. Người dùng chat: *"Tin tức CPI hôm nay ảnh hưởng BTC thế nào?"*
  2. FastAPI nhúng (embed) câu hỏi này thành vector.
  3. Tìm kiếm trong ChromaDB để rút trích (retrieve) ra các tài liệu/tin tức liên quan nhất.
  4. Nối "Câu hỏi" + "Context" + "Prompt chuyên gia" gửi lên Groq API.
  5. Trả về kết quả chuyên sâu, có cấu trúc cho Frontend.

## 4. Mô hình Dự đoán Xu hướng (Core #2)

- **Bài toán**: **Phân loại (Classification)**: Dự đoán giá sẽ *Tăng*, *Giảm* hay *Đi ngang* trong 4-8 giờ tới.
- **Mô hình AI**: **XGBoost** (Machine Learning truyền thống).
- **Đầu vào (Features)**: Giá quá khứ (OHLCV) + Các chỉ báo kỹ thuật tự tính (RSI, MACD, Bollinger Bands, Volume).
- **Lý do**: XGBoost chạy rất nhanh, dễ giải thích feature nào ảnh hưởng nhiều nhất (Feature Importance). Rất phù hợp để show off tư duy ML trong portfolio.
