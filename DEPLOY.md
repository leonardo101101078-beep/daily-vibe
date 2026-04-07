# Daily-Vibe 2.0 — 部署指南（GitHub + Vercel + Supabase）

產品顯示名稱統一為 **Daily-Vibe 2.0**（程式套件名為 `daily-vibe-2`，見 `package.json`）。

## 1. Supabase（新專案）

1. 建立專案後，於 **Project Settings → API** 取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（僅伺服器，勿公開）
2. 在 **SQL Editor** 依序執行 [`supabase/migrations/`](supabase/migrations/) 內 `001` … `007`（或使用 Supabase CLI `supabase db push`）。
3. 部署取得正式網址後，於 **Authentication → URL Configuration** 設定：
   - **Site URL**：`https://你的網域`
   - **Redirect URLs**：`https://你的網域/**`、`http://localhost:3000/**`（本機開發）

## 2. GitHub

建立新倉庫，將本專案推上 `main`。**勿**提交 `.env.local` 或金鑰。

- **CI（GitHub Actions）**：範本在 [`docs/github-actions-ci.yml`](docs/github-actions-ci.yml)。請在倉庫建立 `.github/workflows/ci.yml`，將該檔內容貼上並提交（或本機執行 `gh auth login -s workflow` 後再推送含 workflow 的變更）。  
  若 `git push` 出現 `refusing to allow an OAuth App to create or update workflow ... without workflow scope`，代表目前憑證無 `workflow` 權限，需改用上述方式之一。
- **自動部署（Vercel）**：在 [Vercel](https://vercel.com) **Import** 此 GitHub 倉庫並連結 `main`；之後每次推送到 `main`，Vercel 會自動建置與部署（無須手動上傳）。

## 3. Vercel

1. Import GitHub 倉庫；Framework：Next.js；Node 20.x。
2. 於 **Environment Variables** 填入 [`.env.local.example`](.env.local.example) 所列變數，並補上：
   - `RESEND_API_KEY`、`RESEND_FROM_EMAIL`（週報／匯出寄信，若使用）
3. Deploy 後將 **Vercel URL** 填回 Supabase 的 Site URL / Redirect URLs。

## 4. 推播 Cron

`POST /api/push/cron`，Header：`Authorization: Bearer <CRON_SECRET>`。可用外部排程（如 cron-job.org）每分鐘呼叫生產網址。

## 5. 驗收

登入、今日頁、設定、（可選）推播與寄信流程。

更細步驟可對照根目錄 [`deploy-checklist.txt`](deploy-checklist.txt)。
