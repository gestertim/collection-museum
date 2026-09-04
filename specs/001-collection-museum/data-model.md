# Data Model: 我的收藏博物館

## CollectionItem

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---:|---|
| `id` | string | 是 | 本地唯一識別碼。 |
| `name` | string | 是 | `trim()` 後不可為空；保存 trimmed value。 |
| `photo` | Blob/null | 否 | 由 image pipeline 產生的 JPEG/WebP Blob。 |
| `categoryId` | string/null | 否 | 最多引用一個現存 Category；未指定或引用失效時為 `null`。 |
| `location` | string/null | 否 | Found / Got It At；可空。 |
| `story` | string/null | 否 | Why It Is Special；可空。 |
| `rating` | number/null | 否 | My Rating 為使用者自己的私人偏好；`null`/empty 表示未評分，有值時只能是整數 1、2、3、4 或 5。不得以 0 表示未評分，也不代表價格、稀有度或公開排行。 |
| `createdAt` | string | 是 | JavaScript `Date` 可解析的 ISO 8601 UTC timestamp，例如 `YYYY-MM-DDTHH:mm:ss.sssZ`；第一次成功建立並保存 Item 時產生，後續 Edit Item 不得改變。 |
| `updatedAt` | string | 是 | 同樣使用 ISO 8601 UTC timestamp；第一次建立及每次成功修改 Item 時產生/更新。 |

## Category

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---:|---|
| `id` | string | 是 | 本地唯一識別碼。 |
| `name` | string | 是 | `trim()` 後不可為空；rename 同樣驗證。 |
| `createdAt` | string | 是 | ISO 8601 timestamp。 |

Category 與 CollectionItem 是一對多的 optional relationship；Category 關聯與刪除行為依 FR-006。資料模型的必要結果是 `categoryId` 可為 `null`，受影響 Items 保留且由 UI 顯示 Uncategorized。

讀取到缺少或無效 `createdAt` 的舊資料時，v1 不建立 migration framework，也不得因 timestamp 異常使 App crash。Featured Items 排序時，這些 Items 排在具有有效 `createdAt` 的 Items 之後；有效 timestamp 相同時以 `id` 升冪 lexical ordering tie-break，invalid/missing timestamp 之間也以 `id` 升冪排序。不以當下時間補寫假的 timestamp，也不使用 Rating 作 tie-breaker。

## Exhibition

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---:|---|
| `id` | string | 是 | 本地唯一識別碼。 |
| `name` | string | 是 | `trim()` 後不可為空。 |
| `itemIds` | string[] | 是 | 至少一個現存 Item；不可重複；陣列順序為展示順序。 |
| `createdAt` | string | 是 | JavaScript `Date` 可解析的 ISO 8601 UTC timestamp，例如 `YYYY-MM-DDTHH:mm:ss.sssZ`。 |
| `updatedAt` | string | 是 | ISO 8601 UTC timestamp；名稱或順序更新時刷新。 |

建立 Exhibition 時 `itemIds` 至少一件；刪除 Item 後，所有引用它的 Exhibition 移除該 ID。Exhibition 保留，即使最後變成空展覽，因為刪除 Item 不應刪除 Exhibition。空展覽重新編輯後保存時仍須符合至少一件 Item 的既有 validation。

## Achievement（derived event feedback）

不建立獨立 persistence model，也不保存 displayed/dismissed state。從目前資料計算：First Item Cataloged（Items >= 1）、10 Items Cataloged（Items >= 10）、First Exhibit Created（Exhibitions >= 1）、3 Categories Created（Categories >= 3）、5 Item Stories Told（`story` 即 Why It Is Special 經 `trim()` 後非空的 Items >= 5）。Name、Location、Category 與 Rating 不計入 story 數量。只有一次成功完成且確實改變 underlying domain data 的 Item create/update/delete、Category create/rename/delete、Item Category assignment change 或 Exhibition create/update/delete 後，才比較 before/after 條件；只有 `false → true` 顯示 feedback。`true → true`、`false → false` 與 `true → false` 不顯示，跌回後可再次跨越。App 啟動或 reload 只計算目前狀態，不補播。只顯示個人完成 feedback，不提供排行、比較、streak 或購買提示。

## 狀態與完整性

- Item：draft -> saved；save failure 留在 draft，retry 成功才清除或離開表單。
- Exhibition：draft -> saved；只有 name 非空且 itemIds 至少一個有效 Item 才能保存。
- 所有 foreign-key-like references 在讀取/刪除操作時重新驗證；stale Exhibition references 不得出現在 Exhibition View。