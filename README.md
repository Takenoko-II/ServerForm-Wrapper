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
`ActionFormData`によるフォーム作成をより直感的に書くことができます
```js
import { world } from "@minecraft/server";

import { ActionFormWrapper } from "./UI";

const form = new ActionFormWrapper()
.title("フォームのタイトル")
.body("本文1行目", "2行目", "3行目...")
.button("ボタン1")
.button("ボタン2", "textures/items/apple")
.button("ボタン3", player => {
    // このボタンが押されたときの処理
})
.button("ボタン4", "textures/items/bread", player => {
    // このボタンが押されたときの処理
})
.button("ボタン5", ["foo"]) // 名前以外でのボタンの識別方法として、'タグ'というものを設定できるようにしてあります
.onPush(button => button.tags.includes("foo"), event => {
    // "foo"のタグを持つボタンが押されたとき
    event.player.sendMessage(event.button.name);
})
.onCancel("UserClosed", event => {
    // UserClosedが原因でフォームが閉じられたとき
    event.reopen();
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.type.id !== "minecraft:stick") return;
    form.open(source);
});
```

### ModalFromWrapper
`ModalFormData`によるフォーム作成をより直感的に書くことができます
```js
import { world } from "@minecraft/server";

import { ModalFormWrapper } from "./UI";

const form = new ModalFormWrapper()
.title("フォームのタイトル")
.toggle({
    id: "toggle", // IDを設定して後からこれを使って取得できます
    label: "とぐる",
    defaultValue: false
})
.slider({
    id: "slider",
    label: "すらいだー",
    range: { min: 0, max: 100 },
    step: 1,
    defaultValue: 0
})
.textField({
    id: "textField",
    label: "てきすとふぃーるど",
    placeHolder: "ここに文字列を入力",
    defaultValue: "foo"
})
.dropdown({
    id: "dropdown",
    label: "どろっぷだうん",
    list: ["a", "b", "c"],
    defaultValueIndex: 0
})
.toggle("toggle2", "とぐるその２", true) // ModalFormDataそのままに近い書き方も使えます
.submitButtonName("送信！！！！！")
.onSubmit(event => {
    // 送信ボタンを押したとき
    event.player.sendMessage(String(event.getToggle("toggle")));
    event.player.sendMessage(String(event.getSlider("slider")));
    event.player.sendMessage(event.getTextField("textField"));
    event.player.sendMessage(event.getDropdown("dropdown")); // インデックスではなく文字列が返ります
})
.onCancel("UserClosed", event => {
    event.reopen();
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.type.id !== "minecraft:stick") return;
    form.open(source);
});
```

### MessageFormWrapper
`MessageFormData`によるフォーム作成をより直感的に書くことができます
```js
import { world } from "@minecraft/server";

import { MessageFormWrapper } from "./UI";

const form = new MessageFormWrapper()
.title("フォームのタイトル")
.body("本文1行目", "2行目", "3行目...")
.button1("ボタン1", player => {
    // このボタンが押されたときの処理
}, ["bar"]) // 使いどころはさておき一応タグはここでも使えます
.button2("ボタン2", player => {
    // このボタンが押されたときの処理
})
.onPush(button => button.tags.includes("bar"), event => {
    // "bar"のタグを持つボタンが押されたとき
    event.player.sendMessage(event.button.name);
})
.onCancel("Any", event => {
    // 原因関係なくフォームが閉じられたとき
    event.reopen();
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.type.id !== "minecraft:stick") return;
    form.open(source);
});
```

### 自己参照機能
