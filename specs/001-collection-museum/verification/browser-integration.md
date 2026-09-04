# Browser Integration Verification Record

- 驗證日期：2026-09-04（Phase 3 US1）
- 對應 requirement：FR-021、SC-007、SC-010、SC-011；T022 quickstart smoke record
- 環境：Windows；local static server；真實 browser；約 375px、768px、1280px viewport
- 狀態：Phase 3 US1 PASS；T022/T055/T048 待後續 phase

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

T022/T055/T048 remain pending for later phases. The US1 evidence above is the Phase 3 story acceptance record.

## Result

待執行。T055 任何一項 SC-007 欄位或 photo/order 比對不一致即 FAIL；T048 任一 SC-010/SC-011 條件不符即 FAIL；T022 缺少可用環境或有效結果時標示 Insufficient Sample。
