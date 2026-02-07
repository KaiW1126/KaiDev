---
title: 'Astro触ってみたくてAstroで個人ブログ作った'
description: 'Astroフレームワークを学ぶために、実際に個人ブログを構築してみました。ダークモード、いいね機能、レスポンシブ対応など、実践的な機能を実装した過程を紹介します。'
pubDate: 'Feb 07 2026'
tags: ['Astro', 'React', 'Supabase']
---

## はじめに

インターン中の会社のメディアサイトでAstroで構築されたものがあり、そこで興味を持ちました。
X上でもブログをAstroで構築している人がいて、気になるなーと思っていたので実際に作ってみることにしました

## Astroとは？

Astroは、コンテンツ重視のWebサイトを構築するための**モダンな静的サイトジェネレーター**です。

### 主な特徴

**1. デフォルトでゼロJS**
Astroは基本的にHTMLとCSSだけをブラウザに送ります。JavaScriptは必要な部分にだけ選択的に追加できるため、ページの読み込みが非常に高速。

**2. Islands Architecture（アイランドアーキテクチャ）**
ページ全体をJavaScriptで動かすのではなく、**インタラクティブな部分（島）だけにJavaScriptを使う**設計思想。例えば、静的なブログ記事の中に、いいねボタンだけReactで実装する、といったことが簡単にできます。

**3. フレームワーク非依存**
React、Vue、Svelte、Solidなど、好きなUIフレームワークを**同じプロジェクト内で混在**させることができます。必要に応じて使い分けられるのが強み。

**4. ファイルベースルーティング**
Next.jsと同様に、`src/pages/`配下のファイル構造がそのままURLになります。直感的で分かりやすい。

参考：https://docs.astro.build/ja/concepts/why-astro/

## 当ブログの技術スタック

| 技術 | 用途 |
|------|------|
| **Astro** | フレームワーク |
| **TypeScript** | 　　型安全な開発 |
| **React** | いいねボタン（Islands） |
| **Tailwind** | 　　スタイリング |
| **Supabase** | いいね数の保存（PostgreSQL） |
| **Vercel** | ホスティング |


## Astroを使ってみて
ほんとにわかりやすい！ Next.jsやReactよりもより役割や責務が明確化されており、個人開発にはもってこいだと感じた。また、Astroがblogのテンプレートを用意してくれている上、.astroファイルもHTMLとCSSとJSを混ぜたような書き方で直感的に書けるのがよかった。特にReact触ってれば新しく感じることは少なくすぐに適応できると思う。

## 利点
高速：Astroはデフォルトで静的サイトを生成するため、表示速度が速い。できるだけ動的なコンテンツを使わずにHTMLのみをブラウザに送ることで、速くしている。また、サーバーファーストという思想で　SSG: Static Site Generation　でビルド時にサーバー側で処理してからHTMLを生成するので、高速なんだとか。ここら辺は別記事でまとめようと思う。



## 実装した機能
以下具体的に実装した機能です

### 1. ダークモード対応
CSS変数とlocalStorageを使って、テーマの切り替えと永続化を実装しました。

### 2. いいね機能（Supabase連携）
React Islandを使って、記事ごとのいいねボタンを実装。データはSupabaseに保存しています。

```tsx
// LikeButton.tsx
export default function LikeButton({ slug }: { slug: string }) {
  const [likes, setLikes] = useState(0);
  
  // client:loadディレクティブで必要な時だけJSを読み込む
  // ...
}
```

Astroファイル内では`client:load`で統合:
```astro
<LikeButton client:load slug={post.slug} />
```

### 3. レスポンシブデザイン
モバイルではハンバーガーメニューを表示し、記事カードをコンパクトに表示するように調整しました。

## 学んだこと

- Astroのファイルベースルーティング
- Content Collectionsによるマークダウン管理
- API Routesの実装方法
- Reactコンポーネントの統合（client:load）

## まとめ

Astroは静的サイトを高速に構築するのに最適なフレームワークでした。特にブログのようなコンテンツ中心のサイトには相性良き。設計思想も面白そうなのでまた記事にしようと思います
