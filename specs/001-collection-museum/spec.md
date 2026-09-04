# Feature Specification: 我的收藏博物館 Collection Museum

**Feature Branch**: `001-collection-museum`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: 建立「我的收藏博物館 Collection Museum」正式 Product Specification，面向喜歡收集、分類、展示和講故事的孩子，提供私人收藏目錄、標籤、自訂分類、展覽建立與博物館瀏覽體驗。

## Product Vision

「我的收藏博物館」讓孩子把石頭、卡片、貼紙、模型、橡皮擦或其他私人收藏，整理成一座屬於自己的數位小博物館。收藏的價值來自分類、故事與個人意義，而不是價格。產品鼓勵孩子持續觀察與記錄生活中的收藏，不鼓勵購買更多物品。

**核心產品循環**: Find / Own → Photograph → Label → Categorize → Exhibit → Browse Museum → Keep Collecting

**產品等級**: A｜Frontend-first Beginner MVP

**產品 UX 概念**: Item → Label → Category → Exhibit → Museum。產品應讓孩子感受到自己正在整理與策劃一座博物館，而不是操作 database。

### Information Architecture and Visual Direction (Design Summary)

以下是設計摘要，正式行為以 FR-020～FR-026 為準：主導覽包含 Museum、Collection、Exhibits 與 Add Item；Museum 是首頁，呈現固定標題、衍生 summary、Featured Items、My Exhibits 與 Add New Item；Collection 與 Exhibition 以照片為主角，並採 Modern Natural History Museum 與 Collection Cabinet 的 visual language。第一版不提供 Profile、Favorites、Categories 主導覽、Settings、title editing、人工精選、AI recommendation、rating ranking、價格訊號或社交展示控制。版面方向為 Phone 1–2 欄、Tablet 2–3 欄、Desktop 3–4 欄，Museum Label 維持可閱讀寬度。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 記錄一件收藏 (Priority: P1)

孩子在生活中找到或取得一件有意義的物品後，可以建立 Collection Item，留下名稱與逐步補充的 Museum Label，之後再次找到並開啟這件收藏。

**Why this priority**: 收藏目錄與可持續保存的標籤是所有分類、展覽與瀏覽體驗的基礎，也是孩子開始說出收藏故事的最小價值。

**Independent Test**: 建立一件只填寫名稱的收藏，關閉或離開目前畫面後，從 Collection Catalog 找到並開啟它；再補充照片、分類、取得地點、故事與評分，重新開啟時確認資料仍在。

**Acceptance Scenarios**:

1. **Given** 孩子位於 Collection Catalog，**When** 輸入名稱並建立 Item，**Then** Item 出現在 Catalog 中，且之後可再次找到並開啟。
2. **Given** Item 只有名稱，**When** 孩子開啟 Museum Label 並補充任一可選欄位，**Then** 修改成功後重新開啟 Item 可看到已保存的資料。
3. **Given** 相機、圖片選擇或相關權限無法使用，**When** 孩子建立 Item，**Then** 系統仍允許在沒有照片的情況完成建立，並保留其他已輸入資料。
4. **Given** 名稱未填寫，**When** 孩子嘗試建立 Item，**Then** 系統阻止建立並清楚指出名稱是必要資料。
5. **Given** 孩子進入 Add Item，**When** 完成 Photograph、Museum Label、Add to Museum 三個步驟，**Then** 系統提供 View Item 與 Add Another 兩個後續選擇。

### User Story 2 - 整理我的分類 (Priority: P2)

孩子可以建立、重新命名與刪除自己的 Category，將收藏分組，並依 Category 瀏覽相關 Items。

**Why this priority**: 分類把一批零散的物品轉變成孩子理解自己的收藏方式，直接支持觀察、整理與探索。

**Independent Test**: 建立一個 Category，將多個既有 Items 分入其中並依分類瀏覽；重新命名後確認分類與 Items 保持關聯；刪除分類後確認 Items 沒有消失而變成 Uncategorized。

**Acceptance Scenarios**:

1. **Given** Catalog 中已有 Items，**When** 孩子建立 Category 並將 Items 分類，**Then** 這些 Items 顯示於該 Category，且可透過 Category 查看。
2. **Given** 已存在 Category，**When** 孩子重新命名 Category，**Then** 新名稱在相關畫面顯示，原本歸類的 Items 仍保留。
3. **Given** Category 中已有 Items，**When** 孩子確認刪除 Category，**Then** Category 被移除，Items 保留並轉為 Uncategorized。
4. **Given** Item 已屬於一個 Category，**When** 孩子將它指派至另一個 Category，**Then** Item 只保留新的 Category，不同時屬於兩個 Categories。

