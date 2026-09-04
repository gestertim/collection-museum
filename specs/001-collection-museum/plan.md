# Implementation Plan: 我的收藏博物館 Collection Museum

**Branch**: `001-collection-museum` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-collection-museum/spec.md`，並依 [ux-ui-handoff.md](ux-ui-handoff.md) 實作介面行為。


## Summary

建立單一使用者、單一裝置的 private-first 收藏博物館。使用者可建立帶有可選照片與 Museum Label 的 Collection Item，管理 Custom Category，從既有 Items 建立並排序 Exhibition，並在以照片為主角的 Museum Gallery 中瀏覽。實作採 HTML5、CSS 與 Vanilla JavaScript ES Modules；以 IndexedDB 保存 Items、Categories、Exhibitions 與照片 Blob，不建立 Backend、Cloud Database、Authentication、External API、Generative AI、PWA 或 runtime third-party dependency。

## Artifact Ownership

- Specification = Product Truth
- Constitution = Engineering Governance
- UX/UI Handoff / UI Contract = Interaction Truth
- Plan = Technical Truth
- Tasks = Executable Work
- Verification documents = Detailed Verification Procedure / Evidence

其他 artifacts 僅引用 canonical requirement，不複製完整 normative rule 或 verification protocol。

## Technical Context

**Language/Version**: HTML5、CSS、Vanilla JavaScript ES Modules；測試執行環境為支援 ES modules 的 Node.js（使用內建 `node:test`）

**Primary Dependencies**: 0 runtime third-party dependencies；瀏覽器原生 IndexedDB、File/Blob、Canvas 與 DOM API

**Storage**: IndexedDB，單一 database、以 `items`、`categories`、`exhibitions` stores 保存 domain data；photo 保存為壓縮後 Blob

**Testing**: 建立最小 `package.json` 並設定 `"type": "module"`，使用 Node 內建 `node:test`，執行命令為 `node --test`；不加入 test framework 或其他 third-party dependency。Testing Strategy 分為四個邊界：Node Pure Logic Tests、Browser Integration / Acceptance、Usability / Field Validation、Phase-level Verification Records。

**Target Platform**: 支援 IndexedDB、ES modules、File input、Canvas 與基本 responsive CSS 的現代桌面及行動瀏覽器；以 static hosting 或 `python3 -m http.server` 提供

**Project Type**: frontend-only static web application

**Observable Interaction**: 使用者切換 Category、開啟 Item 或 Exhibition 後，畫面應在同一次操作中更新，不需要手動重新載入頁面。findability 時間驗證只由 SC-008 的 usability acceptance test 負責，不新增毫秒級 performance SLA。

**Constraints**: 不使用 Backend、Cloud、Authentication、external/backend API、AI、router dependency、global state library 或 PWA；可使用 browser-native APIs，包括 IndexedDB API、Canvas API、File API、Blob API 與 DOM APIs，這些不構成 B 級 escalation。照片可選；照片選擇/權限/解碼/壓縮失敗不得阻止 Item 建立；save failure 必須保留目前表單內容並提供 retry；同一裝置的 IndexedDB 不代表加密或跨裝置同步

**Scale/Scope**: 單一 private museum、單一瀏覽器 profile、預期數十件 Items；四個主導覽 views（museum、collection、exhibits、add item）及其 Item/Exhibition detail/form 狀態，不新增 Profile、Favorites 或獨立 Categories 導覽

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | 結果 | 說明 |
|---|---|---|
| I. Simplest Sufficient Technology | PASS | 需求以原生 HTML/CSS/ES modules 與 IndexedDB 足以完成，runtime dependency 為 0。 |
| II. A/B/C Complexity Discipline | PASS | 維持 A｜Frontend-first Beginner MVP，不引入 server、shared data、auth 或 AI。 |
| III. Specification Before Implementation | PASS | 本 plan 僅將已確認 Specification 與 UX/UI Handoff 轉成技術設計。 |
| IV. Technology Stack Stability | PASS | 嚴格採用 approved stack，不替換或升級主要技術。 |
| V. Privacy & Educational Safety | PASS | 資料只留在當前裝置；不提供 publishing、social comparison、streak、價格或購買誘導。 |
| VI. Testability | PASS | 純邏輯以 Node 內建 `node:test` 測試，核心流程以 acceptance scenarios 驗證。 |
| VII. Maintainability | PASS | 以少量明確模組分離 DB、domain logic、image 與 UI，不建立過度 abstraction。 |
| VIII. Incremental Implementation | PASS | 先完成 Item persistence/validation，再接 Category、Exhibition、Gallery 與 feedback。 |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── verification/         # phase、browser、usability 與 field validation records
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
```text
index.html
css/
└── styles.css
js/
├── app.js          # bootstrap、in-memory view switching、application events
├── db.js           # IndexedDB open、CRUD、transaction/error handling
├── items.js        # Item validation、filtering、delete cleanup
├── categories.js   # Category validation、CRUD、uncategorize transformation
├── exhibitions.js  # Exhibition validation、ordering、stale reference cleanup
├── ui.js            # render functions、dialogs、empty/error/success states
├── image.js         # file validation、preview、resize/compress、Blob handling
└── achievements.js  # derived threshold crossing conditions and feedback data
tests/
├── validation.test.js
├── categories.test.js
├── exhibitions.test.js
├── ui.test.js
└── achievements.test.js
```

**Structure Decision**: 採 repository root 的單一 static frontend 結構。`js/` 只放具體 domain/browser modules，`tests/` 只測不依賴 DOM/IndexedDB 的 pure logic；不建立 frontend/backend、models/services framework 或額外 architecture layer。UI view contract、狀態與可觀察互動見 [contracts/ui-contract.md](contracts/ui-contract.md)。
## Technical Design

- `db.js` 建立 version 1 database 與三個 stores；所有 create/update/delete 在短 transaction 內完成，commit 成功前不清除表單狀態。
- `items.js`、`categories.js`、`exhibitions.js` 暴露可由 Node 載入的純驗證與轉換函式；瀏覽器 persistence adapter 由 `db.js` 呼叫。
- Category persistence 必須實作 FR-006；資料層保存單一可選的 `categoryId`，刪除後將 affected Items 轉為 `null`。Item delete 先確認，再刪 Item 並從每個引用它的 Exhibition 的 ordered `itemIds` 移除。
- Exhibition 建立/編輯只接受非空 name、至少一個現存 Item 且 itemIds 不重複；陣列順序即展示順序。
- `image.js` 驗證 image MIME、解碼後將最長邊縮小至最多約 1600 px，優先以 Canvas `toBlob` 輸出 WebP，image quality parameter 使用 0.8；WebP 失敗時以 JPEG、quality 0.8 fallback，成功後以 Blob 保存至 IndexedDB。這個 0.8 是 image quality parameter，不是 resize ratio。若權限、解碼、WebP/JPEG fallback 或其他圖片處理都失敗，Photo step / Photo area 顯示 inline、簡短且非責備式錯誤，保留全部文字 draft，不使用 blocking modal 作為主要處理，提供「重新選擇照片」與「不使用照片繼續」，且不限制 retry 次數。第一版不建立多輪壓縮、動態品質演算法或複雜檔案大小最佳化流程；任何 image failure 都不得阻止 Item save。
- Collection Item 的 `createdAt`/`updatedAt` 使用 JavaScript `Date` 可解析的 ISO 8601 UTC timestamp（例如 `YYYY-MM-DDTHH:mm:ss.sssZ`）。`createdAt` 只在第一次成功建立並保存時產生，成功 Edit Item 不得改變；`updatedAt` 在第一次建立及每次成功修改時產生/更新。Featured Items 依有效 `createdAt` 由新到舊排序；相同 timestamp 與 invalid/missing timestamp 都以 `id` 升冪 lexical ordering 作 deterministic tie-breaker，invalid/missing 排在 valid 之後；不得使用 Rating tie-breaker，不建立 migration framework。
- Exhibition create/save validation 要求非空 name 與至少一件 Item；Item deletion 可使既有 Exhibition 合法保留為空 `itemIds`，重新編輯保存時仍套用至少一件 Item 的 validation。
- `app.js` 使用原生事件與 in-memory view state 切換 views，不把 URL hash 當成 route contract，也不使用 router library；資料變更後重新讀取資料再 render，避免 stale UI state。T019 先完成 Item persistence/app wiring，T026 再整合 Museum、Collection、Exhibits 的 app wiring，避免兩個任務平行修改 `js/app.js`。
- `ui.js` 暴露可獨立測試的 pure helper `getMuseumSummary(items, categories, exhibitions)` 與 Featured Items selection/sorting helper。前者輸入三個 array，回傳 `{ itemCount, categoryCount, exhibitionCount }`；後者依有效 `createdAt` descending 選取最多四件，相同 timestamp 及 invalid/missing timestamp 都以 `id` 升冪 lexical ordering 作 deterministic tie-breaker，invalid/missing 排在 valid 之後。兩者都不依賴 DOM、IndexedDB 或 browser globals；不建立 summary 或 recommendation module。
- Achievement 不建立獨立 persistence model，也不保存 displayed state；由成功 mutation 前後的 Items、Categories、Exhibitions 狀態動態比較。只有成功且確實改變 domain data 的 Item/Category/Exhibition mutation 使條件 `false → true` 時顯示達成當下的私人 feedback；其他方向不顯示，reload 不補播，跌回後可由後續成功 mutation 再次跨越。5 Item Stories Told 僅計數 `Why It Is Special` 在 `trim()` 後非空的 Items。

## Verification Planning

- SC-001～SC-008 的 Human Usability Validation 依 `verification/usability.md` 的唯一正式 protocol 執行；該文件維護 fixture、timing、sample rule、PASS/FAIL/Insufficient Sample 與 record format，plan 不重複 protocol 細節。
- SC-009 依 `verification/field-validation.md` 的唯一正式 field-validation protocol 執行；該文件維護 participant、fixture、steps、sample rule、PASS/FAIL/Insufficient Sample 與 record format，plan 不重複 protocol 細節。
- Featured Items 的 pure selection/sorting 由既有 `ui.js` helper 與 Node pure-logic test 覆蓋；Museum Home 的 0/1–4/5+、ordering、invalid timestamp 與 reload consistency 由 `verification/browser-integration.md` 的 browser evidence 覆蓋。

### Testing Strategy

1. **Node Pure Logic Tests**：使用 `node --test`，只測不依賴 DOM、IndexedDB、Canvas 或 browser globals 的 validation、Achievement threshold logic、Exhibition ordering pure functions、Category relationship rules、`ui.js` 的 `getMuseumSummary` 與 delete-reference transformation logic。summary 的 Node test 只驗證 helper 回傳值，不驗證 DOM render。
2. **Browser Integration / Acceptance**：使用 local static server 與真實 browser，驗證 IndexedDB persistence、reload behavior、photo Blob persistence、Canvas image conversion、DOM rendering、navigation、responsive behavior 與 inline error recovery。第一版不引入 Playwright、Cypress、Vitest、Jest、jsdom 或其他 dependency。SC-007 persistence、SC-010 cascade、SC-011 responsive 與 FR-021 Featured browser evidence 依 `verification/browser-integration.md` 的 canonical records 執行。
3. **Usability / Field Validation**：SC-001～SC-006 與 SC-008 依 `verification/usability.md` 唯一 Human Usability Validation protocol；SC-009 依 `verification/field-validation.md`，不由 `node --test` 取代。涉及真實使用者時間、比例、理解感受的 criteria 不得由 automated tests 取代。
4. **Phase completion evidence**：Phase 1 Setup 與 Phase 2 Foundational 各自完成明確 verification task，結果保存於 `verification/phase-01-setup.md` 與 `verification/phase-02-foundational.md`。後續 User Story / Feature phase 以既有 automated tests、Story acceptance、browser verification 或 Success Criteria verification（適用時含 usability/field validation）形成 explicit Phase Completion Gate；必要 evidence 必須 PASS 才能開始依賴該 phase 的下一個 implementation increment，不另建重複 verification record。Implementation Phase Gate PASS 只代表該 increment 有足夠 evidence 安全前進，不等於所有 SC 已完成真人 field validation；SC-001～SC-006、SC-008、SC-009 若尚未取得完整真人樣本，可保持 Protocol Ready / 待實地驗證，且不阻塞前面的 implementation increment。

`node --test` 不負責 DOM rendering、IndexedDB real persistence、Canvas、Blob browser persistence、responsive viewport 或 human usability metrics；這些由 browser / human validation 負責。

## Complexity Tracking

Constitution gates 全部通過，沒有需要例外批准的複雜度。
