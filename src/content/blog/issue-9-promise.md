---
title: 'Promiseとは？「あとで届く箱」のイメージで非同期処理の基本を掴む'
description: 'JavaScriptのPromiseの3つの状態、then/catchによる連鎖、async/awaitとの関係を解説。次回のReact Suspense記事に繋がる土台を固めます'
pubDate: '2026-03-01'
tags: ['JavaScript', 'React', 'Promise', 'async/await']
---

## 記事の切り口案

1. **「Promiseは"あとで届く箱"」— 3つの状態で理解する非同期処理の心臓部** - MDNの定義「作成された時点では分からなくてもよい値へのプロキシー」を噛み砕き、Pending→Fulfilled/Rejectedの状態遷移を図解すれば、Suspenseが「Pendingの間にfallbackを出す」仕組みへの伏線になる。
2. **「.then()の連鎖はなぜ動く？」— プロミスチェーンを正しく理解する** - MDN記事でも重点的に扱われるプロミスの連鎖（chaining）を深掘り。「thenは新しいPromiseを返す」という仕組みを掴めば、async/awaitがただの糖衣構文ではないことも腹落ちし、次回Suspenseの「throw promise→再レンダリング」の流れが自然に繋がる。
3. **「async/awaitはPromiseの上に乗っている」— returnとthrowの正体を知る** - async関数がPromiseを自動で返すこと、return=resolve / throw=rejectの対応関係を明示。Suspenseが「throw promise」で動くと聞いたとき、「throwがrejectに対応する」ことを既に知っていれば理解が一段深まる。

## おすすめの構成案（3つの切り口を段階的に積み上げる）

- **仮タイトル**: Promiseとは？「あとで届く箱」のイメージで非同期処理の基本を掴む
- **想定読者**: JavaScriptの基本文法は分かるが、非同期処理・Promiseに苦手意識がある初中級者
- **構成**:
  - はじめに — Promiseを学ぶモチベーション
    - Reactを使っていると `async/await` や `Promise` を何気なく書くが、仕組みを聞かれるとうまく答えられない（自分がそうでした）。なので、この記事ではPromiseとはなんですかと聞かれた時にきちんと難易度ごとに説明できるようにすることを目指す。
    - 特にReact Suspenseの仕組みを理解するにはPromiseの本質が避けて通れない
    - この記事のゴール：Promiseの状態遷移と連鎖を「説明できる」レベルにする
  - Promiseの正体 —「あとで値が届く箱」
  そもそもPromiseとは、stringやArrayといったのと同じ一つのPromiseという型
  new Promise()で、状態（pending/fulfilled/rejected）と、それを変えるための関数(resolve/reject)を定義される。
    - Promiseの3つの状態と遷移図
      - Pending（待機）→ Fulfilled（履行）or Rejected（拒否）
      - 一度 settled（決定）したら二度と変わらない
      
    - コードで確認：Promiseを自分で作って resolve / reject する

    ```js
    const promise = new Promise((resolve, reject) => {
      console.log("① Promiseが作られた（まだ Pending 状態）");

      setTimeout(() => {
        resolve("サーバーからのデータ");
        console.log("② resolve() が呼ばれた → Fulfilled に変わった");
      }, 2000);
    });

    console.log("③ この時点では promise はまだ Pending:", promise);

    promise.then((value) => {
      console.log("④ 値を受け取った！:", value);
    });
    ```
    出力結果
    ```
    ① Promiseが作られた（まだ Pending 状態）
    ③ この時点では promise はまだ Pending: Promise { <pending> }
    ② resolve() が呼ばれた → Fulfilled に変わった
    ④ 値を受け取った！: サーバーからのデータ
    ```

    **なぜこの順番になるのか？**
    - **① → ③ が先に出る理由**: `new Promise()` のコンストラクタ内のコードは同期的に実行される。しかし `setTimeout` の中身は「2秒後に実行して」と予約されるだけで、すぐには動かない。そのため、コンストラクタの次の行にある ③ の `console.log` が先に実行される。この時点で `promise` を見ると `Promise { <pending> }` — まだ値が届いていない待機状態。
    - **② → ④ が後から出る理由**: 2秒後に `setTimeout` のコールバックが実行され、`resolve("サーバーからのデータ")` が呼ばれる。これによりPromiseの状態が Pending → **Fulfilled** に変わり（②）、`.then()` に登録しておいたコールバックが値を受け取って実行される（④）。
    - **つまり**: 番号が①②③④の順ではなく **①③②④** の順に出力されるのは、JavaScriptが「同期コードをすべて実行してから、非同期コールバックを処理する」という仕組みで動いているから。

  構文の解説
  new PromiseでPromiseのオブジェクトを生成する
  また、resolveとrejectは成功したらresolveを呼び、失敗したらrejectを呼びます。つまり、Promiseという箱を作って、その中で非同期処理を行い、成功したら resolve() で値を届け、失敗したら reject() でエラーを届けるという処理を定義するための書き方
  - プロミスの連鎖（Chaining） — .then() / .catch() / .finally()
    - `.then()` は新しいPromiseを返す → だから連鎖できる
    - コードで確認：値を受け取って変換して次に渡す一連の流れ
    - `.catch()` で連鎖の途中のエラーをまとめて処理
    - `.finally()` は成功・失敗に関わらず実行される
  - async / await — Promiseの上に乗った糖衣構文
    - `async`を付けると関数は自動でPromiseを返す
    - `return data` ＝ `resolve(data)`
    - `throw error` ＝ `reject(error)`
    - コードで確認：async関数の戻り値を `.then()` で受け取る
    - try / catch による直感的なエラーハンドリング
  - 実践パターン — 複数のPromiseを扱う
    - `Promise.all()` — すべて成功したら結果をまとめて受け取る
    - `Promise.race()` — 最初に決定したものを採用する
    - `Promise.any()` / `Promise.allSettled()` の使い分け
  - まとめ — この記事で押さえたこと
    - Promiseは「Pending → Fulfilled or Rejected」の状態マシン
    - `.then()` の連鎖で非同期処理を宣言的に書ける
    - `async/await` はPromiseの糖衣構文で、return=resolve / throw=reject
  - 【次回予告】React Suspenseは Promise を throw する？
    - 今回学んだ「Pendingの間は値がない」という性質を、ReactのSuspenseはUIの出し分けに活用している
    - `throw promise` → Suspenseが検知 → fallback表示 → resolve後に再レンダリング
    - React QueryやRelayが裏で何をしているのか、次回記事で深掘りします
