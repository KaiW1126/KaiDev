# CLAUDE.md - Implementation Guidelines

このファイルは、Claude（Anthropic）がこのプロジェクトで作業する際の実装方針を定義します。

## プロジェクト構造

```
src/
├── assets/          # 静的アセット（画像など）
├── components/      # 再利用可能なコンポーネント
│   ├── *.astro      # Astroコンポーネント
│   └── *.tsx        # Reactコンポーネント（Islands用）
├── content/         # Content Collections
│   └── blog/        # ブログ記事（.md/.mdx）
├── layouts/         # ページレイアウト
├── lib/             # ユーティリティ・外部サービス連携
├── pages/           # ページ・APIルート
│   ├── api/         # APIエンドポイント
│   └── blog/        # ブログページ
└── styles/          # グローバルCSS
```

---

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Astro | v5 | フレームワーク |
| React | v19 | インタラクティブコンポーネント |
| TypeScript | strict | 型安全 |
| Tailwind CSS | v4 | スタイリング |
| Supabase | - | データベース（いいね機能） |
| Vercel | - | ホスティング |

---

## 実装方針

### 1. Astro ファースト

- **デフォルトは静的生成**：可能な限り `prerender = true`
- **Islands Architecture**：インタラクティブな部分のみ React
- **クライアントJS最小化**：`client:load` は本当に必要な場合のみ

### 2. スタイリング

- **グローバルCSS**：`src/styles/global.css` でデザインシステム定義
- **コンポーネントスコープ**：`<style>` タグでスコープ付きCSS
- **CSS変数**：テーマ切り替え対応のため積極活用
- **レスポンシブ**：モバイルファースト（`max-width` メディアクエリ）

### 3. データフェッチ

- **静的データ**：ビルド時に Content Collections から取得
- **動的データ**：API Routes（`/api/*`）経由

### 4. 状態管理

- **ローカル状態**：React の `useState` / `useReducer`
- **永続化**：`localStorage`（いいね済み状態など）
- **サーバー状態**：Supabase（いいね数など）

### 5. ブランチ管理
 基本新規機能、修正、新規記事はブランチを分けて作成して、PRを作成して、レビューを待って、マージする。

---

## コーディング規約

### TypeScript

```typescript
// Good: 明示的な型定義
interface Props {
  articleId: string;
}

// Bad: any の使用
const data: any = {};
```

### React コンポーネント

```tsx
// Good: 関数コンポーネント + 型定義
export default function LikeButton({ articleId }: Props) {
  // ...
}

// Bad: クラスコンポーネント
class LikeButton extends React.Component { }
```

### Astro コンポーネント

```astro
---
// Good: フロントマターでロジック
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<h1>{title}</h1>
```

### CSS

```css
/* Good: CSS変数の使用 */
.button {
  background: var(--color-accent);
}

/* Bad: ハードコードされた色 */
.button {
  background: #0070f3;
}
```

---

## よくあるタスクの実装パターン

### 新しいブログ記事の追加

1. `src/content/blog/` に `.md` ファイルを作成
2. フロントマターを正しく設定

```yaml
---
title: "記事タイトル"
description: "説明"
pubDate: "Feb 08 2026"
tags: ["Astro", "React"]
---
```

### 新しいコンポーネントの追加

1. `src/components/` にファイル作成
2. Astro only → `.astro`、React必要 → `.tsx`
3. 必要に応じて `client:*` ディレクティブを使用

### API エンドポイントの追加

1. `src/pages/api/` にファイル作成
2. `prerender = false` を設定
3. `GET`, `POST` などをエクスポート

---

## 注意事項

- **環境変数**：`.env` はコミットしない（`.gitignore` に含まれている）
- **Supabase キー**：`PUBLIC_` プレフィックスのものはクライアントで使用可
- **ビルドテスト**：`npm run build` でエラーがないか確認
