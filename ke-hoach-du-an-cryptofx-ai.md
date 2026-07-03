# KẾ HOẠCH DỰ ÁN: Cổng thông tin Crypto/Forex tích hợp AI
**Vai trò:** CTO & Mentor review | **Timeline:** 3 tháng | **Người thực hiện:** 1 (bạn)

---

## 1. TẦM NHÌN & PHẠM VI ĐÃ CHỐT

Dựa trên trao đổi, đây là scope thực tế cho 3 tháng một mình:

| Tính năng | Mức đầu tư | Lý do |
|---|---|---|
| Trang tin tức (aggregator từ API/RSS có sẵn) | MVP, làm nhanh gọn | Không phải điểm nhấn kỹ thuật, chỉ cần chỉn chu |
| Lịch kinh tế (kiểu ForexFactory) | MVP | Dùng API/scrape có sẵn, hiển thị đẹp |
| **AI Chatbot hỏi đáp crypto/FX cho người mới** | **LÕI #1** | Điểm nhấn portfolio — thể hiện khả năng RAG, prompt engineering, xử lý domain-specific |
| **Model dự đoán/gợi ý xu hướng (ML)** | **LÕI #2** | Điểm nhấn portfolio — thể hiện khả năng ML thực chiến, đúng chuyên ngành |
| Gợi ý lệnh future cụ thể | Xây trên nền model dự đoán + rule-based, có disclaimer | Xử lý rủi ro pháp lý (mục 6) |

**Nguyên tắc:** 2 tính năng AI phải "thật" và có thể giải thích được (explainable) khi phỏng vấn — nhà tuyển dụng sẽ hỏi sâu về cách bạn train, đánh giá, và giới hạn của model. Phần tin tức/lịch kinh tế chỉ cần **đủ tốt**, không cần đầu tư nhiều.

---

## 2. KIẾN TRÚC TỔNG THỂ

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   React FE  │─────▶│  NestJS Backend  │─────▶│  Python AI Service   │
│  (Vercel)   │◀─────│   (Railway/Render)│◀─────│  (FastAPI, Railway)  │
└─────────────┘      └──────────────────┘      └─────────────────────┘
                             │                          │
                      ┌──────┴──────┐          ┌────────┴────────┐
                      │  PostgreSQL │          │  Model registry  │
                      │  (Supabase) │          │  (local files/   │
                      │  Redis cache│          │   HuggingFace Hub)│
                      └─────────────┘          └──────────────────┘
                             │
                   ┌─────────┴──────────┐
                   │  Nguồn dữ liệu ngoài │
                   │  News API, RSS,      │
                   │  CoinGecko, Binance, │
                   │  FMP/AlphaVantage    │
                   └──────────────────────┘
