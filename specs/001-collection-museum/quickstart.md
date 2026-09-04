# Quickstart Validation: 我的收藏博物館

## Prerequisites

- 現代瀏覽器，支援 ES modules、IndexedDB、File/Blob 與 Canvas。
- Node.js，供執行內建 `node:test` 純邏輯測試。
- 從 repository root 啟動 static server；不要重新 scaffold repository。

## 啟動

```powershell
python3 -m http.server
```

開啟 terminal 顯示的 local URL，確認首頁為 Museum。

## Automated pure-logic checks

```powershell
node --test
```

預期：validation、category deletion transformation、exhibition ordering、deleted item reference cleanup 與 achievement calculations 全部通過。

## Specification acceptance journey

1. 在空 Museum 選 `Add My First Item`，只輸入非空 Name，完成 Add to Museum；預期可選 `View Item` 或 `Add Another`。
2. 回到 Collection，確認 Item card 顯示 name、category placeholder 與 rating placeholder；開啟 Item，補上照片、Category、location、story、rating，重新開啟後資料仍在。
3. 用一個只有空白字元的 Name 嘗試保存；預期欄位附近顯示錯誤，既有輸入不被清空。
4. 拒絕照片權限或選擇不可用來源；預期仍可不含照片建立 Item。
5. 建立 Category，將 Items 指派並用 category chip 篩選；rename 後關聯保留；刪除後 Items 仍存在且顯示 Uncategorized。
6. 從至少一個 Item 建立 Exhibition，選取多件 Items、調整順序並開啟；離開後重新開啟，確認名稱、展品與順序一致。
7. 刪除一個被 Exhibition 引用的 Item 並確認；預期 Item 消失、Exhibition 保留、其 `itemIds` 不再包含 deleted ID。取消確認時兩者都不變。
8. Reload browser；預期 Items、照片 Blob、Categories 與 Exhibitions 仍存在。不同 browser/device 不預期共享資料。
9. 在 Museum、Collection、Exhibits 間進入指定 Item Label 與 Exhibition；確認沒有 Share、Publish、Like、Comment、Followers 或價格訊號。
10. 依 `verification/usability.md` 的唯一 SC-008 formal protocol 執行 findability journey，並將結果寫入該 verification record。
11. 依 `verification/field-validation.md` 的唯一 SC-009 formal protocol 執行 post-implementation field validation，並將結果寫入該 verification record。

## Responsive check

以 phone、tablet、desktop viewport 各執行一次 Museum/Collection/Exhibits 瀏覽，確認 gallery 欄數符合 [ui-contract.md](contracts/ui-contract.md)，且 Museum Label 不重疊。