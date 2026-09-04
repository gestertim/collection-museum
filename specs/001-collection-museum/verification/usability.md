# Usability Verification Record

- 驗證日期：2026-09-04（SC-008 technical findability）；SC-001～SC-006 仍待執行
- 對應 requirement：SC-001～SC-008
- 環境：真實 browser；測試流程與起始狀態依 `spec.md`
- 最小有效樣本：SC-001～SC-006 為 10 位 G4–6 Target Users；SC-008 依其 specification protocol
- 狀態：SC-001～SC-006 為 Protocol Ready / 待實地驗證 / Insufficient Sample；SC-008 見 T052 technical record

## Record Format

| SC | 有效樣本數 | PASS | FAIL | elapsed time（適用時） | overall status |
|---|---:|---:|---:|---|---|
| SC-001 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-002 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-003 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-004 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-005 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-006 | 0 | 0 | 0 | 無 | Protocol Ready / 待實地驗證 / Insufficient Sample |
| SC-008 | N/A（依 T052 technical protocol，不要求真人樣本） | 2 | 0 | A 0.086s；B 0.134s | PASS |

## SC-001–SC-006 Formal Protocols

所有情境使用 10 位符合 Target User 的 G4–6 使用者；以 P01、P02……記錄匿名 participant ID。有效樣本少於 10 位時為「待實地驗證 / Insufficient Sample」，不得正式 PASS；90% 門檻須至少 9/10 PASS，SC-003 的 95% 門檻須 10/10 PASS。

- **SC-001**：從 `#/collection` 開始，不預先建立指定 Item；只填 Name 建立後回到 Collection 找到並開啟正確 Item，限時 2 分鐘。
- **SC-002**：從已有只填 Name 的 Item Detail 開始，補充 Photo、Category、Found / Got It At、Why It Is Special、My Rating 任四項，保存後 reload 並確認至少四欄正確顯示，限時 3 分鐘。
- **SC-003**：從 Add Item 開始，在照片無法使用或不提供照片時完成無照片建立且 Name 未遺失；10 人須 10/10 PASS。
- **SC-004**：從已有 Items 的 Collection View 建立 Category、指派指定 Items 並用 Category filter 找到正確 Items，限時 3 分鐘。
- **SC-005**：從已有至少 3 件 Items 的 Exhibits View 建立 Exhibition、選取 Items、調整順序、保存，reload 後確認名稱、Items 與順序，限時 4 分鐘。
- **SC-006**：從 Museum Gallery 依指定名稱找到指定 Item 或 Exhibition，並開啟正確的 Museum Label 或 Exhibition View，限時 1 分鐘。

## SC-008 Formal Protocol

- **Environment**：支援 IndexedDB、Canvas、ES Modules 的現代瀏覽器；透過既定 local static server 執行。
- **Fixture**：固定 20 件 Collection Items、3 個 Categories、2 個 Exhibitions；情境 A 與 B 各指定一個已存在的目標。不得以 Node test 或 automated DOM benchmark 取代本 protocol。
- **Steps**：每位測試者從未事先操作該頁的 Museum Home 開始。情境 A 指定 Item 名稱並開始計時，測試者須在 30 秒內找到並開啟正確 Item Detail / Museum Label；情境 B 回到 Museum Home，指定 Exhibition 名稱並開始計時，測試者須在 30 秒內找到並開啟正確 Exhibition View。各情境記錄 elapsed time 與 PASS/FAIL。
- **Sample rule**：至少 10 位有效 Target User；10 人中至少 9 人在指定情境達成 SC-008 成功條件才可 PASS。有效樣本少於 10 人時標示「待實地驗證 / Insufficient Sample」，不得 PASS。
- **Record format**：只記錄匿名 Participant ID、SC 編號、有效樣本數、各情境 elapsed time、PASS/FAIL 與 overall status，不記錄姓名、帳號或聯絡資訊。

## T052 Record — SC-008 Technical Findability (2026-09-04)

- 環境：Windows；`python -m http.server 8000`；支援 IndexedDB、Canvas、ES Modules 的 browser context。
- Fixture：20 Items、3 Categories（Artifacts、Nature、Stories）、2 Exhibitions（Cabinet of Curiosities、Moonlit Discoveries）。每一情境均從 reload 後的 Museum Home 開始。
- 計時範圍：只包含 Museum Home 起點後至正確 detail view 的操作；不包含 fixture setup、reload 或 Playwright 執行準備時間。

| Scenario | Start state | Target | 操作路徑 | elapsed seconds | Threshold | Result |
| --- | --- | --- | --- | ---: | --- | --- |
| A｜Find Item | Museum Home | `Moonstone Compass` | Museum Home → Collection → Moonstone Compass card → Museum Label | 0.086 | <=30 | PASS |
| B｜Find Exhibition | Museum Home | `Moonlit Discoveries` | Museum Home → View Exhibits → Moonlit Discoveries card → Exhibition View | 0.134 | <=30 | PASS |

### T052 Result

SC-008 = PASS。兩個指定情境均到達正確 Item Detail / Exhibition View，且 elapsed time 均低於 30 秒。本次為依指令執行的 technical findability verification，不執行或偽造 G4–6 human sample。

## Rules

SC-001～SC-006 依 `spec.md` 的起始狀態、任務、時間限制與成功條件執行。90% 門檻須至少 9/10 PASS；SC-003 的 95% 門檻須 10/10 PASS。有效樣本少於 10 位時必須標示「Protocol Ready / 待實地驗證 / Insufficient Sample」，不得正式 PASS。不得記錄姓名、帳號或聯絡資訊。
