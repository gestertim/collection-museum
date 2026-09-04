---

description: "我的收藏博物館的可執行任務清單"
---

# Tasks: 我的收藏博物館 Collection Museum

**Input**: Design documents from `/specs/001-collection-museum/`

**Prerequisites**: `plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/ui-contract.md`、`quickstart.md`

**Implementation constraint**: HTML5、CSS、Vanilla JavaScript ES Modules、IndexedDB；不得加入 runtime third-party dependency、Backend、Authentication、Cloud sync 或 social controls。

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立 static frontend、測試目錄與瀏覽器入口。

- [ ] T001 建立 `index.html`、`css/styles.css`、`js/` 與 `tests/` 的 repository root 結構
- [ ] T002 [P] 建立 `index.html` 的 Museum 首頁骨架、四個主導覽入口與 ES module 載入點
- [ ] T003 [P] 建立最小 `package.json`（至少包含 `"type": "module"`，可選最小 `"test": "node --test"` script），建立 `tests/` 的 Node `node:test` 執行約定與 `js/` 模組的 ES module 匯出邊界；不加入 runtime 或 test framework third-party dependency，也不使用 npm scaffold
- [ ] T004 [P] 在 `css/styles.css` 建立 warm off-white、black、deep green 的設計變數、typography、responsive layout 基線
- [ ] T004V 完成 Phase 1 Setup verification：確認未執行 `npm create vite .`、`npx create-vite@latest .` 或 `create-next-app .`，保留 `.git/`、`.github/`、`.specify/`、`specs/`；確認若存在 `package.json` 僅有最小 ESM 設定（`"type": "module"`）、無 runtime third-party、Backend/Cloud/Auth/AI package；執行 `node --test` 確認 Node ESM/test runner 可啟動；比對實際檔案結構與 plan 核准結構且無未批准 framework scaffold，將步驟、Expected、Actual 與 PASS/FAIL 寫入 `verification/phase-01-setup.md`。若尚無實質測試，記錄 runner 啟動結果，不新增第三方 test framework。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 完成所有 user stories 依賴的 persistence、影像、驗證、導航與共用 UI 狀態。

**CRITICAL**: 本階段完成前不得開始 user story implementation。

- [X] T005 在 `js/db.js` 建立 version 1 IndexedDB、`items`、`categories`、`exhibitions` stores 與 schema upgrade
- [X] T006 [P] 在 `js/db.js` 實作 item、category、exhibition 的短 transaction CRUD、讀取失敗與 transaction abort 錯誤回傳
- [X] T007 [P] [Image Pipeline] 在 `js/image.js` 實作 image input handling helper、MIME 驗證、Canvas decode、最長邊最多約 1600 px resize、優先以 Canvas `toBlob` 輸出 WebP、image quality parameter 0.8、JPEG fallback，回傳成功 Blob 或明確 failure result；不負責完整 Item form UX、draft UI、retry control 或 save orchestration
- [X] T008 [P] 在 `js/items.js` 實作 trimmed name、rating 1 至 5、可選欄位、`createdAt`/`updatedAt` lifecycle 與 item delete reference cleanup 的純邏輯；首次成功建立才產生 `createdAt`，Edit 不改變，成功修改更新 `updatedAt`
- [X] T009 [P] 在 `js/categories.js` 實作 category name 驗證、single-category assignment 與 delete 後轉為 Uncategorized 的純邏輯
- [X] T010 [P] 在 `js/exhibitions.js` 實作 exhibition name、至少一件現存 item、不可重複 itemIds 與 ordering 的純邏輯
- [X] T011 [P] 在 `js/achievements.js` 實作五項 derived achievement 條件計算與成功 mutation 前後的 event crossing 判定，不建立額外 persistence/displayed state；只有 `false → true` 回傳 feedback，story 只計算 trimmed Why It Is Special
- [X] T012 在 `js/ui.js` 建立 loading、empty、not-found、recoverable error、success feedback 與 confirmation dialog 的共用 render helpers
- [X] T013 在 `js/app.js` 建立 in-memory view switching、資料變更後從 IndexedDB reload 再 render，以及 global retry/error wiring
- [ ] T013V 完成 Phase 2 Foundational verification，且在開始第一個 User Story 前執行：在 browser context 驗證 IndexedDB 初始化、`items`/`categories`/`exhibitions` stores 與 schema 建立、基本資料讀寫 smoke check、image helper 的最小 browser 行為邊界；以 `node --test` 驗證 domain validation pure logic；確認 UI/app shell 不要求 Backend 或 external API 且無 stack drift。將每一步的 Expected、Actual 與 PASS/FAIL 寫入 `verification/phase-02-foundational.md`；若 Phase 2 尚未 implementation，先保留待執行項目，不得標示 PASS。

