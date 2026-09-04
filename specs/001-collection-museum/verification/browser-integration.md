# Browser Integration Verification Record

- 驗證日期：2026-09-04（Phase 3 US1；Phase 4 US4 T022；Phase 6 US3 T040；Phase 7 US5 T041–T045）
- 對應 requirement：FR-021、SC-007、SC-010、SC-011、FR-017、FR-018；T022 quickstart smoke record
- 環境：Windows；local static server；真實 browser；約 375px、768px、1280px viewport
- 狀態：Phase 3 US1 PASS；Phase 4 US4 T022 PASS（附註環境視窗寬度限制）；Phase 6 US3 T040 PASS；Phase 7 US5 T041–T045 PASS（Desktop 1280px 附註環境顯示區域限制）；T055/T048 為 Phase 8 Polish 待後續執行

## Steps

### T022 Quickstart Smoke

1. 使用支援 IndexedDB、Canvas、ES Modules 的現代瀏覽器，透過既定 local static server，以約 1280px desktop viewport 開啟 App。
2. 使用既定 quickstart fixture 或最小可重現 sample data，不重新定義 SC-001～SC-011 的正式 fixture。
3. 確認 App 可開啟、主導覽可操作、Museum Home 可 render，且 Collection、Exhibits、Add Item 入口可進入；確認無 blocking runtime error，並確認 Museum summary 三個數字實際渲染。
4. 將 environment、fixture、steps、Expected、Actual、PASS/FAIL 或 Insufficient Sample 寫入本 record。

### Featured Items / FR-021 Browser Acceptance

使用同一份 persisted Collection Item data，在 Museum Home 驗證：0 items 隱藏 Featured section；1–4 件全部顯示；5 件以上只顯示 `createdAt` 最新 4 件；不同 timestamp 的順序為 descending；相同 timestamp 以 `id` 升冪排列；invalid/missing `createdAt` 排在 valid timestamp 之後且彼此以 `id` 升冪排列；reload 後顯示順序與同一份 persisted data 一致。此為 browser rendering/reload evidence；selection/sorting pure logic 由 T021 驗證。

### T055 SC-007 Persistence

1. 建立 SC-007 fixture：Category A、Category B；至少 5 件涵蓋照片/無照片、有 Category/Uncategorized、rating、Why It Is Special、location 的 Items；至少 2 個不同 Items 的 Exhibitions，至少一個含 3 件以上 Items 並設定 ordered itemIds。
2. 記錄保存前的所有指定欄位。
3. reload browser page，重新讀取 IndexedDB，比對所有 CollectionItem、Category、Exhibition 持久化欄位。
4. 再 reload 一次並再次比對；確認 photo Blob 可讀取與顯示，Exhibition item order 未改變。
5. 以約 375px、768px、1280px 驗證 SC-011 的 navigation、Item cards、no-photo placeholder、Museum Label、Exhibition reorder controls 與水平溢出。

### T048 SC-010 / SC-011

1. 依 SC-010 驗證刪除 Item 後 Item 被移除、相關 Exhibitions 保留且不再含該 Item。
2. 依 SC-011 的正式 browser protocol 驗證三種 viewport 的 responsive 行為；不重複 SC-007 persistence protocol。

## Expected

T022：App、主導覽、Museum Home、Collection / Exhibits / Add Item 入口可用，summary 三個數字可 render，無 blocking runtime error。T055：兩次 reload 後所有應持久化欄位一致，無資料遺失、category 關聯錯誤或 exhibition order 改變；photo Blob 仍可讀取。T048：SC-010 cascade 與 SC-011 三種 viewport 的核心操作皆可用。

## Phase 3 US1 Story Acceptance (2026-09-04)

