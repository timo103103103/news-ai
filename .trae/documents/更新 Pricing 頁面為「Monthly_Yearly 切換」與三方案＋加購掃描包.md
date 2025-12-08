## 目標
- 用提供的中文文案重寫 `Pricing` 頁面，支援「Monthly / Yearly」切換。
- 三個方案：Starter、Pro（Most Popular）、Business；每個依切換顯示不同價格與文案。
- 新增「Extra scans」加購區塊（一次性加購 50 或 200 掃描）。

## 資料結構與狀態
- 新增 `billingCycle` 狀態：`'monthly' | 'yearly'`，預設 `monthly`。
- 重構方案資料為結構化常數：
  - `plans = [{ id: 'starter', name, description, scansPerMonth, modes, media, extras, prices: { monthly: '$9', yearly: '$90' }, priceIds: { monthly: VITE_..., yearly: VITE_... }, popular?: true }, ...]`
  - `extraScanPacks = [{ label: 'Extra 50 scans', price: '$7', packId: VITE_... }, { label: 'Extra 200 scans', price: '$20', packId: VITE_... }]`
- 前端以 `import.meta.env.VITE_...` 讀取對應 Stripe Price ID（若未配置則將 CTA 置灰並顯示「即將開放」）。

## UI 與文案（照提供內容呈現）
- 置頂切換：`Monthly / Yearly`，ARIA roles（`role=tablist`、`role=tab`），切換時更新卡片價格與 `/ month`、`/ year` 文案。
- 三張卡片（使用現有 Tailwind 風格與 `lucide-react`）：
  - Starter
    - 價格：`$9 / month` 或 `$90 / year`
    - 40 scans / month
    - For individuals & occasional users
    - Modes: A & B
    - Image / PDF / text
    - Email support (48h)
  - Pro（Most Popular）
    - 價格：`$29 / month` 或 `$290 / year`
    - 200 scans / month
    - For creators, analysts and small teams
    - Modes: A, B & C
    - Image / PDF / text / video frame
    - Full credibility & PESTLE
    - Priority processing
  - Business
    - 價格：`$79 / month` 或 `$790 / year`
    - 800 scans / month
    - For teams, media & research orgs
    - All modes: A–D
    - Team seats, API access, exports
    - Priority / dedicated support
- Pro 卡片右上角加「Most Popular」徽章；Business 卡片可視覺上加強框線。
- CTA 統一為「Subscribe」；若對應 `priceId` 缺失則顯示「Contact us」並禁用。
- 下方新增「Extra scans」區塊：
  - Need more scans this month?
  - Add extra scan packs on top of any plan:
  - Extra 50 scans – $7
  - Extra 200 scans – $20
  - Packs are one-time purchases. No auto-renew.
  - 兩個按鈕：`Add 50`、`Add 200`（未配置 packId 則置灰）。

## 行為與後端互動
- `Subscribe` 依 `billingCycle` 取對應 `priceId` 呼叫現有 `/api/stripe/create-checkout-session`（POST，body: `{ priceId, tier }`）。
- 加購掃描包按鈕也走 checkout（若後端支援一次性商品）；若尚未支援，前端顯示說明而不呼叫 API。
- 保留現有付款成功後的 `session_id` 驗證流程與 premiumView 區塊；若不再使用舊的「Free/Monthly/Premium」方案，移除舊資料源並以新三方案為主。

## 檔案調整
- `src/pages/Pricing.tsx`：
  - 重構 tiers → plans（含月/年價與文案）。
  - 新增 `billingCycle` 切換 UI 與邏輯。
  - 追加「Extra scans」區塊。
  - 保留頁面整體樣式、FAQ 區，或視需要簡化。
- `.env`（僅說明，不提交）：
  - `VITE_STRIPE_PRICE_STARTER_MONTHLY`、`VITE_STRIPE_PRICE_STARTER_YEARLY`
  - `VITE_STRIPE_PRICE_PRO_MONTHLY`、`VITE_STRIPE_PRICE_PRO_YEARLY`
  - `VITE_STRIPE_PRICE_BUSINESS_MONTHLY`、`VITE_STRIPE_PRICE_BUSINESS_YEARLY`
  - （可選）`VITE_STRIPE_PRICE_PACK_50`、`VITE_STRIPE_PRICE_PACK_200`

## 驗證與測試
- 手動：切換 Monthly/Yearly 檢查所有價格與文案正確更新；CTA 在未配置 priceId 時禁用。
- API：點擊 Subscribe 能導向 Stripe Checkout；返回後 `session_id` 驗證正常，顯示成功訊息。
- UI：在桌機與行動端卡片排版與徽章顯示正確；ARIA 屬性通過基本可及性檢查。

## 交付標準
- 價格與文案完全符合提供的中文/英文內容與數字。
- 切換與 CTA 行為一致、可用；未配置 priceId 的項目不會拋錯。
- 程式碼風格延續現有 Tailwind 與 React Hooks，無外部新依賴。