**Foundational Boundary**: 只有 `T013V` 的 `verification/phase-02-foundational.md` evidence PASS 後，才可開始第一個 User Story；這是 Constitution VIII 的 blocking prerequisite，不是 User Story Phase Completion Gate。

---

## Phase 3: User Story 1 - 記錄一件收藏 (Priority: P1)

**Goal**: 孩子可用唯一必要的 Name 建立 Item，稍後補充 Museum Label、照片與可選欄位，並重新開啟確認保存。

**Independent Test**: 在 `#/add-item` 只輸入非空 Name 完成保存，從 `#/collection` 找到並開啟；補充照片、category、location、story、rating 後重新開啟仍看得到；空白名稱、照片失敗與 save failure 都不遺失輸入。

### Tests for User Story 1

- [X] T014 [P] [US1] 在 `tests/validation.test.js` 覆蓋 trimmed name、空白名稱阻止保存與 rating 允許空值/拒絕 0 或 6
- [X] T015 [P] [US1] 在 `tests/validation.test.js` 覆蓋 item delete 時從所有 exhibition ordered itemIds 移除 reference 且保留 exhibition

### Implementation for User Story 1

- [X] T016 [US1] 在 `js/items.js` 完成 Collection Item 建立、更新、刪除資料轉換，並保留 save failure 時可重試的輸入模型
- [X] T017 [US1] [Add Item UI] 在 `js/ui.js` 實作 `#/add-item` 的 Photograph → Museum Label → Add to Museum 三步驟、photo step preview、inline photo error、保留 draft、Retry / choose another、Continue without photo 與成功後 View Item/Add Another；不重新實作 image pipeline 或 save orchestration
- [X] T018 [US1] 在 `js/ui.js` 實作 `#/item/:id` 的照片主視覺、Museum Label 欄位、Edit Label、Add to Exhibit 入口與 not-found 狀態
- [X] T019 [US1] [Item Save Orchestration] 在 `js/app.js` 組合 form data 與 image result、執行 IndexedDB commit、validation error、generic save failure preservation、retry、無照片保存與成功後重新讀取 render；不得清空 draft，不重新實作 image pipeline 或完整 Photo UI
- [X] T020 [US1] 在 `js/app.js` 串接確認式 Item delete，成功後同步更新相關 Exhibitions，取消時維持 Item 與 Exhibition 原狀

**US1 Phase Completion Gate**

- Evidence：T014–T015 的 Item validation/reference-cleanup tests 與相關 `node --test` output 必須 PASS。
- Evidence：既有 `verification/usability.md` 的 US1 Story acceptance 必須涵蓋建立 Item、Name required、無照片建立、保存後重新找到 Item、重新開啟 Museum Label，以及已輸入資料保持正確；既有 `verification/browser-integration.md` 的 browser evidence 必須涵蓋 persistence/error behavior，不提前要求完整 SC-007 field protocol。
- 結果寫入既有 canonical browser/story verification records；不得新增 phase record。
- PASS：上述所有 US1 必要 automated、Story acceptance 與既有 browser evidence 通過。FAIL：任何必要 evidence 未通過。只有 PASS 後，依賴 US1 Item capability 的 US4、US2、US3、US5 才可開始。

---

## Phase 4: User Story 4 - 參觀我的博物館 (Priority: P1)

**Goal**: Museum 首頁與 Gallery 讓孩子以照片為主角瀏覽 Items/Exhibitions，並可進入 Item Label 或 Exhibition 詳情。