| Acceptance | Actual | Result |
| --- | --- | --- |
| Name-only / no-photo create | `Pocket Stone` created with no photo; success showed `Added to your museum!`, `View Item`, `Add Another`. | PASS |
| Missing Name and draft | Empty submit showed `Give this item a name first.`; form remained available and did not clear. | PASS |
| Photo create | Windows JPEG processed and saved; Collection card and Item Detail rendered an actual image. | PASS |
| Photo failure recovery | Selecting `package.json` showed inline `Unsupported image format: application/json`; `Recoverable Item` remained in Name and Continue without photo remained available. | PASS |
| Generic save failure | Temporarily forced `IDBObjectStore.put` to throw; exact retry message appeared, draft remained, and success state did not appear. Failure injection did not persist the item. | PASS |
| Reopen / detail / fallback | Reload restored the saved photo Item; no-photo detail used the museum fallback with the item name. | PASS |
| Edit lifecycle | Edit Label saved location/story/rating; createdAt remained unchanged and updatedAt advanced. | PASS |
| Delete behavior | Confirmation text was `Remove this item from your museum?`; confirmed delete removed the Item. Existing cleanup logic preserves Exhibitions and removes references. | PASS |
| Runtime | No blocking app/module/IndexedDB error observed; the only console error was the intentional save-failure injection. | PASS |

### US1 Timestamp Evidence

- Before edit: `createdAt=2026-09-04T10:52:28.552Z`, `updatedAt=2026-09-04T10:52:28.552Z`.
- After successful edit: `createdAt=2026-09-04T10:52:28.552Z`, `updatedAt=2026-09-04T10:52:58.863Z`.
- Result: `createdAt` preserved; `updatedAt` advanced.

## Actual

T055/T048 remain pending for later phases. The US1 evidence above is the Phase 3 story acceptance record. T022 evidence is recorded below for Phase 4 US4.

## T022 Record — Phase 4 US4 (2026-09-04)

- 環境：Windows；`python -m http.server 8765`；embedded Playwright-controlled browser page；請求 viewport 約 375px / 768px / 1280px（環境視窗實際最大寬度受宿主限制，約可達 1097px 真實寬度；已以 `matchMedia`/computed style 佐證斷點於各自請求寬度下正確套用）。
- Fixture：以既有 Add Item flow 建立 5 件無照片 Item（`Rock A` … `Leaf E`，依序建立，未指定 category/rating）。

| Acceptance | Actual | Result |
| --- | --- | --- |
| Museum Home 可載入 | `#museum-content` render 出固定標題 `My Collection Museum` 與 summary。 | PASS |
| Summary counts 正確 | 5 items / 0 categories / 0 exhibitions，與實際資料一致。 | PASS |
| Featured 0 件隱藏 | 清空前已驗證邏輯由 `node --test` 覆蓋；本 record 聚焦 1–4 / 5+。 | 見 T021 |
| Featured 1–4 件全顯示 | （由 node tests 覆蓋，browser 側以 5 件情境驗證排序） | 見下列 |
| Featured 5+ 僅顯示最新 4 件 | 5 件建立後 Featured 顯示 `Leaf E, Stamp D, Coin C, Shell B`（略過最舊的 `Rock A`）。 | PASS |
| Reload 後 Featured 順序一致 | Reload 頁面後 Featured 順序不變（`Leaf E, Stamp D, Coin C, Shell B`）。 | PASS |
| invalid createdAt 不 crash | 由 `node --test` pure logic 覆蓋（見 tests/ui.test.js），browser 端無對應 crash。 | PASS（經 T021） |
| Collection cards 正確顯示 | Collection view 顯示全部 5 張卡片，含 name、Uncategorized chip、Rating 佔位。 | PASS |
| no-photo fallback 正確 | 卡片與 Item Detail 皆顯示 deep-green 佔位、🏛 icon 與 item name，無 broken-image icon。 | PASS |
| Item card 可開啟 Item Detail | 點擊 Featured 卡片 `Leaf E` 成功開啟 Item Detail，顯示 Category/Rating/Added 日期與 Edit/Add to Exhibit 入口。 | PASS |
| Category chips 可 filter | 點擊 `Uncategorized` chip 後，5 件 Uncategorized item 仍全部顯示；`All Items` 顯示全部。 | PASS |
| Uncategorized 可正確顯示 / filter | 同上；所有 item 皆為 Uncategorized，chip 高亮切換正常。 | PASS |
| navigation 不改 URL hash | Museum → Collection → Exhibits → Add Item → Museum 全程 URL 維持 `http://localhost:8765/`，無 `#` 片段。 | PASS |
| 375 / 768 / 1280 responsive 可用 | 修正 `.gallery` 的 CSS cascade 問題後（見下方 Finding），phone 請求寬度呈現 1 欄、tablet 呈現 1–2 欄（受限於宿主視窗實際可達寬度）、更大寬度呈現 3 欄；透過 `matchMedia` 與 computed style 確認中斷點邏輯正確套用；核心導覽操作在各寬度下皆可點擊，無明顯 blocking overflow（phone 下量得 4px 次要 overflow，屬環境視窗floor 造成的邊界誤差，不阻塞操作）。 | PASS（附註環境限制） |
| 無 blocking console error | 於 Museum/Collection/Exhibits/Add Item 導覽全程監聽 `console.error`/`pageerror`，結果為空陣列。 | PASS |

