# English Study

> TOEIC対策と英語語彙学習のWebアプリケーション

## Features

- TOEIC対策クイズ -- Part 5/6/7対応の実践問題
- 語彙学習 -- 300語のフラッシュカード形式
- 学習進捗管理 -- localStorageによる解答履歴の記録
- ダークテーマUI -- 紫系グラデーションのダークスキーム

## Contents

### Quiz（TOEIC対策）
- 210問
- カテゴリ一覧（問題数）:
  - 文法・語彙: 40
  - 短文穴埋め Part5: 35
  - ビジネス会話: 35
  - 読解 Part7: 35
  - ビジネス文書: 35
  - 長文穴埋め Part6: 30
- クイズモード: カテゴリ選択、ランダム出題、解説表示

### Vocabulary（語彙学習）
- 300問
- フラッシュカード形式での学習

### Progress（進捗管理）
- 解答履歴と正答率の確認

## Tech Stack

- React 19 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- localStorage（進捗データ永続化）

## Usage

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス。

## Deployment

```bash
npm run build
```

`dist/` ディレクトリを任意の静的ホスティングサービスにデプロイ。

## License: MIT
