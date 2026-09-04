# UI Contract: 我的收藏博物館

本產品沒有 Backend、External API 或跨裝置介面；本文件定義 browser UI 與使用者可觀察行為，供 implementation 與 acceptance testing 對照。

## 主導覽與 views

| View state | 入口 | 必須提供 |
|---|---|---|
| `museum` | Museum | 固定 title「My Collection Museum」、Items/Categories/Exhibits summary、Featured Items、My Exhibits、Add New Item；空資料時顯示 Add My First Item。第一版沒有 title 編輯、Settings 或 title persistence field。 |
| `collection` | Collection | photo cards、只負責 filter 的 All/既有 Category/Uncategorized controls、獨立 Add Category control；卡片可開啟 Item Label。selected control 有清楚 selected state。 |
| `exhibits` | Exhibits | Exhibition cards、representative image、item count、Create Exhibit。 |
| `add-item` | Add Item | Photograph -> Museum Label -> Add to Museum 三步驟；成功後 View Item 與 Add Another。 |
| `item` + item id | card/detail action | photo 主視覺、name/category/location/story/rating、Edit Label、Add to Exhibit、確認後 Delete。 |
| `exhibition` + exhibition id | exhibition card | 依 `itemIds` 順序展示大型照片；點擊 Item 開啟 Label。 |

## 表單與 recovery contract

- Name 欄位附近顯示 required validation；空白輸入不得清除其他欄位。
- Rating 可空，非空時只接受 1 至 5。
- Photo area 依 FR-005 顯示 inline photo error、重新選擇照片與不使用照片繼續；不以 blocking modal 作為主要錯誤處理。
- Save recovery 依 FR-016 保留目前輸入與 draft，顯示可理解錯誤並提供 retry；只有成功 commit 才離開/清空表單。Photo conversion / permission behavior 不在此文件重複定義。
- Category delete 與 Item delete 都需要 confirmation；取消不改變任何資料。
- Item 的 Category 關聯與刪除行為依 FR-006；UI 顯示未指定分類或分類被刪除時的 Uncategorized 結果。
- Item form 的 Category selector 只提供 Uncategorized 與已存在的 Categories；不得 inline input、modal category creation 或 tag creation。Add Category 是 Collection View 附近的獨立 control，按下後進入既有 Category 建立流程。
- Category controls 只做 filter：All 顯示全部 Items、Category 顯示相符 `categoryId` Items、Uncategorized 顯示 `categoryId` 為 `null` 的 Items；Add Category 不視為 filter chip。
- Exhibition save 需要非空 name、至少一個現存 Item，且選取順序可透過 Move Up／Move Down 重新排列；第一項 Move Up、最後一項 Move Down 不可用，操作後立即更新，reload 後維持保存順序。第一版不使用 drag-and-drop。
- 無 Exhibition 時顯示簡潔友善的 empty state，例如「還沒有展覽。從你的收藏挑幾件寶物，打造第一個展覽。」並提供 Create Exhibit CTA。
- 缺少照片的 Item 仍顯示為可操作的 museum-style placeholder：deep green 背景、簡單非品牌化 museum/collection icon 與清楚 Item name；不得顯示 broken image、價格、稀有度或購買訊號，且可進入 Item Detail / Museum Label。
- 所有 view 都有 loading、empty、not-found 與可恢復 error state；不得以 share/publish/social controls 取代主要操作。
- Achievement feedback 只在成功且確實改變 domain data 的 mutation 後比較 before/after，並且只有 `false → true` 時顯示；Item create/update/delete、Category create/rename/delete、Item Category assignment change、Exhibition create/update/delete 都可能觸發。`true → true`、`false → false` 與 `true → false` 不顯示；reload/startup 不補播，不保存 `displayed` / `dismissed` state，條件跌回門檻以下後可再次跨越觸發。
- 5 Item Stories Told 只計算 Why It Is Special 在 `trim()` 後非空的 Items；Name、Location、Category、Rating 不計入，4 -> 5 時可觸發 feedback。

## Responsive contract

- Phone gallery：1-2 欄。
- Tablet gallery：2-3 欄。
- Desktop gallery：3-4 欄。
- Museum Label 內容保持可閱讀寬度；照片、文字、錯誤訊息與 controls 不得互相重疊。