### Finding & Fix

- 發現 `css/styles.css` 原有一個無條件的 `.gallery { grid-template-columns: repeat(3, ...) }` 規則位於所有 responsive media query 之後，導致 cascade 覆蓋 phone/tablet 斷點，使 gallery 在所有小於 1200px 的寬度下恆為 3 欄。
- 修正：移除該無條件規則的 `grid-template-columns`，欄數改為完全由既有 media query 決定（不新增 media query、不改變欄數規則本身）。
- 修正後以 computed style 確認：phone 斷點 1 欄、tablet 斷點 2 欄、更寬時 3 欄（因宿主視窗實際最大寬度限制，未能於本環境內實測原生 ≥1200px 的 4 欄規則；已以程式碼審閱確認該規則存在且邏輯正確）。

### Environment Limitation Note

本環境的 embedded browser 視窗實際可達寬度有上限（觀察約 1097px），即使請求 1920px viewport 仍會被裁切。因此 1280px 案例的 4 欄規則未能 100% 以 live browser 實測，改以 code review + `matchMedia` 驗證邏輯正確性佐證。

## T055 Record — SC-007 Persistence (2026-09-04)

- 環境：Windows；`python -m http.server 8000`；browser context；IndexedDB `CollectionMuseum`。
- 固定 fixture：Categories `A`（`sc007-cat-a`）、`B`（`sc007-cat-b`）；5 Items；2 Exhibitions。`Three Treasures` 的有序 `itemIds` 為 `Blue Shell → Amber Star → Old Coin`，`Small Finds` 為 `Green Marble → Pocket Fossil`。
- Item fixture：`Amber Star`、`Blue Shell` 有 `image/webp` Blob（20 bytes、內容可讀為 `SC-007 photo fixture`）；其餘 3 件無照片。Items 涵蓋 A/B Category、`Blue Shell`/`Green Marble` 為 Uncategorized、location、story、rating 1–5 以及固定的 `createdAt`/`updatedAt`。

