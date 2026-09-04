# 我的收藏博物館 Collection Museum UX/UI Design Handoff

> 本文件補充正式 [Specification](spec.md)，不取代 Specification，也不是 GitHub Spec Kit 官方 command。所有影響產品行為的內容均已同步回正式 Specification。

## 產品 UX 概念

`Item → Label → Category → Exhibit → Museum`

讓孩子感受到自己正在整理與策劃一座博物館，而不是操作 database。

## 主導覽

- Museum
- Collection
- Exhibits
- Add Item

不建立獨立 Profile、Favorites 或 Categories 主導覽頁。

## Museum

Museum 作為首頁，顯示：

- 固定 Museum title：「My Collection Museum」
- item/category/exhibit summary
- Featured Items
- My Exhibits
- Add New Item

summary 僅顯示現有資料的 Item count、Category count 與 Exhibition count。Featured Items 為最近新增的 Collection Items，依 `createdAt` 由新到舊排列，最多 4 件；0 件 Item 時不顯示區塊，1–4 件全部顯示，超過 4 件只顯示最新 4 件。不使用人工精選、AI 推薦、rating ranking 或其他推薦演算法。

首次使用提供清楚 empty state 與 Add My First Item。

第一版不允許編輯 Museum title，不建立 Settings，也不保存 title persistence field。

## Add Item

採短流程：

1. Photograph
2. Museum Label
3. Add to Museum

Museum Label 欄位：

- Name
- Category
- Found / Got It At
- Why It Is Special
- My Rating ★

Name 為唯一必要欄位。Photo step / Photo area 的失敗提示、retry 與不使用照片繼續依 FR-005；save failure 的 draft preservation 與 retry 依 FR-016。UI 以 inline error 呈現，不以 blocking modal 作為主要錯誤處理。
Category selector 只提供 Uncategorized 與已存在的 Categories；不得在 Add Item 或 Edit Museum Label inline 建立 Category。需要新 Category 時，先由 Collection View 的獨立 Add Category control 建立，再回到 Item 選擇。

完成後提供：

- View Item
- Add Another

## Item Detail

以物品照片為視覺主角。

Museum Label 呈現：

- name
- category
- location
- story
- rating

提供：

- Edit Label
- Add to Exhibit

Delete Item 為 destructive action，必須確認。

## Collection

以 photo cards 顯示 Items。每張卡至少有：

- photo
- name
- category
- rating

提供簡單 Category chips：

- All
- existing categories
- Uncategorized

All 顯示全部 Items，Category 顯示該 Category Items，Uncategorized 顯示 `categoryId` 為 `null` 的 Items；selected chip 有清楚 selected state。Add Category 是 Category filter 區域附近的獨立 control，不是 filter chip，按下後進入既有 Category 建立流程。不建立複雜 filter builder。

缺少照片的 Item 使用一致的 museum-style placeholder：deep green 背景、簡單非品牌化 museum/collection icon 與清楚 Item name。Placeholder 仍可點擊進入 Item Detail / Museum Label，不顯示 broken image、價格、稀有度或購買訊號。

## Category

可 Create、Rename、Delete；Category 關聯與刪除行為依 FR-006。UI 顯示必要結果為未指定或被刪除 Category 的 Item 顯示 Uncategorized；不提供多分類或額外 tags。

## Exhibits

展示既有 Exhibition。每張 Exhibition card 有：

- name
- representative image
- item count

提供 Create Exhibit。

### Create Exhibit

流程：

1. Exhibition Name
2. Select Collection Items
3. Arrange Item Order
4. Open Exhibition

至少選擇一件 Item。
第一版不使用 drag-and-drop；使用 Move Up 與 Move Down 控制項交換相鄰 Item。第一項的 Move Up、最後一項的 Move Down 不可用，操作後立即反映目前順序，儲存後 reload 仍保持順序。

### Exhibition View

以展覽方式按照策展順序呈現大型物品照片。點擊 Item 可查看 Museum Label。

不顯示：

- Share
- Publish
- Like
- Comment
- Followers

## Achievement

提供達成當下的事件式 threshold-crossing feedback：只有一次成功且確實改變 domain data 的 Item、Category 或 Exhibition mutation 後比較 before/after，且只有 `false → true` 時顯示；`true → true`、`false → false` 與 `true → false` 不顯示。App 啟動或 reload 不補播，不保存 `displayed` / `dismissed` state；條件跌回門檻以下後，後續操作再次跨越時可再次觸發。5 Item Stories Told 只計算 Why It Is Special 在 `trim()` 後非空的 Items；Name、Location、Category、Rating 不計入。數量由 4 -> 5 時可觸發 feedback。

不使用 leaderboard、daily streak、loss aversion 或限時 pressure。

## Error Recovery

- **Photo 失敗**：依 FR-005 在 Photo area 顯示 inline error、retry 與不使用 photo 繼續。
- **Image output fallback**：由 FR-005 的 photo-specific product behavior 與 Plan technical design 實作；本 handoff 不重複其完整規則。
- **Name 空白**：顯示欄位附近錯誤，不清除其他資料。
- **Save failure**：依 FR-016 保留目前資料並提供 retry。
- **Item timestamps**：`createdAt` 只在第一次成功建立時產生，Edit 不變；`updatedAt` 在建立及每次成功修改時更新。Featured Items 依有效 `createdAt` 新到舊排序；缺少/無效 timestamp 的資料不 crash、不補現在時間，排在有效 timestamp 之後；v1 不建立 migration framework。
- **Empty Exhibition**：阻止完成並要求至少一件 Item。
- **No Exhibitions**：Exhibits View 顯示「還沒有展覽。從你的收藏挑幾件寶物，打造第一個展覽。」與 Create Exhibit CTA。

## Responsive

優先順序：Tablet → Laptop → Phone

- **Phone**：1–2 column gallery
- **Tablet**：2–3 columns
- **Desktop**：3–4 columns

Museum Label 保持容易閱讀的內容寬度。

## Visual Direction

Modern Natural History Museum × Collection Cabinet

色彩：

- black
- warm off-white
- deep green

收藏照片是視覺主角。

可使用少量 museum labels、display cabinets、catalog number、exhibition title 等視覺語彙。

不得以價格或收藏價值作為主要視覺訊號。