**Independent Test**: 準備含照片與不含照片的 Items 及 Exhibition，開啟 Museum/Collection/Exhibits，確認每個入口可用、缺照片仍可辨識，並確認沒有社交或價格訊號。

### Tests for User Story 4

- [ ] T021 [P] [US4] 在既有 `js/ui.js` 的 pure function 邊界實作並以 `node:test` 驗證 `getMuseumSummary(items, categories, exhibitions)` 與 Featured Items selection/sorting helper；驗證 summary counts，以及 valid `createdAt` descending、相同 timestamp 以 `id` 升冪、最多 4 件、invalid/missing timestamp 排在 valid timestamp 後方且彼此以 `id` 升冪，不依賴 DOM、IndexedDB、Canvas 或 browser globals，且不建立 summary.js、recommendation module、新 domain layer 或 summary contract
- [ ] T022 [US4] 執行輕量 browser smoke / quickstart verification：使用支援 IndexedDB、Canvas、ES Modules 的現代瀏覽器，透過既定 local static server，以約 1280px desktop viewport，使用既定 quickstart fixture 或最小可重現 sample data（不重新定義 SC-001～SC-011 fixture）。確認 App 可開啟、主導覽可操作、Museum Home 可 render、Collection / Exhibits / Add Item 入口可進入且無 blocking runtime error；Museum summary 三個數字的 DOM 顯示由此 browser check 驗證。結果寫入 `verification/browser-integration.md` 的 T022 record，並記錄 environment、fixture、steps、Expected、Actual、PASS/FAIL 或 Insufficient Sample

### Implementation for User Story 4

- [ ] T023 [US4] 在 `js/ui.js` 實作 `#/museum` 的固定標題「My Collection Museum」、Items/Categories/Exhibits summary、Featured Items、My Exhibits、Add New Item 與首次使用 empty state；不加入 title 編輯或 Settings
- [ ] T024 [US4] 在 `js/ui.js` 實作 `#/collection` photo cards、只負責 filter 的 All/既有 Category/Uncategorized controls、獨立 Add Category control、selected state、museum-style 缺照片 placeholder 與 Item Label click action
- [ ] T025 [US4] 在 `js/ui.js` 實作 `#/exhibits` cards 的 name、representative image、item count、Create Exhibit、無 Exhibition 時的友善 empty state 與 Create Exhibit CTA，以及 error/not-found 狀態
- [ ] T026 [US4] 在 `js/app.js` 串接 Museum、Collection、Exhibits 的資料讀取、in-memory view switching、Item/Exhibition detail state 與 mutation 後同步 render
- [ ] T027 [US4] 在 `css/styles.css` 完成 photo-first gallery 的 phone 1–2 欄、tablet 2–3 欄、desktop 3–4 欄及可閱讀 Museum Label 寬度

**US4 Phase Completion Gate**

- Evidence：T021 的 `node --test` pure helper output 必須 PASS；T022 的 `verification/browser-integration.md` T022 record 必須有 App shell、navigation、Museum summary 與無 blocking runtime error 的 PASS evidence；US4 Story acceptance 必須確認 Gallery 入口、photo/no-photo Item 與 Exhibition detail 可達。
- PASS：上述 automated、T022 browser 與 US4 Story acceptance evidence 通過。FAIL：任一必要 evidence 未通過；不以尚未執行的 human usability sample 取代本 gate。

---

## Phase 5: User Story 2 - 整理我的分類 (Priority: P2)

**Goal**: 孩子可建立、重新命名、刪除 Category，將 Items 指派至單一分類並依分類瀏覽。

**Independent Test**: 建立 Category 並分配多個既有 Items，使用 category chip 找到它們；rename 後關聯仍在；刪除後 Items 保留並顯示 Uncategorized。

### Tests for User Story 2

- [ ] T028 [P] [US2] 在 `tests/categories.test.js` 覆蓋 category name 驗證、rename、single-category replacement 與 delete transformation
- [ ] T029 [US2] 在 `tests/categories.test.js` 覆蓋刪除 Category 不刪 Item 且所有 affected categoryId 變為 null