### User Story 3 - 製作我的展覽 (Priority: P2)

孩子可以從既有 Collection Items 選出展品，建立有名稱的 Exhibition，安排展品順序，並在之後重新開啟展覽。

**Why this priority**: 展覽讓孩子將收藏重新編排成主題與故事，完成從「擁有物品」到「策劃展示」的創作體驗。

**Independent Test**: 從 Catalog 選出至少一件 Item，建立命名展覽並調整順序；重新開啟 Exhibition，確認名稱、展品與順序都保留。

**Acceptance Scenarios**:

1. **Given** Catalog 中已有至少一件 Item，**When** 孩子選取五件造型奇怪的石頭、命名為「My Top 5 Weird Rocks」並安排順序，**Then** Exhibition 建立完成，且展覽顯示五件展品的指定順序。
2. **Given** Exhibition 已建立，**When** 孩子離開後再次開啟 Exhibition，**Then** 可看到已保存的名稱、展品與展品順序。
3. **Given** Exhibition 沒有選擇任何 Item，**When** 孩子嘗試完成建立，**Then** 系統阻止建立並清楚提示至少需要一件展品。

### User Story 4 - 參觀我的博物館 (Priority: P1)

孩子可以在以照片為主角的 Museum Gallery 瀏覽收藏與 Exhibitions，並從 Gallery 進入 Item 的 Museum Label 或 Exhibition 詳情。

**Why this priority**: Gallery 是孩子回看、欣賞與分享自己故事給身邊人的主要入口，讓已記錄的收藏感覺像一座完整的博物館。

**Independent Test**: 準備含照片與不含照片的 Items 及一個 Exhibition，開啟 Museum Gallery 瀏覽，並分別進入 Item Label 與 Exhibition，確認所有入口可用且資訊一致。

**Acceptance Scenarios**:

1. **Given** Catalog 中有含照片與不含照片的 Items，**When** 孩子瀏覽 Museum Gallery，**Then** 收藏可被瀏覽，含照片的收藏以照片作為主要視覺，不含照片的收藏仍有清楚可識別的入口。
2. **Given** Museum Gallery 顯示 Item 或 Exhibition，**When** 孩子選取其中一項，**Then** 系統帶往對應的 Museum Label 或 Exhibition 詳情。
3. **Given** 孩子開啟 Item Detail，**When** 查看 Museum Label，**Then** 頁面以物品照片為視覺主角，並呈現 name、category、location、story 與 rating，且提供 Edit Label 與 Add to Exhibit。
4. **Given** 孩子開啟 Exhibits，**When** 瀏覽 Exhibition cards，**Then** 每張卡顯示名稱、代表圖片與 item count，並提供 Create Exhibit。

### User Story 5 - 看見自己的收藏成長 (Priority: P3)

孩子完成重要的收藏整理行為後，可以得到只對自己可見的完成回饋，例如 First Item Cataloged、10 Items Cataloged、First Exhibit Created、3 Categories Created 與 5 Item Stories Told。

**Why this priority**: 私人完成回饋能讓孩子看見整理與說故事的累積價值，但不應阻塞建立、整理或參觀博物館的主要流程。

Achievement 是達成當下的事件式回饋，不保存 `displayed` 或 `dismissed` state。只有本次使用者操作使條件從未達成跨越到已達成時才顯示 feedback；App 啟動或 reload 時，不因目前資料已符合門檻而補播。若資料之後跌回門檻以下，再由後續操作重新跨越門檻，可再次觸發回饋。此機制不得變成 leaderboard、daily streak、公開比較或持續促進收藏數量的機制。

**Independent Test**: 依序完成指定行為，確認對應的私人 Achievement 出現；確認產品沒有排行榜、使用者比較、每日 streak、限時壓力或鼓勵增加購買數量的提示。

**Acceptance Scenarios**:

1. **Given** Achievement 條件原本未達成，**When** 本次使用者操作成功保存並使條件跨越為已達成，**Then** 對應的私人完成回饋可被看見。
2. **Given** 孩子使用產品，**When** 瀏覽任何完成回饋，**Then** 回饋只呈現個人完成情況，不提供公開排行榜、比較、追蹤、喜歡或留言機制。
3. **Given** 目前資料在 App 啟動或 reload 時已符合 Achievement 門檻，**When** 沒有本次操作造成跨越，**Then** 系統不補播回饋。
4. **Given** 條件曾經達成後又跌回門檻以下，**When** 後續操作再次使條件跨越為已達成，**Then** 系統可以再次顯示回饋，且不保存曾顯示或已 dismissed 狀態。

### Edge Cases

- 建立或編輯尚未成功保存時，系統不得立即清空孩子已輸入的內容，並必須提供重試機會。
- Item 名稱只有空白字元時，應視為未填寫並阻止建立。
- Item 沒有照片、Category、Found / Got It At、Why It Is Special 或 My Rating 時，仍可被建立、找到、開啟與編輯。
- Category 關聯與未分類顯示行為依 FR-006。
- 建立 Category 或 Exhibition 時名稱未填寫，應阻止完成並指出必要資料。
- Item 被刪除前必須要求確認；取消確認時 Item 與所有相關 Exhibition 都保持不變。
- Item 已在一個或多個 Exhibition 中時，確認刪除後 Item 從 Collection 移除，也從所有相關 Exhibition 移除，但 Exhibition 本身保留。
- Category 刪除結果依 FR-006。
- Exhibition 的展品選擇不可重複計入同一展覽的多個位置，展品順序必須可辨識。
- Gallery 中缺少照片的 Item 仍須有可辨識的名稱與進入 Museum Label 的方式。
- Add Item 應維持 Photograph → Museum Label → Add to Museum 的短流程；照片失敗或權限被拒絕時不得阻止後續步驟。
- Collection 應以 photo cards 顯示 Items，每張卡至少顯示 photo、name、category 與 rating，並提供只負責 filter 的簡單 Category controls：All 顯示全部 Items、既有 Category 顯示該 Category Items、Uncategorized 顯示 `categoryId` 為 `null` 的 Items；selected control MUST 有清楚 selected state。Add Category MUST 是鄰近的獨立 control，進入既有 Category 建立流程，不建立複雜 filter builder。
- Exhibition View 應依策展順序以展覽方式呈現大型物品照片；點擊 Item 時可查看其 Museum Label。
- Exhibition View 不得顯示 Share、Publish、Like、Comment 或 Followers。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 允許孩子建立、瀏覽、開啟與刪除 Collection Items。
- **FR-002**: 系統 MUST 將 Name 視為建立 Collection Item 的唯一必要欄位，並阻止空白名稱的建立。
- **FR-003**: Museum Label MUST 可包含一個可選的 Category 欄位；Category 關聯與行為 MUST 遵循 FR-006。Name、Photo、Found / Got It At、Why It Is Special 與 My Rating ★ 均屬 Museum Label 欄位，除 Name 外可稍後補充。My Rating 是使用者自己的私人偏好，可為 `null`/empty；有值時 MUST 是整數 1、2、3、4 或 5，UI MUST 拒絕小於 1、大於 5 或非整數值，不得以 0 表示未評分，也不代表價格、稀有度或公開排行。
- **FR-004**: 系統 MUST 允許孩子新增與修改 Museum Label，並在重新開啟 Item 時顯示已保存資料。
- **FR-005**: 系統 MUST 在照片來源或權限不可用時，仍允許孩子不附照片建立與保存 Item。camera/photo permission denied、image decode failure、WebP 與 JPEG 都無法建立可保存 Blob，或其他圖片處理失敗時，Photo step / Photo area MUST 顯示 inline、簡短且非責備式錯誤，保留目前 Item form draft，並提供「重新選擇照片」與「不使用照片繼續」；不得以 blocking modal 作為主要錯誤處理，也不得限制 retry 次數。
- **FR-006**: 系統 MUST 讓孩子建立、重新命名與刪除 Custom Category；每件 Collection Item MUST 只能屬於 0 或 1 個 Category，重新指派 Category 時 MUST 取代原分類，未指定 Category 時 MUST 顯示為 Uncategorized；刪除 Category 時 MUST 保留所有 Items，不得刪除 Item，受影響 Items MUST 轉為 Uncategorized。本版 MUST 不支援多分類，也 MUST 不支援額外 tags。Category 只能透過 Collection View 的獨立 Add Category 流程建立，不得在 Add Item 或 Edit Museum Label 內 inline 建立。
- **FR-007**: 系統 MUST 允許孩子依 Category 查看 Items，並為沒有 Category 的 Items 提供 Uncategorized 分組。
- **FR-008 — Retired / Non-active**: FR-008 已於需求整併時退役，不屬於目前 active requirements；保留編號僅供歷史追蹤，不代表存在缺失需求。
- **FR-009**: 系統 MUST 允許孩子從既有 Collection Items 選擇展品，建立 Exhibition。
- **FR-010**: 建立或保存 Exhibition 時 MUST 有非空名稱且至少包含一個 Item；不符合任一條件時不得完成建立或保存，並提供清楚提示。此為 create/save validation；若已保存的 Exhibition 後續因 Item deletion 變成空展覽，依 FR-015 保留該 Exhibition，這不與建立時至少一件 Item 的規則衝突。
- **FR-011**: 系統 MUST 讓孩子安排 Exhibition 中展品的順序，並保存該順序；Exhibition Builder MUST 提供 Move Up 與 Move Down 控制項，第一項的 Move Up 與最後一項的 Move Down 不可用，變更後立即反映且重新開啟後順序保持。
- **FR-012**: 系統 MUST 允許孩子之後重新開啟 Exhibition，並看到已保存的名稱、展品與順序。
- **FR-013**: 系統 MUST 提供以照片為主角的 Museum Gallery，供孩子瀏覽 Collection Items 與 Exhibitions。
- **FR-014**: 系統 MUST 讓孩子從 Museum Gallery 進入對應的 Item Museum Label 或 Exhibition。
- **FR-015**: 系統 MUST 在刪除 Item 前要求確認；確認後 MUST 從 Collection 移除 Item，並從所有 Exhibition 的 `itemIds` 移除該 Item reference。若該 Item 是某 Exhibition 的最後一件 Item，Exhibition MUST 保留，`itemIds` 得變成空陣列，並進入合法的 empty-after-deletion 狀態；不得自動刪除 Exhibition。空 Exhibition 重新編輯後按 Save 時，仍套用 FR-010 的既有 save validation，新的有效 selection 至少需要一件 Item。
- **FR-016**: 系統 MUST 在新增或編輯未成功保存時保留孩子已輸入的內容與 draft，不清空表單，顯示可理解的錯誤，並提供 retry recovery action。成功保存前不得假裝資料已保存。Photo-specific behavior 依 FR-005。
- **FR-017**: 系統 MUST 提供私人 Achievement 完成回饋，至少涵蓋 First Item Cataloged、10 Items Cataloged、First Exhibit Created、3 Categories Created 與 5 Item Stories Told；5 Item Stories Told 僅計算 `Why It Is Special` 欄位在 `trim()` 後非空的 Items，Name、Location、Category 與 Rating 不計入。只有一次成功完成且確實改變 underlying domain data 的 mutation 後，才比較該操作前後的條件；只有 `false → true` 才顯示 feedback。Item create/update/delete、Category create/rename/delete、Item Category assignment change，以及 Exhibition create/update/delete 都屬可能的 mutation；Category rename 只有在確實影響條件時才有結果。`true → true`、`false → false` 與 `true → false` 均不顯示；跌回後可再次跨越。App startup/reload 只計算目前狀態，不補播，且不保存 displayed/dismissed state。
- **FR-018**: Achievement MUST 只呈現個人完成情況，不得提供公開排行榜、使用者比較、每日 streak、限時壓力或鼓勵增加收藏數量與購買物品的設計；Achievement feedback 不得成為核心保存操作的必要條件。
- **FR-019**: 第一版 MUST 將博物館與所有收藏內容維持私人可見，不提供 public publishing、cross-device sharing、accounts、multi-user collaboration、likes、comments 或 followers。
- **FR-020**: 系統 MUST 提供 Museum、Collection、Exhibits 與 Add Item 四個主導覽入口，且不得將 Profile、Favorites 或 Categories 設為獨立主導覽入口。
- **FR-021**: Museum MUST 作為首頁，並顯示固定標題「My Collection Museum」、Item/Category/Exhibit summary、Featured Items、My Exhibits 與 Add New Item；第一版不允許編輯標題、不建立 Settings、不新增標題 persistence field 或相關核心功能。summary 僅顯示現有資料的 Item count、Category count 與 Exhibition count；Featured Items 依有效 `createdAt` 由新到舊顯示最近新增 Items，最多 4 件，0 件時不顯示區塊，1–4 件全部顯示，超過 4 件只顯示最新 4 件。Item 的 `createdAt`/`updatedAt` MUST 是 JavaScript `Date` 可解析的 ISO 8601 UTC timestamp（例如 `YYYY-MM-DDTHH:mm:ss.sssZ`）；第一次成功建立並保存時產生 `createdAt`，後續 Edit Item 不得改變它，第一次建立及每次成功修改都更新 `updatedAt`。若有效 `createdAt` 相同，使用 `id` 升冪 lexical ordering 作 stable deterministic tie-breaker；缺少或無效 `createdAt` 的 Item 排在所有有效 timestamp 之後，彼此仍以 `id` 升冪排列。不得使用 Rating 作 tie-breaker，不建立 migration framework。無資料時 MUST 顯示 empty state 與 Add My First Item。
- **FR-022**: Add Item MUST 以 Photograph、Museum Label、Add to Museum 三步驟完成；完成後 MUST 提供 View Item 與 Add Another。
- **FR-023**: Item Detail MUST 以物品照片為視覺主角，並呈現 name、category、location、story 與 rating，且提供 Edit Label 與 Add to Exhibit。
- **FR-024**: Collection MUST 以 photo cards 顯示 Items；每張卡 MUST 顯示 photo、name、category 與 rating。Category filter MUST 提供 All、既有 Categories 與 Uncategorized；All 顯示全部 Items，Category 顯示其 `categoryId` 相符 Items，Uncategorized 顯示 `categoryId` 為 `null` 的 Items，selected filter MUST 有清楚 selected state。Add Category MUST 為獨立 control，不視為 filter chip，並從 Collection View 進入既有 Category 建立流程。
- **FR-025**: Exhibits MUST 顯示既有 Exhibition cards，每張卡 MUST 顯示 name、representative image 與 item count，並提供 Create Exhibit。
- **FR-026**: Exhibition View MUST 依保存的策展順序呈現大型物品照片，並允許孩子點擊 Item 查看 Museum Label；不得提供 Share、Publish、Like、Comment 或 Followers。

