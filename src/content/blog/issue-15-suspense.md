---
title: 'React Suspenseを正しく理解する — 内部の仕組みから使い方まで'
description: 'React Suspenseの仕組みをPromiseとの関係から紐解き、内部処理の流れと実践的な使い方を解説します。'
pubDate: '2026-04-12'
tags: ['React', 'Suspense', 'Promise', 'JavaScript']
---

## はじめに

[前回の記事](/blog/issue-9-promise)ではPromiseの仕組みを学びました。「状態を持つ箱」としてのPromiseが理解できたところで、今回はその知識を活かして **React Suspense** に踏み込みます。

Suspenseを使ったコードは見たことがあるけれど、「内部で何が起きているのか」を聞かれると答えられない――自分がまさにそうでした。

この記事では、**Suspenseが内部でPromiseをどう扱っているのか**を理解し、その上で**実践的な使い方パターン**を身につけることを目指します。

---

## Suspenseとは何か

`<Suspense>` は、**子孫コンポーネントがレンダー中にサスペンドしたときに、フォールバック（代替UI）を表示する**ためのReactコンポーネントです。

```jsx
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

### 従来パターンとの違い

Suspenseが登場する前は、非同期データの取得状態を自前で管理していました。

```jsx
// 従来パターン：useEffect + useState で状態を手動管理
function AlbumList({ artistId }) {
  const [albums, setAlbums] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchAlbums(artistId)
      .then((data) => setAlbums(data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [artistId]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  return <Albums data={albums} />;
}
```

3つのstate（`isLoading`, `error`, `data`）を毎回定義して、条件分岐でUIを切り替える必要がありました。コンポーネントが増えるほど、この「ローディング管理コード」が至る所に散らばります。

Suspenseを使うと、**ロード状態の管理をコンポーネントの外（=Suspenseバウンダリ）に委譲**できます。

```jsx
// Suspenseパターン：ロード状態を宣言的に管理
function ArtistPage({ artist }) {
  return (
    <Suspense fallback={<Loading />}>
      <AlbumList artistId={artist.id} />
    </Suspense>
  );
}
```

コンポーネント自身は「データが揃った状態」だけを考えればよく、ロード中の見た目は `<Suspense>` の `fallback` に任せます。命令的な状態管理から、宣言的なUI記述への転換です。

---

## Suspenseの内部で何が起きているのか

ここが本記事の核心です。Suspenseは魔法ではなく、**Promiseのthrow/catchという仕組み**で動いています。

### コンポーネントがPromiseを「throw」する

通常、JavaScriptで `throw` するのはエラーオブジェクトです。しかしReactのSuspenseの仕組みでは、**コンポーネントのレンダー中にPromiseがthrowされる**ことを想定しています。

概念的には、以下のような流れです。

```jsx
// Suspense対応のデータ取得（概念的なコード）
function fetchData(url) {
  let status = 'pending';
  let result;

  const promise = fetch(url)
    .then((res) => res.json())
    .then((data) => {
      status = 'fulfilled';
      result = data;
    })
    .catch((err) => {
      status = 'rejected';
      result = err;
    });

  // この関数がコンポーネントから呼ばれる
  return function read() {
    if (status === 'pending') {
      throw promise;       // ← まだ完了していない → Promiseをthrow!
    } else if (status === 'rejected') {
      throw result;        // ← エラーをthrow
    }
    return result;          // ← 完了済み → 値を返す
  };
}
```

前回の記事で学んだPromiseの3つの状態（Pending / Fulfilled / Rejected）を思い出してください。

| Promiseの状態 | Suspenseでの扱い |
| --- | --- |
| **Pending** | Promiseをthrow → fallbackを表示 |
| **Fulfilled** | 値を返す → childrenを表示 |
| **Rejected** | エラーをthrow → ErrorBoundaryが処理 |

### Suspenseバウンダリが「catch」する

throwされたPromiseは、**最も近い親の `<Suspense>` コンポーネントがキャッチ**します。

これはエラーバウンダリ（ErrorBoundary）の仕組みと似ています。エラーバウンダリが `throw` されたエラーをキャッチするように、Suspenseバウンダリは `throw` されたPromiseをキャッチします。

流れを整理すると、以下のようになります。

1. コンポーネントがレンダー中にPromise（Pending状態）をthrowする
2. 最も近い `<Suspense>` がそのPromiseをキャッチする
3. `<Suspense>` は `fallback` を表示に切り替える
4. throwされたPromiseが解決（Fulfilled）したら、Reactが再レンダーをスケジュールする
5. 再レンダー時、データは準備できているのでthrowされず、値が返る
6. `<Suspense>` は `fallback` を消して `children` を表示する

> 💡 つまりSuspenseは、**「Promiseという箱がまだ開いていなければ待ち、開いたら中身を表示する」** という仕組みです。前回の記事でPromiseを「あとで届く箱」と表現しましたが、Suspenseはまさにその箱が届くまでの待機UIを担当しています。

### `use` フックによるPromiseの読み取り

React 19では、`use` フックを使ってPromiseの値を読み取ることができます。

```jsx
import { use, Suspense } from 'react';

// フレームワークや親コンポーネントが作成したPromiseを受け取る
function ArtistPage({ albumsPromise }) {

  return (
    <Suspense fallback={<Loading />}>
      <Albums albumsPromise={albumsPromise} />
    </Suspense>
  );
}

function Albums({ albumsPromise }) {
  // use() はPromiseがPendingならthrowし、FulfilledならResolve値を返す
  const albums = use(albumsPromise);
  return (
    <ul>
      {albums.map((album) => (
        <li key={album.id}>{album.title}</li>
      ))}
    </ul>
  );
}

function Loading() {
  return <p>Loading...</p>;
}
```

`use` フックは内部で、Promiseの状態を確認し、Pendingであればthrowし、Fulfilledであれば値を返すという処理を行います。開発者がthrowを直接書く必要がなく、自然にSuspenseと連携できます。

> 💡 重要なのは、`use` に渡すPromiseを**レンダーのたびに作り直さない**ことです。React公式でも、`use(fetch(...))` のようにレンダー中に新しいPromiseを作る形は非推奨で、キャッシュ済みのPromiseやフレームワークが管理するPromiseを読む形が推奨されています。

---

## Suspenseの使い方

内部の仕組みを理解した上で、具体的な使い方パターンを見ていきます。

### 基本：フォールバックを表示する

最もシンプルな使い方です。

```jsx
import { Suspense } from 'react';
import Albums from './Albums';

function ArtistPage({ artist }) {
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<h2>🌀 Loading...</h2>}>
        <Albums artistId={artist.id} />
      </Suspense>
    </>
  );
}
```

`Albums` がデータ取得中にサスペンドすると、`<h2>🌀 Loading...</h2>` が表示されます。データが準備できたら `Albums` に切り替わります。

### コンテンツを一度にまとめて表示する

ひとつの `<Suspense>` の中に複数のコンポーネントを入れると、**すべてが揃ってから一斉に表示**されます。

```jsx
<Suspense fallback={<Loading />}>
  <Biography artistId={artist.id} />
  <Panel>
    <Albums artistId={artist.id} />
  </Panel>