### Implementation for User Story 2

- [ ] T030 [US2] 在 `js/categories.js` 完成 Category create、rename、delete 與 Item assignment 的 persistence-facing operation
- [ ] T031 [US2] 在 `js/ui.js` 實作 Collection View 的獨立 Add Category、rename/delete confirmation、只提供 Uncategorized/既有 Categories 的 Item category selector 與 filter controls，明確顯示 Uncategorized；不加入 Item form inline category creation、modal category creation 或 tag creation
- [ ] T032 [US2] 在 `js/app.js` 串接 Category CRUD、Item category replacement、delete 後 affected Items reload 與 validation/save failure retry
- [ ] T033 [US2] 在 `quickstart.md` 執行 Category create、rename、filter、delete acceptance journey 並確認 Items 不消失

**US2 Phase Completion Gate**

- Evidence：T028–T029 category validation/delete-transformation tests 與相關 `node --test` output 必須 PASS；T033 quickstart acceptance 必須確認 create、rename、filter、delete 後 Items 保留且變為 Uncategorized。
- PASS：上述 automated 與既有 quickstart/Story acceptance evidence 通過。FAIL：任一必要 evidence 未通過；不新增重複 verification record。

---

## Phase 6: User Story 3 - 製作我的展覽 (Priority: P2)

**Goal**: 孩子可選擇既有 Items 建立命名 Exhibition、調整並保存策展順序，之後重新開啟。

**Independent Test**: 選至少一件 Item 建立 Exhibition，調整順序並離開，再次開啟確認名稱、展品與順序一致；空名稱或零展品不得保存。

### Tests for User Story 3

- [ ] T034 [P] [US3] 在 `tests/exhibitions.test.js` 覆蓋非空 name、至少一件現存 item、duplicate itemIds rejection 與 ordering preservation
- [ ] T035 [US3] 在 `tests/exhibitions.test.js` 覆蓋 Item deletion 後 exhibition 保留、stale reference cleanup 與空展覽可讀取

### Implementation for User Story 3

- [ ] T036 [US3] 在 `js/exhibitions.js` 完成 Exhibition create、rename/update order、read 與 stale item reference 過濾
- [ ] T037 [US3] 在 `js/ui.js` 實作 Create Exhibit 表單、Item selection、至少一件驗證，以及不使用 drag-and-drop 的 Move Up/Move Down reorder controls；第一項 Move Up、最後一項 Move Down 不可用，操作後立即更新畫面
- [ ] T038 [US3] 在 `js/ui.js` 實作 `#/exhibition/:id` 依 itemIds 順序顯示大型照片、缺照片入口與點擊 Item Label
- [ ] T039 [US3] 在 `js/app.js` 串接 Exhibition CRUD、save failure retry、重新開啟與 Item deletion 後重載 exhibition
- [ ] T040 [US3] 在 `quickstart.md` 執行 Exhibition create、reorder、reload 與 empty-selection acceptance journey

**US3 Phase Completion Gate**

- Evidence：T034–T035 Exhibition validation、ordering、delete cleanup 與 empty-after-deletion tests 與相關 `node --test` output 必須 PASS；T040 quickstart acceptance 必須確認 create、reorder、reload、empty-selection validation，以及刪除最後 Item 後 Exhibition 保留為空。
- PASS：上述 automated 與既有 quickstart/Story acceptance evidence 通過。FAIL：任一必要 evidence 未通過；空展覽後續重新保存仍須通過既有至少一件 Item validation。

---

## Phase 7: User Story 5 - 看見自己的收藏成長 (Priority: P3)

**Goal**: 以非阻塞、只對本人可見的 feedback 顯示五項 derived achievement，不加入比較、streak 或購買誘導。

**Independent Test**: 依序達成 First Item Cataloged、10 Items Cataloged、First Exhibit Created、3 Categories Created、5 Item Stories Told，確認各 feedback 出現且沒有公開互動或壓力設計。

### Tests for User Story 5