### Key Entities

- **Collection Item**: 孩子收藏的一件物品，包含必要的 Name，以及可逐步補充的 Photo、最多一個 Category、Found / Got It At、Why It Is Special 與 My Rating。
- **Museum Label**: 對單一 Collection Item 的展示標籤，呈現該收藏的名稱、描述資訊與個人故事。
- **Custom Category**: 孩子自行建立與命名的收藏分組，可與多個 Collection Items 關聯；每件 Item 最多只能關聯一個 Category。
- **Exhibition**: 由孩子命名、選擇多件 Collection Items 並安排展出順序的收藏展覽。
- **Museum Gallery**: 瀏覽 Collection Items 與 Exhibitions 的博物館入口，讓照片與收藏故事成為主要瀏覽內容。
- **Achievement**: 只對孩子本人可見、在達成當下觸發的事件式收藏整理回饋；不保存 `displayed` 或 `dismissed` state，reload 不補播。
- **Museum**: 個人博物館首頁，彙整標題、摘要、精選收藏與既有展覽入口。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 至少 90% 的首次使用者能在 2 分鐘內建立一件只填寫 Name 的 Collection Item，並在同一次使用流程中再次找到並開啟它。
- **SC-002**: 至少 90% 的測試使用者能在 3 分鐘內完成一件 Item 的 Museum Label 補充，並在重新開啟後正確看到至少 4 個已保存欄位。
- **SC-003**: 在照片來源不可用的測試情境中，至少 95% 的使用者仍能完成不含照片的 Item 建立，且不遺失 Name。
- **SC-004**: 至少 90% 的測試使用者能在 3 分鐘內建立 Category、完成 Items 分類並依該 Category 找到正確 Items。
- **SC-005**: 至少 90% 的測試使用者能在 4 分鐘內建立包含至少 1 件 Item 的 Exhibition、調整順序，並重新開啟後確認順序正確。
- **SC-006**: 至少 90% 的測試使用者能在 1 分鐘內從 Museum Gallery 進入指定 Item 的 Museum Label 或指定 Exhibition。
- **SC-007**: 任何已成功保存的 Item、Category、Museum Label 或 Exhibition，在使用者重新開啟相同私人博物館時，保存資料的正確率達 100%。
- **SC-008**: 在包含 20 件 Items、3 個 Categories 與 2 個 Exhibitions 的測試資料中，至少 90% 的使用者能在 30 秒內找到指定 Item 或 Exhibition。
- **SC-008 驗證 protocol**：詳細 fixture、情境、計時、sample rule、PASS/FAIL/Insufficient Sample 與 record format 唯一維護於 `verification/usability.md`；該 protocol 不得由 Node test 或其他任務重複定義。
- **SC-009**：此項維持 post-implementation field validation，不是 automated test。正式有效驗證須有 7 位符合本產品 Target User 的 G4–6 使用者，或教育情境中的等同學段；至少 6/7 回答固定 Yes/No 題目才可 PASS，少於 7 位不得 PASS。詳細 participant、fixture、步驟、sample rule、PASS/FAIL/Insufficient Sample 與 record format 唯一維護於 `verification/field-validation.md`；developer 自評、agent 推測與 automated test 均不得取代真實 Target User feedback。
- **SC-010**: Item 刪除連動測試中，100% 的案例都符合：Item 被移除、相關 Exhibitions 保留、該 Item 不再出現在相關 Exhibitions 中。
- **SC-011**: 在 Phone、Tablet 與 Desktop 三種 viewport 測試中，Gallery 分別能維持 1–2、2–3 與 3–4 欄配置；Museum Label 內容不會因版面寬度而難以閱讀或與其他內容重疊。