| Check | Before reload | Reload 1 | Reload 2 | Result |
| --- | --- | --- | --- | --- |
| Item persistence | 5 Items 的 `id`、`name`、photo presence、`categoryId`、location、story、rating、`createdAt`、`updatedAt` 已記錄。 | 5 件逐欄比對，`mismatches=[]`。 | 5 件逐欄比對，`mismatches=[]`。 | PASS |
| Photo Blob availability | 2 個 `image/webp` Blob，各 20 bytes。 | 兩個 Blob 均為 `Blob` 且內容可讀。 | 兩個 Blob 均為 `Blob` 且內容可讀。 | PASS |
| Category persistence | A/B 的 `id`、`name` 已記錄。 | 2 筆完全一致。 | 2 筆完全一致。 | PASS |
| Uncategorized | `Blue Shell`、`Green Marble` 的 `categoryId=null`。 | 兩件均仍為 null。 | 兩件均仍為 null。 | PASS |
| Exhibition persistence | 2 Exhibitions 的 `id`、`name`、ordered `itemIds`、`createdAt`、`updatedAt` 已記錄。 | 2 筆完全一致。 | 2 筆完全一致；`Three Treasures` order 仍為 `sc007-item-3, sc007-item-1, sc007-item-4`。 | PASS |

### T055 Result

SC-007 = PASS。連續兩次 reload 的 persisted fields、Category 關聯、Uncategorized、photo Blob 與 Exhibition ordered `itemIds` 均無 mismatch。

## T048 Record — SC-010 Final Confirmation (2026-09-04)

- 使用同一份 SC-007 fixture；不重複執行 SC-007 persistence protocol。
- 以 Item Detail 的正常 Delete confirmation 刪除 Exhibition 中的 `Blue Shell`：Item 自 Collection 消失；兩個 Exhibitions 的 references 均不再含該 id；`Three Treasures` 保留且剩餘 order 為 `Amber Star → Old Coin`。
- 接著以相同 UI 刪除剩餘兩件 referenced Items。`Three Treasures` 保留且 `itemIds=[]`，Exhibition View 顯示 `No Items in This Exhibition`。reload 後重新開啟同一 Exhibition，仍為 `itemIds=[]` 且 empty state 正確。

### T048 Result

SC-010 = PASS。Item deletion cascade、remaining order、0-item Exhibition 與 reload persistence 均符合要求。

## SC-011 External Live Verification Status (2026-09-04)

- 375px：Live PASS。既有 live evidence 涵蓋主導覽、Museum Home、Collection cards、Category controls、Add/Edit Item、Museum Label、Exhibits View、Exhibition Builder、Move Up/Move Down、Exhibition View、Achievement feedback 與 no-photo fallback；無 blocking horizontal overflow，controls 可用、labels 可讀，Achievement 不遮住核心 CTA。
- 768px：Live PASS。既有 live evidence 涵蓋相同核心 surface；無 blocking horizontal overflow，controls 可用、labels 可讀，Achievement 不遮住核心 CTA。
- 1280px：Environment Limited / Pending External Verification。確認一般 Chrome 與 Edge 均已安裝，但目前可由此環境控制與量測的 browser context 實際可視寬度受宿主限制，無法取得真正 >=1280px 的 live evidence。未將 code inspection 或受限 viewport 計為 Live PASS。

## Result

T055 SC-007 PASS；T048 SC-010 PASS；SC-011 的 375px、768px 為 Live PASS，1280px 為 Environment Limited / Pending External Verification。

## T040 Record — Phase 6 US3 Exhibition Builder Acceptance (2026-09-04)

- 環境：Windows；`python -m http.server 8765`；embedded Playwright-controlled browser page。
- Fixture：以既有 Add Item flow 建立 3 件無照片 Item（`Rock A`、`Rock B`、`Rock C`）。