- [ ] T041 [P] [US5] 在 `tests/achievements.test.js` 覆蓋五項 achievement 的 threshold、story 非空計數與未達成狀態，並以 event behavior 驗證：Case A 9→10 成功建立第 10 件只顯示一次；Case B 已有 10 件後 reload/init 不顯示；Case C 10 件中修改一件仍是 10 件不重複；Case D 10→9 delete 不顯示、再 9→10 create 可再次顯示
- [ ] T042 [US5] 在 `tests/achievements.test.js` 覆蓋 `false → true`、`true → true`、`false → false`、`true → false` 的事件判定，確認只有成功且確實改變 domain data 的 Item/Category/Exhibition mutation 才比較 before/after，startup/reload 不補播且不保存 displayed state

### Implementation for User Story 5

- [ ] T043 [US5] 在 `js/achievements.js` 完成 achievement threshold-crossing 條件與達成當下的事件式私人 feedback 純資料輸出，支援 Item create/update/delete、Category create/rename/delete、Item Category assignment change、Exhibition create/update/delete；不保存 `displayed`/`dismissed` state，不建立排行榜或購買提示
- [ ] T044 [US5] 在 `js/ui.js` 加入成功 mutation 後僅於 `false → true` 顯示溫和 achievement feedback；`true → true`、`false → false`、`true → false` 不顯示，reload 不補播，並排除 Share、Like、Comment、Followers、streak
- [ ] T045 [US5] 在 `js/app.js` 串接 achievement recalculation，使 feedback failure 不影響 Item、Category 或 Exhibition commit

**US5 Phase Completion Gate**

- Evidence：T041–T042 achievement event tests 與相關 `node --test` output 必須 PASS；US5 Story acceptance 必須確認五項私人 feedback 的 false → true 行為、reload 不補播、無比較/streak/購買誘導，且 feedback failure 不阻塞核心 workflow。
- PASS：上述 automated 與 US5 Story acceptance evidence 通過。FAIL：任一必要 evidence 未通過；未完成的真人 field validation 不得被誤列為 implementation blocker。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 完成跨 story 的錯誤恢復、responsive、private-first 驗證與交付檢查。

- [ ] T046 [P] [Cross-cutting Integration / Recovery Review] 以既有 T007 image pipeline、T017 Photo UI、T019 save orchestration 為基礎，驗證整合後的 photo pipeline error、UI recovery 與 save recovery 是否符合 FR-005/FR-016；不得重新實作前三者的 recovery behavior
- [ ] T047 [P] 在 `css/styles.css` 完成 cards、museum labels、focus states、touch targets 與 phone/tablet/desktop 不重疊檢查
- [ ] T048 執行 browser verification：依 `spec.md` SC-010 驗證 Item delete cascade（Item 移除、相關 Exhibitions 保留且不再含該 Item），並依 `spec.md` SC-011 唯一正式 browser protocol 以約 375px、768px、1280px 驗證 navigation、cards、placeholder、Museum Label、reorder controls 與水平溢出。結果寫入 `verification/browser-integration.md`；不執行或重複 SC-007 persistence protocol。
- [ ] T049 執行 `node --test`，修正所有 validation、category、exhibition、reference cleanup、timestamp lifecycle 與 Achievement event behavior 測試失敗
- [ ] T050 啟動 `python3 -m http.server` 執行 `quickstart.md` 全部流程，確認首頁、reload persistence、responsive gallery 與 private-only controls
- [ ] T051 更新 `quickstart.md` 的實際啟動/驗收結果與 `specs/001-collection-museum/tasks.md` 的完成狀態
- [ ] T052 [SC-008] 依 `verification/usability.md` 的 canonical findability protocol 執行 usability acceptance test，並將結果寫入同一份 verification record；不得在 tasks 重複另一份 SC-008 規則。
- [ ] T053 [SC-009] 依 `verification/field-validation.md` 的 canonical field-validation protocol 執行 post-implementation validation，並將結果寫入同一份 verification record；不得在 tasks 重複另一份 SC-009 規則。
- [ ] T054 [SC-001–SC-006] 執行 `verification/usability.md` 的 canonical usability protocol 並留下匿名 Participant ID、有效樣本數、PASS/FAIL、elapsed time（適用時）與 overall status；不得在 task 重複 sample algorithm。
- [ ] T055 [SC-007] 執行 `verification/browser-integration.md` 定義的唯一 SC-007 persistence protocol：使用固定 fixture，記錄保存前資料，連續兩次 reload，比對所有需 persistence 的欄位、IndexedDB 關聯、photo Blob 與 Exhibition ordered `itemIds`，並將 PASS/FAIL 結果寫入同一份 record；任何不一致即 FAIL。