### Verification Responsibilities

SC-001～SC-006 的 usability protocol 與 SC-008 的詳細 fixture、steps、timing、sample rule、PASS/FAIL/Insufficient Sample 與 record format，唯一維護於 `verification/usability.md`。

SC-007 的唯一 persistence protocol 與 evidence record，維護於 `verification/browser-integration.md`，由 T055 執行。

SC-009 的 field-validation protocol 與 evidence record，唯一維護於 `verification/field-validation.md`。

### Browser Acceptance Protocol：SC-011

SC-011 為 browser acceptance，不是 Node test。使用真實 browser 與 local static server，分別以約 375px Phone、768px Tablet、1280px Desktop viewport 驗證 navigation 可用、Item cards 可辨識、no-photo placeholder 正常、Museum Label 可閱讀、Exhibition reorder controls 可操作，且無水平溢出造成核心操作不可用。結果記錄於 `verification/browser-integration.md`。

## Assumptions

- 使用者是以個人或家庭情境使用的孩子；第一版不建立帳號，也不處理多位使用者的權限。
- 收藏內容的名稱與故事由孩子自行輸入；產品不替孩子判斷收藏的價格、真假或價值。
- Photo、Category、Found / Got It At、Why It Is Special 與 My Rating 都是可選資料，孩子可以在建立後逐步完成 Museum Label。
- 第一版的私人可見範圍是單一裝置上的個人博物館；不提供跨裝置分享或同步。
- 系統以友善、清楚、可恢復的提示處理無法保存、照片不可用與不完整輸入等情況。
- Achievement 是本版 MUST 提供但不得阻塞核心流程的、達成當下的事件式回饋，不保存 displayed/dismissed state，不因 reload 補播，也不得阻塞任何 Collection、Category、Exhibition 或 Gallery 的核心流程。
- Museum 首頁、Collection photo cards 與 Exhibition cards 以收藏照片和個人故事作為主要瀏覽內容；視覺設計不以價格、稀有度或購買行為建立優先級。

## Out of Scope for Version 1

- 公開社群、public publishing、likes、comments、followers 與任何使用者比較。
- 收藏買賣、收藏價格估算與以金錢衡量收藏價值的功能。
- 公開排行榜、每日 streak、限時壓力，以及刺激增加收藏數量或購買物品的機制。
- Cloud sync、Authentication、accounts、cross-device sharing 與 multi-user collaboration。
- AI 自動辨識收藏、AI 自動產生故事與聊天功能。
- 除基本 Collection Catalog、Item Label、Custom Categories、Exhibition Builder、Museum Gallery 及私人 Achievement 回饋之外的進階管理或社交功能。
- 複雜 filter builder、獨立 Categories 主導覽頁，以及 Share、Publish、Like、Comment、Followers 等 Exhibition 社交功能。
- 多分類關聯與額外 tags；Version 1 僅支援每件 Item 的單一可選 Category。
