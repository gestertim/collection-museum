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
5. 建立 Category，將 Items 指派並用 category chip 篩選；rename 後關聯保留；刪除後 Items 仍存在且顯示 Uncategorized。細節步驟：
   - 在 Collection 點 `+ Add Category`，輸入名稱並 Save；預期新 category 立即出現在 filter chips 與 Manage Categories 清單。
   - 開啟一個 Item 的 Edit Label，於 Category 下拉選擇該 category 並保存；預期 Item card 與 Item Label 顯示該 category 名稱，且點擊該 category chip 只顯示已指派的 Items。
   - 在 Manage Categories 點 Rename，修改名稱並 Save；預期 chip、Item card 與 Manage Categories 清單即時顯示新名稱，Item 關聯不變。
   - 在 Manage Categories 點 Delete 並確認；預期該 category 消失、Items 全部保留、原本指派的 Item 立即顯示為 Uncategorized。
   - 點 `Uncategorized` chip 只顯示無 category 的 Items；點 `All Items` 恢復顯示所有 Items。
   - Reload 瀏覽器；預期 Categories、Item 的 category 關聯與 Uncategorized 狀態皆保持正確。
6. 從至少一個 Item 建立 Exhibition，選取多件 Items、調整順序並開啟；離開後重新開啟，確認名稱、展品與順序一致。細節步驟：
   - 在 Exhibits 點 `+ Create Exhibit`，不輸入名稱、不勾選任何 Item 直接送出；預期分別顯示名稱必填與至少一件 Item 的 inline 錯誤，已輸入內容不被清空。
   - 輸入名稱並勾選至少 3 件 Items；預期 Arrange Order 清單即時反映已選 Items。
   - 使用 Move Up / Move Down 調整順序；預期第一項的 Move Up 與最後一項的 Move Down 不可用，其餘操作後順序立即反映。
   - 送出保存並開啟 Exhibition View；預期依調整後順序顯示大型物品照片，點擊 Item 可開啟 Museum Label。
   - Reload 瀏覽器並重新開啟該 Exhibition；預期名稱、展品與順序皆與保存時一致。
7. 刪除一個被 Exhibition 引用的 Item 並確認；預期 Item 消失、Exhibition 保留、其 `itemIds` 不再包含 deleted ID，剩餘 Item 順序不變。取消確認時兩者都不變。若連續刪除至該 Exhibition 的最後一個 Item，預期 Exhibition 仍保留、item count 變為 0，並顯示安全的 empty state 而非崩潰；重新編輯該空 Exhibition 並試圖保存 0 個 Item 時，仍需依既有至少一件 Item 規則阻止保存。
8. Reload browser；預期 Items、照片 Blob、Categories 與 Exhibitions 仍存在。不同 browser/device 不預期共享資料。
9. 在 Museum、Collection、Exhibits 間進入指定 Item Label 與 Exhibition；確認沒有 Share、Publish、Like、Comment、Followers 或價格訊號。
10. 依 `verification/usability.md` 的唯一 SC-008 formal protocol 執行 findability journey，並將結果寫入該 verification record。
11. 依 `verification/field-validation.md` 的唯一 SC-009 formal protocol 執行 post-implementation field validation，並將結果寫入該 verification record。

## Responsive check

以 phone、tablet、desktop viewport 各執行一次 Museum/Collection/Exhibits 瀏覽，確認 gallery 欄數符合 [ui-contract.md](contracts/ui-contract.md)，且 Museum Label 不重疊。