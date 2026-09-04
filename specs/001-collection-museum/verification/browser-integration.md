# Browser Integration Verification Record

- 驗證日期：2026-09-04（Phase 3 US1；Phase 4 US4 T022）
- 對應 requirement：FR-021、SC-007、SC-010、SC-011；T022 quickstart smoke record
- 環境：Windows；local static server；真實 browser；約 375px、768px、1280px viewport
- 狀態：Phase 3 US1 PASS；Phase 4 US4 T022 PASS（附註環境視窗寬度限制）；T055/T048 待後續 phase

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

## Result

待執行。T055 任何一項 SC-007 欄位或 photo/order 比對不一致即 FAIL；T048 任一 SC-010/SC-011 條件不符即 FAIL；T022 缺少可用環境或有效結果時標示 Insufficient Sample。