**Phase 8 Phase Completion Gate**

- Evidence：T048、T049、T050、T052、T053、T054、T055 的既有 browser, automated, usability 與 field-validation records 必須各自呈現 PASS，或依 canonical protocol 明確呈現 Protocol Ready / 待實地驗證 / Insufficient Sample；未完成真人樣本的 SC-001～SC-006、SC-008、SC-009 不得偽造 PASS，但也不阻塞已完成的 implementation increment。
- PASS：所有已可執行的 implementation evidence 通過，且未把待實地驗證誤報為 implementation blocker。FAIL：任一已執行的必要 evidence FAIL，或 record 缺少結果。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**：無依賴；T002、T003、T004 可平行執行，T001 先建立目錄。
- **Phase 2 Foundational**：依賴 Phase 1；T006 依賴 T005，T012/T013 依賴共用模組邊界，其餘純邏輯任務可平行。
- **Phase 3 US1**：依賴 Phase 2；先完成 T014–T015，再完成 T016–T020。
- **Phase 4 US4**：依賴 Phase 2 與 `US1 Phase Completion Gate = PASS`；T019 完成後，T026 才可進行，T026 不得與 T019 平行修改 `js/app.js`。
- **Phase 5 US2**：依賴 Phase 2 與 `US1 Phase Completion Gate = PASS`；T028–T029 可平行，接著 T030–T033。
- **Phase 6 US3**：依賴 Phase 2 與 `US1 Phase Completion Gate = PASS`；T034–T035 可平行，接著 T036–T040。
- **Phase 7 US5**：依賴 Phase 2、`US1 Phase Completion Gate = PASS`、以及可讀取的 Items/Categories/Exhibitions 資料；若採既定增量順序，US2 與 US3 各自的 Phase Completion Gate 也必須 PASS 後才整合跨 domain achievement behavior。
- **Phase 8 Polish**：依賴所有目標 story；T049–T050 是最終 executable validation。

### User Story Dependencies

- **US1 (P1)**：只依賴 Foundational；是建議 MVP，提供其餘 stories 所需的 Item 資料。
- **US4 (P1)**：`depends on US1 Phase Completion Gate = PASS`；Gallery 可先用空 Exhibition state，但不得跳過 US1 Item capability evidence。
- **US2 (P2)**：`depends on US1 Phase Completion Gate = PASS`；不依賴 US3 或 US5。
- **US3 (P2)**：`depends on US1 Phase Completion Gate = PASS`；不依賴 Category 或 Achievement。
- **US5 (P3)**：`depends on US1 Phase Completion Gate = PASS`，並在需要跨 domain records 時依賴 US2/US3 各自 Gate = PASS；achievement 失敗不得阻塞已完成的核心 story。

### Parallel Opportunities

- Phase 1：T002、T003、T004。
- Phase 1：T004V 必須在 Setup 任務完成後執行並留下 record，才能進入 Phase 2。
- Phase 2：T007、T008、T009、T010、T011 可平行；T006 在 T005 後可與純邏輯任務平行；T013V 必須在 T005–T013 完成且在第一個 User Story 前執行。
- US1：T014、T015；完成測試後 T016 與影像邏輯可分工，但 `js/ui.js`/`js/app.js` 任務須順序整合。
- US4：T021、T022；T021 驗證既有 `js/ui.js` helper，T022 驗證 browser DOM 與 quickstart journey，T026 在 T019 完成後整合 `js/app.js`。
- US2/US3：各自的 pure-logic tests 可平行；兩個 story 的 domain modules 可由不同實作者平行。
- US5：T041、T042 可平行，UI 與 achievement calculator 可分工。
- 驗證：T052 與 T053 皆需在 implementation 後依各自 protocol 執行；T053 未取得真實樣本時不得標示 PASS。
- Polish：T046、T047 可平行；T048、T052–T055 依各自唯一 protocol 在 implementation 後執行。T048 與 T055 都寫入 `verification/browser-integration.md`，不得平行執行；T055 是 SC-007 唯一 protocol executor。

