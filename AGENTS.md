# AGENTS.md - Codex Review Standards

このファイルは、Codex（OpenAI）がコードレビューを自動で行う際の基準を定義します。

## プロジェクト概要

- **名前**: KaiDev Blog
- **フレームワーク**: Astro v5 + React（Islands Architecture）
- **言語**: TypeScript / CSS
- **スタイリング**: Tailwind CSS v4 + カスタムCSS
- **バックエンド**: Supabase（PostgreSQL）
- **ホスティング**: Vercel

---

## コードレビュー基準

### 1. TypeScript

- [ ] `any` 型の使用を避ける（必要な場合はコメントで理由を説明）
- [ ] 関数には適切な型アノテーションを付ける
- [ ] `interface` と `type` を適切に使い分ける
- [ ] `as` によるキャストは最小限に

### 2. React コンポーネント

- [ ] コンポーネントは小さく、単一責任に
- [ ] Props には適切な型定義を
- [ ] `useEffect` の依存配列を正しく設定
- [ ] 不要な再レンダリングを避ける（`useMemo`, `useCallback`）

### 3. Astro

- [ ] `client:*` ディレクティブは必要な場合のみ使用
- [ ] 静的生成可能なページは `prerender = true`
- [ ] Content Collections のスキーマを正しく定義

### 4. CSS / スタイリング

- [ ] CSS変数を活用してテーマ対応
- [ ] レスポンシブ対応（モバイルファースト）
- [ ] `box-sizing: border-box` の適用を確認
- [ ] 長いテキストの折り返し対応

### 5. セキュリティ

- [ ] 環境変数でシークレットを管理
- [ ] ユーザー入力のサニタイズ
- [ ] XSS対策
- [ ] CORS設定の確認

### 6. パフォーマンス

- [ ] 画像の最適化（`astro:assets`）
- [ ] 不要なJavaScriptを避ける
- [ ] コードスプリッティングの活用

---

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル（コンポーネント） | PascalCase | `LikeButton.tsx` |
| ファイル（ページ） | kebab-case | `blog/index.astro` |
| 変数・関数 | camelCase | `handleLike`, `likeCount` |
| 定数 | UPPER_SNAKE_CASE | `SITE_TITLE` |
| CSS クラス | kebab-case | `.like-button` |
| CSS 変数 | kebab-case with prefix | `--color-accent` |

---

## コミットメッセージ

```
<type>: <subject>

<body>（オプション）
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（コードの動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・ツール設定

### 例

```
feat: いいねボタンの連打防止機能を追加
fix: モバイルでの横スクロールを修正
docs: READMEを更新
```

---

## PR レビューチェックリスト

- [ ] CIが通っている（lint, format, build）
- [ ] 新機能にはテストがある（該当する場合）
- [ ] ドキュメントが更新されている（該当する場合）
- [ ] レスポンシブ対応を確認
- [ ] ダークモード対応を確認
