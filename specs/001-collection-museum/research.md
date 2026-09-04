# Research: 我的收藏博物館

## IndexedDB 與照片保存

**Decision**: 使用單一 version 1 IndexedDB database，分為 `items`、`categories`、`exhibitions` stores；照片以壓縮後 `Blob` 保存。Schema upgrade 集中在 `onupgradeneeded`，資料連動刪除使用同一個 `readwrite` transaction。

**Rationale**: 這直接支援 structured data 與照片 persistence，符合 private-first 與零 runtime dependency。分 store 對應 domain entities，較容易由初學者理解與未來 migration。Item delete 必須同時更新 exhibitions，transaction 可避免只刪到半套資料。

**Alternatives considered**: Local Storage/Base64 會放大照片資料且不適合 Blob；保存原始圖片會增加 quota、decode 與 Gallery rendering 風險；fake IndexedDB 會增加測試 dependency，因此 browser persistence 留給 acceptance testing。

## Image handling

**Decision**: `file input` 的 `accept` 只作提示，仍驗證 MIME 與可解碼性；選圖後 preview，將最長邊縮小至最多約 1600 px，優先輸出 WebP，若執行環境不支援必要的 WebP 輸出能力則使用 JPEG fallback，輸出 quality 約 0.8，並以 Blob 保存至 IndexedDB。第一版不建立多輪壓縮、動態品質演算法或複雜檔案大小最佳化流程；若未來實測出現明確 IndexedDB 儲存問題，再由新的 requirement 決定是否增加複雜處理。照片是 optional，任何選擇、權限、解碼或壓縮失敗都提供 retry 或無照片繼續。

**Rationale**: 限制輸出尺寸可控制 IndexedDB storage 成長，且不讓 photo failure 破壞 Name 與其他 Label 欄位。先完成影像處理再開啟 DB transaction，可避免 transaction 因非 DB 非同步工作而結束。

**Alternatives considered**: 保存原始 File 能保留最大品質但不符合 MVP 的 storage 約束；只保存 object URL 不能跨 reload；以 Base64 保存會增加大小與記憶體使用。

## Pure logic 與 testing

**Decision**: 驗證、Category delete transformation、Exhibition ordering、stale reference cleanup 與 achievement calculations 放在不依賴 `window`、`document`、IndexedDB 或 Canvas 的函式；以 Node 內建 `node:test` 執行 lightweight tests。IndexedDB、Canvas 與 responsive UI 以 browser acceptance/smoke guide 驗證。

**Rationale**: 在不增加 test framework 或 runtime dependency 的前提下，仍可快速驗證高風險 domain rules；browser-only 能力則由實際瀏覽器測試確認。

**Alternatives considered**: 將全部測試綁定瀏覽器會降低純邏輯回饋速度；引入 fake browser/database library 不符合 approved stack 與 A 級複雜度。

## Navigation 與資料同步

**Decision**: 使用原生事件與 in-memory view state 做簡單 client-side view switching，保留 Museum、Collection、Exhibits、Add Item 四個主導覽入口；detail/form 為次級 view state，不建立 URL hash route contract。每次 mutation 成功後重新從 DB 讀取必要資料再 render。

**Rationale**: 不需要 router dependency 或正式 deep linking；重新讀取可避免不同畫面持有過時資料，且對初學者容易追蹤。

**Alternatives considered**: SPA framework、router library 或 global state library 都超出目前 scope；只在記憶體更新畫面容易造成 reload 後或跨 view 的 stale state。

## 明確化的風險與處理

**Decision**: MVP 以現代瀏覽器為目標；quota、transaction abort、DB open/upgrade failure 與 private browsing 限制都轉為全域可理解錯誤，保留目前表單並提供 retry。保存失敗的 draft 只需在目前頁面/流程中保留，不新增 draft persistence。

**Rationale**: 這滿足 spec 的 error recovery，又不擴大成離線 draft system 或跨裝置同步。IndexedDB private-first 代表資料留在裝置，不宣稱加密。

**Alternatives considered**: reload 後 draft recovery、資料加密與跨裝置同步都需要額外產品決策與複雜度，屬於 Version 1 out of scope。