</Suspense>
```

`Biography` と `Albums` のどちらか一方でも読み込み中であれば、両方とも `Loading` フォールバックに置き換わります。両方の準備が整ったタイミングで、一斉に表示されます。

### ネストによる段階的ロード

Suspenseをネストすると、**読み込みの段階を分ける**ことができます。

```jsx
<Suspense fallback={<BigSpinner />}>
  <Biography />
  <Suspense fallback={<AlbumsGlimmer />}>
    <Panel>
      <Albums />
    </Panel>
  </Suspense>
</Suspense>
```

この場合、以下の順序で表示が進みます。

1. 最初は `BigSpinner` が全体の代わりに表示される
2. `Biography` のロードが完了 → `BigSpinner` が消えて `Biography` が表示される。ただし `Albums` はまだなので `AlbumsGlimmer` が表示される
3. `Albums` のロードが完了 → `AlbumsGlimmer` が `Albums` に置き換わる

Suspenseバウンダリを**どのレベルに置くか**で、ユーザが見るロード体験を細かく制御できるわけです。

> 💡 ただし、あらゆるコンポーネントにSuspenseバウンダリを設定する必要はありません。ユーザに見せたいロードの**ステップ単位**で配置するのが適切です。

### `startTransition` / `useDeferredValue` との連携

ページ遷移時に、すでに表示されているコンテンツがフォールバックに置き換わると不快な体験になります。

```jsx
// 問題：ナビゲーションのたびに全体がフォールバックに戻る
function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    setPage(url); // すぐにUIがフォールバックに切り替わる
  }
  // ...
}
```

`startTransition` を使うと、**既存のコンテンツを維持したまま**新しいコンテンツの読み込みを待てます。

```jsx
import { startTransition } from 'react';

