# 我的收藏博物館

**My Collection Museum** 是一座屬於自己的私人數位博物館。你可以把石頭、卡片、貼紙、模型、橡皮擦，或任何對你有意義的物品記錄下來，為它們加上照片、分類與故事，再策劃成自己的展覽。

這是一個使用 HTML、CSS 與原生 JavaScript ES Modules 製作的前端 MVP。資料直接保存在目前裝置的瀏覽器中，不需要帳號、後端或雲端服務。

## 功能一覽

- **Museum**：查看博物館摘要、最近加入的收藏與已建立的展覽。
- **Collection**：以照片卡片瀏覽收藏，依分類或 `Uncategorized` 篩選。
- **Museum Label**：為收藏保存名稱、照片、取得地點、特別故事與私人評分。
- **Categories**：建立、重新命名及刪除自訂分類；每件收藏最多屬於一個分類。
- **Exhibits**：選擇收藏建立展覽，使用 `Move Up` / `Move Down` 安排展示順序。
- **私人完成回饋**：完成指定整理里程碑時，顯示只對目前使用者可見的 achievement feedback。
- **可恢復的輸入流程**：照片無法使用時仍可不附照片保存；驗證或保存失敗時會保留已輸入內容。

## 開始使用

### 需要什麼

- 支援 ES Modules、IndexedDB、Canvas 與 File/Blob API 的現代瀏覽器。
- Python 3 或其他能提供靜態檔案的本機 HTTP server。
- Node.js（只有在要執行自動化測試時需要）。

### 啟動應用程式

請在專案根目錄執行：

```powershell
python -m http.server 8000
```

然後在瀏覽器開啟：

```text
http://localhost:8000/index.html
```

也可以使用 `python3 -m http.server 8000`，視你的 Python 指令名稱而定。

請使用 HTTP server 開啟，不要直接以 `file://` 開啟 `index.html`。ES Modules 與 IndexedDB 在直接開檔時可能受到瀏覽器安全限制，導致應用程式無法正常初始化。

## 使用流程

### 建立第一件收藏

1. 在首頁選擇 **Add My First Item**，或從導覽列選擇 **Add Item**。
2. 在 **Photograph** 步驟選擇照片；也可以選擇不使用照片繼續。
3. 在 **Museum Label** 輸入名稱。名稱是唯一必要欄位，其餘欄位都可以稍後補充。
4. 選擇 **Add to Museum** 保存。
5. 保存成功後，可選擇 **View Item** 查看收藏，或選擇 **Add Another** 繼續新增。

### 編輯收藏標籤

在 **Collection** 或 **Museum** 點擊收藏卡片，進入 Museum Label 後選擇 **Edit Label**。可以補充或修改照片、分類、取得地點、故事與 1 至 5 顆星的私人評分。

### 管理分類

1. 在 **Collection** 選擇 **+ Add Category** 建立分類。
2. 在收藏的 **Edit Label** 中選擇分類。
3. 使用分類控制項篩選收藏；選擇 **All Items** 可恢復顯示全部收藏。
4. 在分類管理區重新命名或刪除分類。

刪除分類不會刪除收藏；受影響的收藏會改為 `Uncategorized`。

### 建立展覽

1. 在 **Exhibits** 選擇 **+ Create Exhibit**。
2. 輸入展覽名稱，並至少選擇一件收藏。
3. 在 **Arrange Order** 使用 **Move Up** 與 **Move Down** 調整展品順序。
4. 保存後開啟展覽，即可依策展順序瀏覽大型展品圖片。

展覽至少需要名稱與一件展品才能新建或保存。若展品之後被刪除，展覽本身會保留，並以安全的空展覽狀態顯示。

## 資料與隱私

- 收藏、分類、展覽與照片 Blob 都保存在目前瀏覽器的 IndexedDB 中。
- 資料不會自動同步至其他瀏覽器、裝置或雲端。
- 清除瀏覽器網站資料可能會刪除這座博物館的內容。
- 第一版不提供帳號、公開發布、分享、留言、按讚、追蹤、排行榜或價格估算。
- Achievement 是當次操作完成時的私人回饋；重新整理頁面不會補播舊回饋。

## 執行測試

本專案使用 Node.js 內建的 `node:test`，不需要安裝測試框架或 runtime third-party dependency：

```powershell
node --test
```

測試涵蓋資料驗證、分類操作、展覽排序與驗證、刪除收藏時的關聯清理、achievement 計算，以及不依賴瀏覽器 DOM 的 UI helper。

瀏覽器手動驗證則請先啟動上方的 HTTP server，再依 [規格快速開始與驗證流程](specs/001-collection-museum/quickstart.md) 操作。瀏覽器中的 IndexedDB 會跨頁面重新整理保留資料；測試不同情境時，請留意目前瀏覽器 profile 內已有的資料。

## 專案結構

```text
index.html              應用程式入口與主要 view 容器
css/styles.css          版面、元件與 responsive 樣式
js/app.js               初始化、導覽、狀態與保存流程
js/db.js                IndexedDB persistence layer
js/items.js              收藏資料與驗證
js/categories.js        分類資料與關聯操作
js/exhibitions.js       展覽資料、排序與關聯清理
js/achievements.js      私人 achievement 條件與事件回饋
js/image.js             照片驗證、縮放與 Blob 處理
js/ui.js                UI render helpers 與表單畫面
tests/                  Node.js 純邏輯測試
specs/                  產品規格、資料模型與驗證紀錄
```

## 開發原則與限制

- 使用 HTML5、CSS 與 Vanilla JavaScript ES Modules。
- 不使用前端框架、後端、Authentication、Cloud sync 或外部 API。
- 每件收藏最多一個自訂分類，不支援額外 tags 或多分類。
- 收藏內容以個人故事與照片為核心，不以價格、稀有度或公開比較排序。

## 授權

本專案目前以 MIT License 發布，詳情請參考專案設定中的 `license` 欄位。