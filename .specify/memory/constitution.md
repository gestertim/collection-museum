<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- Modified principles: VIII. Incremental Implementation
- Added sections: Additional Constraints, Development Workflow, Governance rules
- Removed sections: none
- Follow-up TODOs: none
-->

# Collection Museum Constitution

## Core Principles

### I. Simplest Sufficient Technology
本專案 MUST 只採用完成正式產品需求所需的最簡單技術。每一項 dependency 或
architecture layer MUST 有明確的產品 requirement 或教學理由；無法提出理由時 MUST
不加入。此原則降低維護成本，並使教育者與初學者能理解系統。

### II. A/B/C Complexity Discipline
本專案目前是 A｜Frontend-first Beginner MVP。Framework 本身不構成 complexity
escalation；只有需求需要 server-side logic、Cloud、共享資料、多使用者、Authentication
或權限時，才 MUST 重新評估為 B。只有核心體驗需要 Generative AI 時，才 MUST 重新評估
為 C。任何升級 MUST 先取得成人教育者批准並記錄理由與影響。

### III. Specification Before Implementation
Specification 是 Product Truth。任何功能 MUST 先確認產品行為與 acceptance criteria，
再進入 Technical Plan 與 implementation。若 specification、plan 或程式行為衝突，MUST
先釐清並更新規格，不得以程式現況取代產品決策。

### IV. Technology Stack Stability
Technical Plan 經批准後，agent MUST NOT 自行替換 stack 或主要 dependencies。若現有
技術造成問題，變更前 MUST 說明問題、建議變更、原因與影響，並取得批准；未獲批准前
MUST 維持已批准的技術方案。

### V. Privacy & Educational Safety
本專案 MUST 採 private-first 設計，只收集產品行為所必要的資料。功能 MUST 避免公開
排行榜、收藏價格競爭、Dark Patterns、羞辱式提醒、streak pressure，以及鼓勵不必要
消費的機制。涉及個人資料或社交曝光的需求 MUST 在 specification 與 acceptance criteria
中明確說明其必要性、可見範圍與保護方式。

### VI. Testability
每項核心 requirement MUST 能透過可觀察的使用者行為驗證。測試 MUST 優先對應正式
acceptance criteria；若 requirement 無法被觀察或驗證，進入 implementation 前 MUST
補充可測量的行為與結果。

### VII. Maintainability
程式結構、命名與 abstraction MUST 讓初學者與教育者容易理解。實作 MUST 避免不必要
的架構複雜度；新增 abstraction 前 MUST 能說明它如何降低重複、隔離變更或改善可測試性。

### VIII. Incremental Implementation
實作採增量方式進行：Build → Verify → Next。

Setup 與 Foundational 階段 MUST 有明確且可重現的 phase-level verification。

後續 User Story 或 Feature 階段，在進入相依的下一階段前，MUST 具有可重現的驗證證據；
該證據可以來自既有 automated tests、Story acceptance、browser verification、
Success Criteria verification 或適用的 usability/field validation。

若既有驗證已足以證明該 increment 的完成狀態，不要求為每個 phase 額外建立內容重複
的 verification record。

驗證失敗時，不得將該 increment 視為完成。

## Additional Constraints

本專案的預設開發範圍是 frontend-first Beginner MVP。所有設計、dependency、資料
流程與互動 MUST 能以本 Constitution 的八項原則說明。需求若引入 B 或 C 級複雜度，
MUST 先完成批准與紀錄，才可納入 Technical Plan。

## Development Workflow

每項工作 MUST 依序經過 specification、Technical Plan、implementation 與驗證。只有
`/speckit.implement` 代表 implementation stage；其他階段不得被視為已開始實作。Review
MUST 檢查 acceptance criteria、可觀察測試、複雜度升級批准、隱私與教育安全，以及對
既有批准 stack 的遵循。每個 phase 完成前 MUST 留下可重現的驗證結果。

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

本 Constitution 優先於其他未經批准的工程慣例。任何修訂 MUST 說明變更內容、影響的
原則、相容性與必要的遷移工作，並由專案負責人及涉及的成人教育者批准。每次變更 MUST
更新 Sync Impact Report、`Last Amended` 日期與版本。

版本採 Semantic Versioning：移除或重新定義既有治理原則時增加 MAJOR；新增原則或
重大擴充治理範圍時增加 MINOR；澄清文字、修正錯誤或不改變治理語意時增加 PATCH。

每次 feature review、Technical Plan review 與 implementation review MUST 檢查本
Constitution 的遵循情況。若發現不符合，MUST 在繼續交付前記錄例外、補救方式與批准
者；例外不得默認成為新規則。

**Version**: 1.1.0 | **Ratified**: 2026-09-04 | **Last Amended**: 2026-09-04
