# KaiDev Blog

Astro v5 + React で構築した個人技術ブログです。

## 特徴

- **Astro v5** - 高速な静的サイト生成
- **React (Islands Architecture)** - インタラクティブなコンポーネント
- **Tailwind CSS v4** - モダンなスタイリング
- **ダークモード** - システム設定連動 + 手動切り替え
- **いいね機能** - Supabase連携（トグル式）
- **レスポンシブ対応** - モバイルファースト
- **SEO対応** - サイトマップ・OGP自動生成

---

## 📁 プロジェクト構成

```
src/
├── assets/              # 画像などの静的アセット
├── components/          # 再利用可能なコンポーネント
│   ├── *.astro          # Astroコンポーネント
│   └── *.tsx            # Reactコンポーネント（Islands）
├── content/             # Content Collections
│   └── blog/            # ブログ記事（.md/.mdx）
├── layouts/             # ページレイアウト
├── lib/                 # ユーティリティ・外部サービス連携
├── pages/               # ページ・ルーティング
│   ├── api/             # APIエンドポイント
│   └── blog/            # ブログページ
└── styles/              # グローバルCSS

supabase/
└── migrations/          # DBマイグレーション

.github/
└── workflows/           # CI/CD設定
```

---

## 🧞 コマンド

| コマンド               | 説明                               |
| :--------------------- | :--------------------------------- |
| `npm install`          | 依存関係のインストール             |
| `npm run dev`          | 開発サーバー起動（localhost:4321） |
| `npm run build`        | 本番用ビルド（./dist/）            |
| `npm run preview`      | ビルドのプレビュー                 |
| `npm run lint`         | ESLintでコードチェック             |
| `npm run lint:fix`     | ESLintエラーを自動修正             |
| `npm run format`       | Prettierでフォーマット             |
| `npm run format:check` | フォーマットチェック               |
| `npm run check`        | Astro型チェック                    |

---

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/KaiW1126/KaiDev.git
cd KaiDev
npm install
```

### 2. 環境変数の設定

`.env` ファイルをプロジェクトルートに作成：

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase セットアップ

`supabase/migrations/` 内のSQLファイルをSupabase SQL Editorで実行：

1. `001_likes_table.sql` - likesテーブル作成
2. `002_add_delete_policy.sql` - DELETEポリシーと関数追加

### 4. 開発サーバー起動

```bash
npm run dev
```

---

## 🚀 デプロイ

**Vercel** にデプロイ済み。

1. GitHubと連携
2. 環境変数を設定（`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`）
3. pushで自動デプロイ

---

## 📝 ブログ記事の追加

`src/content/blog/` に `.md` ファイルを作成：

```markdown
---
title: '記事タイトル'
description: '記事の説明'
pubDate: 'Feb 08 2026'
tags: ['Astro', 'React']
heroImage: '/blog-placeholder.jpg'
---

記事本文...
```

---

## 🛠️ 技術スタック

| 技術         | バージョン | 用途               |
| :----------- | :--------- | :----------------- |
| Astro        | v5         | フレームワーク     |
| React        | v19        | インタラクティブUI |
| TypeScript   | -          | 型安全             |
| Tailwind CSS | v4         | スタイリング       |
| Supabase     | -          | データベース       |
| Vercel       | -          | ホスティング       |

---

## 📜 ライセンス

MIT