```

**Tại sao tách Python AI Service riêng thay vì nhúng vào NestJS:**
- NestJS gọi sang Python service qua REST/gRPC nội bộ → tách biệt concern, dễ scale riêng phần AI, dễ demo là bạn hiểu microservice.
- Đây cũng là điểm cộng phỏng vấn: "tại sao tách service" là câu hỏi kinh điển.

---

## 3. STACK CÔNG NGHỆ CHI TIẾT (ưu tiên free tier)

### Frontend
- **React** + Vite, TypeScript
- TailwindCSS (tốc độ làm UI nhanh, chuyên nghiệp)
- TanStack Query (data fetching/cache) + Zustand (state nhẹ)
- Recharts hoặc TradingView Lightweight Charts (**miễn phí, mã nguồn mở** — cho biểu đồ giá đẹp như sàn thật)
- Deploy: **Vercel** (free)

### Backend (NestJS)
- NestJS + TypeScript, TypeORM/Prisma + PostgreSQL
- Redis (cache tin tức, rate-limit) — dùng Upstash free tier
- BullMQ (queue cho job: crawl tin tức định kỳ, gọi model dự đoán theo lịch)
- JWT auth (nếu có tài khoản user, watchlist cá nhân)
- Swagger cho API docs (thể hiện chuyên nghiệp)
- Deploy: **Railway** hoặc **Render** free/hobby tier

### AI Service (Python)
- **FastAPI** (nhẹ, nhanh, dễ tích hợp NestJS)
- **Chatbot:** RAG pipeline
  - Embedding: `sentence-transformers` (free, chạy local, không tốn API)
  - Vector DB: **Qdrant** (free self-host hoặc free cloud tier) hoặc ChromaDB (local, đơn giản hơn để bắt đầu)
  - LLM: Groq API (free tier, rất nhanh, model Llama 3.1) hoặc Google Gemini API (free tier) — **không cần tự train LLM**, tự train LLM từ đầu không khả thi trong 3 tháng
  - Kỹ thuật: RAG + prompt engineering + guardrail (giới hạn phạm vi trả lời trong crypto/FX)
- **Model dự đoán xu hướng:**
  - Bắt đầu với bài toán **classification** (giá lên/xuống/đi ngang trong N giờ tới) thay vì regression dự đoán giá chính xác — dễ đánh giá, dễ giải thích, và thực tế hơn (dự đoán giá chính xác gần như bất khả thi và không ai làm vậy trong thực tế)
  - Model: bắt đầu từ XGBoost/LightGBM với feature engineering (RSI, MACD, EMA, volume, sentiment tin tức) → sau đó thử LSTM/GRU hoặc Temporal Fusion Transformer nếu còn thời gian
  - Data: Binance API (free, không giới hạn nhiều), CCXT library để lấy OHLCV
  - Backtesting: `backtrader` hoặc tự viết đơn giản
  - Đây chính là phần **nghiên cứu ML** đúng chuyên ngành bạn học

### Data nguồn free
- Tin tức: NewsAPI (free tier giới hạn), CryptoPanic API (free), RSS feeds (Investing.com, CoinDesk có RSS công khai)
- Lịch kinh tế: scrape ForexFactory (họ không có API chính thức free — cần cẩn thận rate-limit/ToS) hoặc dùng Trading Economics API free tier
- Giá real-time: Binance WebSocket API (miễn phí, không giới hạn gắt)
- Forex: Alpha Vantage free tier (giới hạn 25 req/ngày — cần cache tốt) hoặc Twelve Data free tier

### Hạ tầng & DevOps
- Docker + docker-compose (thể hiện kỹ năng chuẩn hóa môi trường)
- GitHub Actions CI/CD (free cho public repo)
- Sentry free tier (error tracking) — điểm cộng thể hiện tư duy production-ready

---

## 4. ROADMAP 3 THÁNG (12 tuần)

### Giai đoạn 1 — Nền móng (Tuần 1-3)
- Setup monorepo (NestJS + React + FastAPI), Docker hóa
- Thiết kế DB schema, auth cơ bản
- Xây module lấy tin tức + lịch kinh tế (cronjob NestJS, cache Redis)
- FE: layout trang chủ dạng tin tức, trang lịch kinh tế
- **Mốc kiểm tra:** web chạy được, hiển thị tin tức thật, lịch kinh tế thật

### Giai đoạn 2 — Chatbot AI (Tuần 4-6)
- Thu thập/tạo knowledge base: tài liệu FAQ crypto/FX cơ bản, thuật ngữ, khái niệm (bạn tự viết hoặc lấy nguồn mở có giấy phép phù hợp — **không copy nguyên văn bài có bản quyền**)
- Xây pipeline RAG: chunk → embed → lưu vector DB → retrieval → prompt LLM
- Thêm guardrail: từ chối câu hỏi ngoài phạm vi, từ chối đưa lời khuyên tài chính tuyệt đối
- Tích hợp chat UI (streaming response) vào FE
- **Mốc kiểm tra:** chatbot trả lời đúng ngữ cảnh domain, không "ảo giác" bừa bãi

### Giai đoạn 3 — Model dự đoán xu hướng (Tuần 7-9)
- Thu thập dữ liệu lịch sử (Binance OHLCV, vài năm)
- Feature engineering (indicator kỹ thuật)
- Train baseline (XGBoost) → đánh giá bằng backtest, không chỉ accuracy
- Nếu kịp: thử deep learning (LSTM) so sánh với baseline
- Xây API serving model (FastAPI endpoint `/predict`)
- Tích hợp hiển thị gợi ý xu hướng trên biểu đồ FE, kèm confidence score
- **Mốc kiểm tra:** có báo cáo đánh giá model rõ ràng (precision/recall, backtest return, max drawdown) — đây là thứ khoe trong portfolio, không phải con số đẹp mà là **quy trình đánh giá nghiêm túc**

### Giai đoạn 4 — Gợi ý lệnh future + hoàn thiện (Tuần 10-12)
- Kết hợp model + rule-based (risk/reward ratio, stop-loss gợi ý) → sinh ra "gợi ý lệnh" có cấu trúc (entry, SL, TP, lý do)
- Thêm disclaimer bắt buộc hiển thị mọi nơi có gợi ý (xem mục 6)
- Polish UI/UX, responsive, dark mode (dân trading thích dark mode)
- Viết README kỹ thuật, kiến trúc, cách chạy local — cực quan trọng cho portfolio
- Deploy full, test end-to-end
- Quay demo video ngắn (2-3 phút) giới thiệu sản phẩm

---

## 5. NHỮNG RỦI RO KỸ THUẬT CẦN LƯỜNG TRƯỚC

1. **Rate limit free API** → bắt buộc cache mạnh (Redis), không gọi trực tiếp mỗi request của user
2. **Model dự đoán giá dễ overfit** → phải backtest trên dữ liệu ngoài mẫu (out-of-sample), đừng chỉ tin train accuracy
3. **ForexFactory không có API chính thức** → cân nhắc dùng nguồn thay thế hợp pháp hơn (Trading Economics, FMP) để tránh vấn đề ToS
4. **LLM miễn phí (Groq/Gemini free tier) có giới hạn request** → cache câu trả lời phổ biến, giới hạn số câu hỏi/user/ngày
5. **Scope creep** — đây là rủi ro lớn nhất với 1 người/3 tháng. Bám sát roadmap, cắt bớt nếu trễ (ưu tiên cắt "gợi ý lệnh cụ thể" trước, giữ chatbot + model dự đoán)

---

## 6. VẤN ĐỀ PHÁP LÝ/TRÁCH NHIỆM — QUAN TRỌNG

Vì bạn chọn hướng "AI đưa gợi ý cụ thể kèm disclaimer", cần lưu ý:

- Ở Việt Nam, tư vấn đầu tư tài chính có điều kiện cấp phép; một sản phẩm cá nhân/portfolio không nhằm mục đích thương mại thường chưa đụng vấn đề pháp lý nghiêm trọng, nhưng nếu định thương mại hóa sau này thì **cần tìm hiểu kỹ quy định của UBCKNN và pháp luật liên quan đến tư vấn đầu tư/forex** (nhiều sàn forex quốc tế còn chưa được cấp phép hoạt động chính thức tại VN).
- Về kỹ thuật sản phẩm, nên:
  - Luôn gắn nhãn "Đây là gợi ý dựa trên mô hình AI, không phải lời khuyên đầu tư" ở mọi nơi hiển thị gợi ý lệnh
  - Hiển thị rõ độ tin cậy/xác suất của model, không khẳng định chắc chắn
  - Log lại lịch sử gợi ý để có thể đối chiếu hiệu quả thực tế — vừa minh bạch vừa là dữ liệu quý để cải thiện model
- Đây không phải tư vấn pháp lý — nếu tiến tới thương mại hóa thật, bạn nên tham khảo luật sư về quy định tài chính hiện hành.

---

## 7. GỢI Ý CHO PORTFOLIO/PHỎNG VẤN

Khi trình bày dự án này, nhà tuyển dụng backend/AI sẽ đánh giá cao nếu bạn có thể trả lời:
- Tại sao chọn kiến trúc microservice (NestJS + Python riêng)?
- Model dự đoán có overfit không, làm sao biết? (đưa số liệu backtest)
- Chatbot xử lý câu hỏi ngoài phạm vi/prompt injection thế nào?
- Trade-off giữa free tier và chất lượng dữ liệu real-time?

Chuẩn bị sẵn các câu trả lời này song song với việc code — sẽ giúp bạn code có chủ đích hơn thay vì chỉ chạy được là xong.

---

## BƯỚC TIẾP THEO

Nếu bạn muốn, tôi có thể giúp:
1. Thiết kế DB schema chi tiết (bảng, quan hệ)
2. Vẽ sơ đồ kiến trúc dạng diagram trực quan
3. Bắt đầu scaffold code NestJS + FastAPI project structure
4. Lập danh sách feature engineering cụ thể cho model dự đoán

Cứ nói bạn muốn bắt đầu từ đâu.