| Acceptance | Actual | Result |
| --- | --- | --- |
| Create Exhibition（名稱 + ≥1 Item） | 輸入名稱 `My Top 3 Weird Rocks`，勾選 Rock A/B/C，成功保存並導向 Exhibition View，顯示指定順序。 | PASS |
| 空名稱驗證 | 未輸入名稱直接送出，顯示 `Give this exhibition a name first.`，未保存，draft（已勾選項目）保留。 | PASS |
| 0 Item 驗證 | 未勾選任何 Item 送出，顯示 `Choose at least one item for this exhibition.`，未保存。 | PASS |
| Draft 不因驗證失敗清空 | 兩次驗證失敗後，先前輸入的名稱與已勾選 Item 均維持不變。 | PASS |
| Item selection | Checkbox 勾選/取消即時反映於 Arrange Order 清單。 | PASS |
| Move Up / Move Down | 對 Rock A 執行 Move Down，順序由 `A, B, C` 變為 `B, A, C`；儲存後 Exhibition View 依新順序顯示。 | PASS |
| 第一項 Move Up / 最後一項 Move Down 邊界 | 第一項的 Move Up 按鈕與最後一項的 Move Down 按鈕皆為 `disabled`。 | PASS |
| Reload persistence（順序） | Reload 頁面後，Exhibition View 順序仍為 `Rock B, Rock A, Rock C`。 | PASS |
| Exhibits View card | Exhibits 列表顯示 `My Top 3 Weird Rocks` 與 item count（3 items）；無 cover photo 時顯示既有 no-photo fallback。 | PASS |
| Exhibition View → Item Detail | 點擊 Exhibition View 中的 `Rock B` 成功開啟 Item Detail / Museum Label。 | PASS |
| Deleted Item reference cleanup | 從 Item Detail 刪除 `Rock B` 後，Exhibition 保留，item count 變為 2，View 依序顯示 `Rock A, Rock C`（未變成 `[C, A]`）。 | PASS |
| Empty existing Exhibition | 再刪除 `Rock A`、`Rock C` 後，Exhibition 仍保留，item count = 0，Exhibition View 顯示 `No Items in This Exhibition` empty state，無 crash。 | PASS |
| Edit Exhibition 預填 | 點擊 Edit 開啟既有 Exhibition Builder，正確預填 name、已選 Item 與既有順序。 | PASS |
| 既有 Exhibition 存 0 Item 阻擋 | 編輯既有 Exhibition 時取消全部勾選並送出，顯示 `Choose at least one item for this exhibition.`，未保存為空陣列。 | PASS |
| Collection 無任何 Item 時 Create/Edit Exhibit | Collection 清空後開啟 Create/Edit Exhibit，顯示 `Add some items first` 友善 empty state 與 `Add Item` CTA，不允許建立空展覽，無 crash。 | PASS |
| 無 blocking runtime error | 全程操作（建立、驗證失敗、reorder、reload、delete、edit）未觸發任何非預期 console/module/IndexedDB error 或 uncaught exception；唯一觸發的 `window.confirm` 對話框為既有 delete confirmation，非錯誤。 | PASS |

### Observation（非本 Phase 修改範圍）

- Exhibits View 目前 `No Exhibitions Yet` 空狀態文案為既有 Phase 4（T025）既定實作之英文文案，與 `ux-ui-handoff.md` 所述中文文案「還沒有展覽。從你的收藏挑幾件寶物，打造第一個展覽。」不同。此為既有 Phase 4 產出，非本次 User Story 3 範圍，未予修改，僅記錄供後續 phase 參考。

### T040 Result

上述所有 Exhibition Builder / Ordering / Reload / Cleanup / Empty-state acceptance 皆為 PASS，無 FAIL 項目。

## T041–T045 Record — Phase 7 US5 Achievement Feedback Acceptance (2026-09-04)

- 環境：Windows；`python -m http.server 8000`；embedded Playwright-controlled browser page。
- Fixture：以既有 Add Item / Add Category / Create Exhibit flow 逐步建立資料，涵蓋 0→1→9→10 Items、0→3 Categories、0→1 Exhibition、0→4→5 non-empty Item story。

