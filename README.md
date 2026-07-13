# AI Banner Pro — Starter Kit

Bộ starter kit tạo banner ads bằng AI. Clone → chạy demo trong 30 giây,
setup API keys sau nếu muốn generate banner thật.

**Demo login sẵn**: `admin` / `pass` — thấy UI ngay không cần cấu hình gì.

---

## Quick Start (30 giây)

```bash
git clone https://github.com/sonlovinbot/banner-ads-starter.git
cd banner-ads-starter
npm install
npm run dev
```

Mở `http://localhost:3000` → thấy trang login → dùng **admin / pass** → vào app.

Ở demo mode:
- ✅ Xem toàn bộ UI (Banner Tool, UGC Studio, Brand Style, History)
- ✅ Upload ảnh reference/product (lưu localStorage trình duyệt)
- ✅ Test workflow trước khi setup API keys
- ❌ Chưa generate được banner (cần Gemini/Coachio key)
- ❌ Không sync đa thiết bị (cần Supabase)

---

## Tính năng có sẵn

- 🎨 **Banner Tool** — Text-to-image banner ads với Style reference + Product image
- 👤 **UGC Studio** — Tạo banner "người thật cầm sản phẩm" (Face + Fashion + Product)
- 🎭 **Brand Style** — Lưu brand profile (logo, refs, tone) → apply nhanh cho mọi banner
- 📚 **History** — Toàn bộ banner đã tạo + edit / re-generate từ history
- 🔐 **Auth** — Supabase với email/password/magic link + RLS (optional)
- 🎨 **2 backends**:
  - **Google Gemini** — trực tiếp qua browser
  - **Coachio AI** — wrap GPT Image 2 + Nano Banana Pro

---

## Yêu cầu

- Node.js 18+
- npm hoặc pnpm
- Trình duyệt hiện đại (Chrome/Firefox/Safari)

---

## Setup đầy đủ — API Keys

### 1. Gemini API (bắt buộc để generate banner)

**Free tier**: 1500 requests/day miễn phí.

1. Vào https://aistudio.google.com/apikey
2. Đăng nhập Google → click **Create API key**
3. Copy key dạng `AIza...`
4. Tạo file `.env.local` trong thư mục project:
   ```bash
   cp .env.example .env.local
   ```
5. Uncomment + paste key:
   ```
   VITE_GEMINI_API_KEY=AIza...
   ```
6. Restart dev server: `Ctrl+C` → `npm run dev`

### 2. Supabase (optional — để có auth thật + cloud sync)

Không setup Supabase vẫn dùng được app qua demo login. Setup Supabase khi:
- Muốn login đa thiết bị
- Muốn share app cho team (mỗi người có account riêng)
- Muốn backup data lên cloud

**Steps**:

1. Vào https://supabase.com/dashboard → **New project**
2. Đặt tên project, chọn region **Southeast Asia (Singapore)** cho latency thấp từ VN
3. Đợi ~2 phút Supabase provision
4. **Settings → API** → copy:
   - **Project URL** (dạng `https://xxxxx.supabase.co`)
   - **anon public key** (dạng `eyJhbGc...`)
5. Paste vào `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
6. Vào Supabase **SQL Editor** → chạy migration (nếu có `docs/supabase-schema.sql`)
7. Restart `npm run dev`
8. Trang login giờ hiện thêm form "Đăng nhập Supabase" bên dưới Demo login

### 3. Coachio API (optional — alternative gen backend)

Không cần nếu đã có Gemini. Coachio wrap GPT Image 2 + Nano Banana Pro qua 1 API duy nhất.

1. Vào https://coachio.ai
2. Đăng ký → **API Keys** → **Create new key**
3. Copy key dạng `coa_...`
4. Paste vào `.env.local`:
   ```
   VITE_COACHIO_API_KEY=coa_...
   ```

Hoặc nhập trong app: Settings → API Keys.

---

## Cấu trúc thư mục

```
banner-ads-starter/
├── components/          UI components (React)
│   ├── AuthGate.tsx     Login screen + demo mode
│   ├── BannerTool.tsx   Main banner generation UI
│   ├── UGCStudio.tsx    Face-consistent UGC generation
│   ├── BrandStylePage.tsx  Brand profile editor
│   ├── HistoryPage.tsx  Generated banners history
│   ├── ...
├── services/            Business logic
│   ├── authService.ts     Supabase auth wrapper
│   ├── demoAuth.ts        Fake auth (admin/pass)
│   ├── supabaseClient.ts  Supabase client init
│   ├── geminiService.ts   Gemini API calls
│   ├── coachioService.ts  Coachio API calls
│   ├── ...
├── data/                Static data
├── App.tsx              Entry point
├── package.json
├── vite.config.ts
├── .env.example         Env vars template
└── README.md
```

---

## Deploy lên Vercel

1. Push code lên GitHub repo của anh
2. Vào https://vercel.com/new → Import project
3. Trong **Environment Variables**, paste giống `.env.local`:
   ```
   VITE_GEMINI_API_KEY=AIza...
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. **Deploy** → đợi 2 phút → có URL public

---

## Trục trặc thường gặp

**"Supabase chưa cấu hình"**
- Đúng — chỉ dùng Demo login (`admin` / `pass`)
- Muốn có Supabase → làm theo section 2 phía trên

**Login demo báo sai tài khoản/mật khẩu**
- Dùng đúng: `admin` (chữ thường) và `pass` (chữ thường)
- Không có space

**Generate banner báo "No API key"**
- Chưa có Gemini key. Xem section 1.

**Port 3000 bị chiếm**
- Vite tự động dùng port khác (3001, 3002, ...)
- Xem log terminal để biết port thực tế

**`npm install` fail**
- Node version quá cũ → cần Node 18+: `node --version`
- Xoá `node_modules` + `package-lock.json` → `npm install` lại

---

## License

MIT — free để dùng, sửa, share.

## Contribute

PR welcome. Bug report tại [GitHub Issues](https://github.com/sonlovinbot/banner-ads-starter/issues).

## Credits

- Original commit: `30067db` từ [AI-Banner-Pro-GG-Studio](https://github.com/sonlovinbot/AI-Banner-Pro---GG-Studio)
- Stack: React 19 + Vite 6 + TypeScript + Supabase (optional)
