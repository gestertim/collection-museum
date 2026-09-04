# Field Validation Verification Record

- 驗證日期：待執行
- 對應 requirement：SC-009
- 環境：真實 browser；成人教育者適當監督；流程依 `spec.md`
- 狀態：Protocol Ready / 待實地驗證 / Insufficient Sample

## SC-009 Formal Protocol

- **Environment**：現代瀏覽器，透過既定 local static server；測試者可在成人教育者適當監督下完成基本瀏覽器操作。
- **Participants**：7 位符合 Target User 的 G4–6 使用者，或教育情境中的等同學段；不要求程式設計經驗或曾使用 Collection Museum。
- **Fixture and steps**：測試者先查看一組尚未數位整理的自己的收藏或測試提供的示範收藏，再使用 Collection Museum 完成 Add / Label / Categorize / Exhibit / Browse Museum。
- **Sample rule**：完成後回答固定 Yes/No 題目：「用這個博物館整理後，我比較容易記住收藏為什麼特別。」至少 6/7 回答 Yes 才可 PASS。有效樣本少於 7 人時標示「待實地驗證 / Insufficient Sample」，不得 PASS，即使少量樣本全為 Yes 也不算正式達標。
- **Record format**：只記錄有效樣本數、匿名 participant ID、Yes/No 回答與門檻結果；不保存姓名、帳號、聯絡方式、公開排名或個別學生識別資訊。developer 自評、agent 推測與 automated test 不得取代真實 Target User feedback。

## Rules

SC-009 必須依上述 participant、fixture、步驟與樣本門檻執行。有效樣本少於 7 人時不得標示 PASS；只保存匿名結果與門檻判定，不保存可識別個人資料。
