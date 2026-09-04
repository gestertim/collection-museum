# AI App 超級創客 Repository Instructions

本 repository 採 GitHub Spec Kit 規格驅動流程。

## 語言規則

所有需要使用者閱讀、審閱、批准或操作的 artifacts 一律使用繁體中文，包括：

- constitution
- specification
- UX/UI handoff
- technical plan
- tasks
- analysis reports
- README
- checklists
- implementation notes
- verification notes

程式語法、code identifiers、function/class/variable names、schema/API/config keys、CLI commands、正式 command names、file paths、package/framework/library names與技術正確性所需 literals 可保留英文。

Tasks、Analyze、Implement、Verify 與後續 artifacts 也必須持續遵守此規則。

## Repository Safety

此 repository 不得視為空白目錄。

必須保留既有：

- .git/
- .github/
- .specify/
- .vscode/
- specs/
- 既有 Spec Kit artifacts

不得在 repository root 執行會清空、覆寫或重新初始化既有內容的 destructive scaffolding，例如：

- npm create vite .
- npx create-vite@latest .
- create-next-app .
- 或任何等效指令

需要建立新檔案時，應在現有 repository 結構內安全加入。

## Workflow Authority

Specification 是 Product Truth。
Constitution 是 Engineering Governance。
Plan 是 Technical Truth。
Tasks 是 executable work。
Analyze 是 implementation 前 consistency check。
Implement 才是 execution stage。

/speckit.specify、/speckit.constitution、UX/UI Design、/speckit.plan、/speckit.tasks 與 /speckit.analyze 都不代表 implementation 授權。

只有使用者批准後執行 /speckit.implement，才可開始 implementation。

## Stack Stability

不得自行更換已批准 technical stack。

若需要：

- destructive operation
- framework / stack change
- Backend
- Cloud Database
- Authentication
- external API
- Generative AI
- major scope change
- privacy behavior change

必須停止，說明原因與影響，等待成人教育者明確批准。

## Implementation Principle

採 simplest sufficient technology。

一次增加一個必要概念。

優先保持：

- 可理解
- 可測試
- 可維護
- 可逐步完成
- 可展示

避免為了架構完整或 agent 偏好加入產品不需要的 abstraction、dependency 或 service。
