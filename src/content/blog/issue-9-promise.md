---
title: 'Promiseとは？「あとで届く箱」のイメージで非同期処理の基本を掴む'
description: 'JavaScriptのPromiseの3つの状態、then/catchによる連鎖、async/awaitとの関係を解説。次回のReact Suspense記事に繋がる土台を固めます'
pubDate: '2026-03-01'
tags: ['JavaScript', 'React', 'Promise', 'async/await']
---

## はじめに

Reactを使っていると `async/await` や `Promise` を何気なく書きますが、仕組みを聞かれるとうまく答えられません（自分がそうでした）。

なので、この記事では**Promiseとはなんですか？と聞かれた時に、きちんと難易度ごとに説明できるようにする**ことを目指します。

---

## Promiseの正体 —「あとで値が届く箱」

そもそもPromiseとは、`String` や `Array` と同じ **JavaScriptに組み込まれた一つの型**です。

`new Promise()` で生成すると、**状態（pending / fulfilled / rejected）** と、それを変えるための関数（`resolve` / `reject`）が定義されます。

### Promiseの3つの状態

| 状態                  | 意味                                       |
| --------------------- | ------------------------------------------ |
| **Pending（待機）**   | 初期状態です。まだ成功も失敗もしていません |
| **Fulfilled（履行）** | 処理が成功して値が届いた状態です           |
| **Rejected（拒否）**  | 処理が失敗してエラーが届いた状態です       |

> 💡 一度 **settled（決定）** したら、二度と状態は変わりません。

### コードで確認：Promiseを自分で作って resolve / reject する

```js
const promise = new Promise((resolve, reject) => {
	console.log('① Promiseが作られた（まだ Pending 状態）');

	setTimeout(() => {
		resolve('サーバーからのデータ');
		console.log('② resolve() が呼ばれた → Fulfilled に変わった');
	}, 2000);
});

console.log('③ この時点では promise はまだ Pending:', promise);

promise.then((value) => {
	console.log('④ 値を受け取った！:', value);
});
```

**出力結果：**

```
① Promiseが作られた（まだ Pending 状態）
③ この時点では promise はまだ Pending: Promise { <pending> }
② resolve() が呼ばれた → Fulfilled に変わった
④ 値を受け取った！: サーバーからのデータ
```

### なぜこの順番になるのか？

- **① → ③ が先に出る理由**：`new Promise()` のコンストラクタ内のコードは同期的に実行されます。しかし `setTimeout` の中身は「2秒後に実行して」と予約されるだけで、すぐには動きません。そのため、コンストラクタの次の行にある ③ の `console.log` が先に実行されます。この時点で `promise` を見ると `Promise { <pending> }` — まだ値が届いていない待機状態です。
- **② → ④ が後から出る理由**：2秒後に `setTimeout` のコールバックが実行され、`resolve("サーバーからのデータ")` が呼ばれます。これによりPromiseの状態が Pending → **Fulfilled** に変わり（②）、`.then()` に登録しておいたコールバックが値を受け取って実行されます（④）。
- **つまり**：番号が①②③④の順ではなく **①③②④** の順に出力されるのは、JavaScriptが「同期コードをすべて実行してから、非同期コールバックを処理する」という仕組みで動いているからです。

### 構文の解説

`new Promise` でPromiseのオブジェクトを生成します。

`resolve` と `reject` は成功したら `resolve` を呼び、失敗したら `reject` を呼びます。つまり、**Promiseという箱を作って、その中で非同期処理を行い、成功したら `resolve()` で値を届け、失敗したら `reject()` でエラーを届ける**という処理を定義するための書き方です。

> 💡 **「Pendingの間、値はまだ届いていない」**

---

## Promiseのインスタンスメソッド — `.then()` / `.catch()` / `.finally()`

それぞれ、Promiseインスタンスのメソッドです。

### `.then()` — 成功・失敗時の処理を登録する

最大2つの引数を持ち、第1引数に成功時のコールバック関数、第2引数に失敗時のコールバック関数を指定します。

```js
// --- 成功パターン ---
const successPromise = new Promise((resolve, reject) => {
	resolve('データ取得成功！');
});

successPromise.then(
	(value) => console.log('成功:', value), // 第1引数 = 成功時
	(error) => console.log('失敗:', error) // 第2引数 = 失敗時
);
// 出力: 成功: データ取得成功！

// --- 失敗パターン ---
const failPromise = new Promise((resolve, reject) => {
	reject('接続エラー');
});

failPromise.then(
	(value) => console.log('成功:', value),
	(error) => console.log('失敗:', error)
);
// 出力: 失敗: 接続エラー
```

`.then()` は**新しいPromiseを返します**。そのため、つなげて書くことができます（連鎖 / chaining）：

```js
successPromise
	.then((value) => {
		console.log('①', value); // ① データ取得成功！
		return value + ' → 加工済み'; // 次の .then() に渡す
	})
	.then((value) => {
		console.log('②', value); // ② データ取得成功！ → 加工済み
	})
	.catch((error) => {
		console.log('エラー:', error); // 途中でエラーが起きたらここに来る
	});
```

### `.catch()` — エラーだけをキャッチする

`.catch()` は `.then(undefined, onRejected)` のショートカットです。つまり「失敗時だけを処理する `.then()`」です。連鎖の途中でどこかエラーが起きても、最後の `.catch()` でまとめてキャッチできます。

```js
const failPromise = new Promise((resolve, reject) => {
	reject('サーバーエラー');
});

failPromise
	.then((value) => {
		console.log('ここは通らない');
	})
	.catch((error) => {
		console.log('キャッチ:', error);
	});
// 出力: キャッチ: サーバーエラー
```

### `.finally()` — 成功でも失敗でも必ず実行

ローディング表示の終了やリソースの後片付けなど、**結果に関わらず実行したい処理**に使えます。

```js
const promise = new Promise((resolve, reject) => {
	resolve('完了');
});

promise
	.then((value) => console.log('成功:', value))
	.catch((error) => console.log('失敗:', error))
	.finally(() => console.log('後片付け（必ず実行）'));
// 出力:
// 成功: 完了
// 後片付け（必ず実行）
```

---

## それでは async / await とは何か？

- `async` を付けると関数は**自動でPromiseを返します**
- `await` は基本的に `async` の中でのみ使えます
- `await` はPromiseの特定の状態を返すのではなく、**状態変化を扱う構文**です。状態がFulfilledかRejectedになるまで待機します

---

## まとめ — この記事で押さえたこと

- Promiseは **「Pending → Fulfilled or Rejected」の状態マシン**です
- `.then()` の連鎖で非同期処理を宣言的に書けます
- `async/await` はPromiseの糖衣構文です。具体的には以下の対応関係があります：

  ```js
  // async/await で書いた場合
  async function getData() {
  	return 'データ'; // → 内部的に resolve("データ") と同じ
  }

  // Promiseで書いた場合（上と同じ意味）
  function getData() {
  	return new Promise((resolve) => {
  		resolve('データ');
  	});
  }
  ```

  つまり `async` 関数の中では：

  | async/await の書き方           | Promise での対応         |
  | ------------------------------ | ------------------------ |
  | `return value`                 | `resolve(value)`         |
  | `throw error`                  | `reject(error)`          |
  | `const result = await promise` | `.then((result) => ...)` |

**参考**：[Promise - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)

---

## 【次回予告】React Suspenseについて