## Parallel Example: User Story 1

```text
Task: T014 [US1] 驗證 trimmed name、空白名稱與 rating 規則 in tests/validation.test.js
Task: T015 [US1] 驗證 Item deletion 的 exhibition reference cleanup in tests/validation.test.js

After tests are ready:
Task: T016 [US1] 完成 Item domain operations in js/items.js
Task: T017 [US1] 完成 Add Item 三步驟 UI in js/ui.js
Task: T019 [US1] 串接 add/edit persistence 與 retry in js/app.js
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1 Setup。
2. 完成 Phase 2 Foundational。
3. 完成 Phase 3 US1 的純邏輯、Add Item、Item Label、save retry 與 delete。
4. 執行 US1 independent test：只填 Name 建立、離開後重開、補充欄位、照片失敗與空白名稱。
5. MVP 通過後再加入 Museum Gallery、Category 與 Exhibition。

### Incremental Delivery

1. Phase 1–2：建立可持久保存且可驗證的基礎。
2. US1：交付可記錄與編輯收藏的 MVP。
3. US4：交付 Museum/Collection/Exhibits 瀏覽入口。
4. US2：交付分類整理。
5. US3：交付策展與 Exhibition View。
6. US5：最後加入不阻塞核心流程的私人 achievement feedback。
7. 每個 story 以自己的 independent test 驗證後再進入下一階段。

## Format Validation

所有 implementation 與 verification tasks 均使用 `- [ ]` checkbox；Setup/Foundational 的 T004V/T013V 與 SC-001–SC-009 的驗證任務明確標示驗證責任。Node pure logic、browser integration、usability/field validation 與 phase-level evidence 不混為同一測試邊界。T052/T053/T055 只引用各自 canonical verification document，不複製 protocol 規則。FR-008 僅作 Retired / Non-active 歷史追蹤，不映射為 active implementation task。

## Verification Boundaries

### Verification Coverage

| Success Criterion | Protocol executor |
|---|---|
| SC-007 | T055 |
| SC-008 | T052 |
| SC-009 | T053 |
| SC-010 | T048 |
| SC-011 | T048 |

### A. Node Pure Logic Tests

使用 `node --test`，只測不依賴 DOM、IndexedDB、Canvas 或 browser globals 的 validation、Achievement threshold logic、Exhibition ordering pure functions、Category relationship rules、summary selector/count logic 與 delete-reference transformation logic。

### B. Browser Integration / Manual Browser Verification

使用 local static server 與真實 browser，依可重現 protocol 驗證 IndexedDB persistence、reload behavior、photo Blob persistence、Canvas image conversion、DOM rendering、navigation、responsive behavior 與 inline error recovery。第一版不引入 Playwright、Cypress、Vitest、Jest、jsdom 或其他 dependency。

### D. Usability / Field Acceptance

SC-001～SC-008 依 `verification/usability.md` 的 canonical protocol；SC-009 依 `verification/field-validation.md` 的 canonical protocol。涉及真實使用者時間、比例、理解感受的 criteria 不得由 `node --test` 取代。

### D. Phase Completion Evidence

Phase 1 Setup 與 Phase 2 Foundational 必須各自完成明確且可重現的 phase-level verification，結果分別保存於 `verification/phase-01-setup.md` 與 `verification/phase-02-foundational.md`。後續 User Story / Feature phases 以既有 automated tests、Story acceptance、browser verification、Success Criteria verification 或適用的 usability/field validation 作為 completion evidence，不另建內容重複的 verification record；T048 與 T055 不得平行寫入同一 browser record。