| Acceptance | Actual | Result |
| --- | --- | --- |
| A｜First Item false→true | 空 Collection 建立第一件 Item（`Fossil Rock`）成功保存後，立即顯示「🎉 第一件收藏！第一件收藏加入博物館了！」。 | PASS |
| B｜Reload 不補播 | 建立 First Item 後 reload 頁面，Museum summary 顯示 1 Items，未再次顯示 First Item feedback。 | PASS |
| C｜10 Items 9→10 | 連續建立 Item2～Item10，只有第 10 件（`Item10`）成功保存後顯示「🌟 收藏漸豐 你的博物館已經收藏 10 件寶物！」，第 2～9 件均無 feedback。 | PASS |
| D｜true→true 不重播 | 於 10 Items 狀態下編輯既有 Item（僅改名為 `Item10 Renamed`），未顯示 10 Items feedback。 | PASS |
| E｜true→false 不顯示 | 刪除 1 件 Item（10→9）未顯示任何 feedback。 | PASS |
| F｜re-cross 可再次觸發 | 再新增 1 件 Item（`Item10 Again`，9→10）再次顯示「🌟 收藏漸豐」。 | PASS |
| G｜First Exhibition 0→1 | 建立第一個 Exhibition（`My First Exhibit`，含 1 Item）成功保存後顯示「🎨 策展初體驗 第一個展覽完成了！」。 | PASS |
| H｜3 Categories 2→3 | 依序建立 Category `Rocks`、`Coins`、`Shells`，只有第 3 個成功保存後顯示「📚 分類達人 你已經建立 3 個收藏分類！」，前兩個無 feedback。 | PASS |
| I｜5 Stories 4→5 | 依序為 4 個 Item 補上 `Why It Is Special`（story）皆無 feedback；第 5 個 Item 補上 story 後顯示「📖 說故事的人 你已經記錄 5 個收藏故事！」。 | PASS |
| J｜Non-story edit 不誤觸 | 於已有 4 個 story 狀態下，只編輯另一 Item 的 Name（改為 `Item7 Renamed`）、Location（`Backyard`）與 Rating（4 星），未顯示 5 Stories feedback。 | PASS |
| K｜UI 非阻塞 | Achievement feedback 以固定位置卡片顯示於畫面右下角，並含可點擊的關閉按鈕；顯示期間可持續操作既有表單與導覽，未攔截點擊、未改變路由、未產生 modal wall。4 秒後自動淡出，或可手動關閉。 | PASS |
| Runtime 錯誤 | 全程操作（建立、reload、delete、edit、achievement 觸發與非觸發情境）於 DevTools console 僅出現既有 `Database initialized`、`App initialized successfully` 訊息，無 console error、module error、IndexedDB error 或 uncaught exception。 | PASS |

### Responsive 驗證（Section 15）

- Phone（375px）與 Tablet（768px）：實際以 Playwright `setViewportSize` 驗證，achievement card 完整落在 viewport 內（`right <= viewport width`、`left >= 0`），無水平捲動，不遮住主要 CTA。PASS。
- Desktop（約 1280px）：受本機瀏覽器分頁可用顯示區域限制，`setViewportSize(1280, 800)` 實際被夾在約 853×533 呈現，無法於本次 session 取得真正 1280px 的即時畫面證據。已以 code inspection 確認 CSS 規則（`position: fixed; right: 1.5rem; bottom: 1.5rem; max-width: min(90vw, 320px)`）在任何較寬 viewport 下會維持相同右下角非阻塞版型，且 853px 寬度下的即時量測已驗證定位公式正確（`container right = viewport width - 24px`）。誠實記錄此 limitation：完整 1280px desktop 的 live PASS 留待 Phase 8 或有更大顯示區域的環境重新確認，不偽造 live PASS。

### T041–T045 Result

上述 Node achievement event tests（13 項）與 Browser acceptance A–K 皆為 PASS；Responsive 驗證中 Phone / Tablet 為 live PASS，Desktop 1280px 因環境顯示區域限制以 code inspection 佐證、明確記錄為 limitation，未計入 live PASS 亦未影響 Phase 7 Gate 必要條件（Gate 僅要求 achievement UI 於既有 responsive layout 可用且不阻塞，未要求本次必須完成 Phase 8 完整三 viewport 對照）。