function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    startTransition(() => {
      setPage(url); // 低緊急度の更新として扱われる
    });
  }
  // ...
}
```

同様に、検索フィールドのようにユーザ入力と非同期データが連動する場面では、`useDeferredValue` が有効です。

```jsx
import { Suspense, useState, useDeferredValue } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<h2>Loading...</h2>}>
        <div style={{ opacity: isStale ? 0.5 : 1 }}>
          <SearchResults query={deferredQuery} />
        </div>
      </Suspense>
    </>
  );
}
```

入力フィールドはすぐに更新されますが、検索結果は前の結果を（薄く表示しながら）維持し、新しい結果が準備できたタイミングで切り替わります。

---

## 知っておきたい注意点

### useEffect内のfetchではSuspenseは動かない

Suspenseがキャッチできるのは、**レンダー中にthrowされたPromise**だけです。`useEffect` や イベントハンドラ内で `fetch` を実行しても、Suspenseはそれを検知しません。

```jsx
// ❌ これではSuspenseは動かない
function Albums({ artistId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/albums/${artistId}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [artistId]);

  if (!data) return <p>Loading...</p>;
  return <AlbumList data={data} />;
}
```

Suspenseを活用するには、Suspense対応のフレームワーク（Next.js, Relay）や、`use` フック + キャッシュ済みPromise、`React.lazy` によるコード分割など、**レンダー中にPromiseをthrowする仕組み**を使う必要があります。

### ローディングが止まらないケース

レンダーのたびに**新しいPromiseが生成される**と、Suspenseは毎回「新しいPending状態」として扱い、永遠にフォールバックが表示され続けます。

```jsx
// ❌ レンダーのたびに新しいPromiseが作られる
function Albums({ artistId }) {
  const albums = use(fetchAlbums(artistId)); // 毎回新しいPromise!
  return <AlbumList data={albums} />;
}
```

Promiseは**コンポーネントの外でキャッシュ**するか、フレームワークのデータ取得機構を利用する必要があります。

---

## まとめ

- Suspenseは **「ロード状態の宣言的な管理」** を実現するReactコンポーネントです
- 内部では、コンポーネントがPending状態のPromiseを **throw** し、Suspenseバウンダリがそれを **catch** してfallbackを表示するという仕組みで動いています
- `use` フックにより、Promiseの状態に応じた throw/return をReactが自動で行ってくれます
- ネストや `startTransition` との連携で、ユーザ体験を細かく制御できます
- `useEffect` 内のfetchでは動かない点、Promiseのキャッシュが必要な点には注意が必要です

**参考文献**：
- [&lt;Suspense&gt; – React 公式ドキュメント](https://ja.react.dev/reference/react/Suspense)
- [`use` – React 公式ドキュメント](https://ja.react.dev/reference/react/use)
- [React 19: New API `use` – React Blog](https://react.dev/blog/2024/12/05/react-19#new-api-use)
- [`startTransition` – React 公式ドキュメント](https://ja.react.dev/reference/react/startTransition)
- [`useDeferredValue` – React 公式ドキュメント](https://ja.react.dev/reference/react/useDeferredValue)
- [Suspenseの基本 — jotaiによるReact再入門（uhyo）](https://zenn.dev/uhyo/books/learn-react-with-jotai/viewer/suspense-basics)
