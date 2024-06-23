# ServerForm-Wrapper
`@minecraft/server-ui`が提供するフォーム作成用APIをより扱いやすいものにしたライブラリです。

## 導入
[Releases]()からダウンロードした.zipファイル内の`scripts/UI.js`と`scripts/UI.d.ts`をアドオンの`scripts`フォルダ内に入れて使用してください。
<br>双方を同一のフォルダ内に置くことを推奨します。

## 使用法

### import
例:
```js
// パスはファイルを置いた場所に合わせてください
import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper } from "./UI";
```

### ActionFormWrapper
```js
const form = new ActionFormWrapper()
.title("フォームのタイトル") // 必須
.body("本文1行目", "2行目", "3行目...") // 残余引数で、引数の数に限りはありません
.button("ボタン1") // button()メソッドの書き方は様々で、多様な書き方をサポートします
.button("ボタン2", "textures/items/apple") // アイコンを設定したボタン
.button("ボタン3", player => {
    // このボタンが押されたときに呼び出す関数を登録できます
})
.button("ボタン4", "textures/items/bread", player => {
    // アイコンと呼び出す関数の同時設定も可
})
.button("ボタン5", ["test_tag"]) // 名前以外でのボタンの識別方法として、'タグ'というものを設定できるようにしてあります
.onPush(button => button.tags.includes("test_tag"), event => {
    // "test_tag"のタグを持つボタンが押されたとき
})
.onCancel("UserClosed", event => {
    // UserClosedが原因でフォームが閉じられたとき
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.type.id !== "minecraft:stick") return;
    form.open(source);
});
```

書き途中ェ...
