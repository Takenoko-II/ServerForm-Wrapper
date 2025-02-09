# ServerForm-Wrapper
`@minecraft/server-ui`が提供するフォーム作成用APIをより扱いやすいものにしたライブラリです。

## 導入
[Releases](https://github.com/Takenoko-II/ServerForm-Wrapper/releases/tag/v1.0.3)からダウンロードした.zipファイル内の`scripts/UI.js`と`scripts/UI.d.ts`をアドオンの`scripts`フォルダ内に入れて使用してください。
<br>双方を同一のフォルダ内に置くことを推奨します。

## 使用法

### manifest.json
`@minecraft/server-ui`の`1.2.0-beta`以上が必要になります。

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
.button("ボタン1") // ActionFormそのままに近い記法
.button("ボタン2", "textures/items/apple", player => {
    // このボタンが押されたときの処理
})
.button({ // こっちの書き方推奨
    name: "ボタン3",
    iconPath: "textures/items/bread", // 省略可
    tags: ["foo"], // 名前以外でのボタンの識別方法として、'タグ'というものを設定できるようにしてあります, 省略可
    on(player) { // 省略可
        // このボタンが押されたときの処理
    }
})
.onPush(button => button.tags.includes("foo"), event => { // なんでもボタンおされたとき発火します
    // "foo"のタグを持つボタンが押されたとき
    event.player.sendMessage(event.button.name); // ボタン3
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

import { ModalFormWrapper } from "./ServerForm-Wrapper";

const form = new ModalFormWrapper()
.title("フォームのタイトル")
.toggle({
    id: "toggle", // IDを設定して後からこれを使って取得できます
    label: "とぐる",
    defaultValue: false // 省略可
})
.slider({
    id: "slider",
    label: { text: "すらいだー" }, // rawtext可
    range: { min: 0, max: 100 },
    step: 1, // 省略可
    defaultValue: 0 // 省略可
})
.textField({
    id: "textField",
    label: "てきすとふぃーるど",
    placeHolder: { text: "ここに文字列を入力" }, // rawtext可
    defaultValue: "foo" // 省略可
})
.dropdown({
    id: "dropdown",
    label: "どろっぷだうん",
    list: [
        { id: "a", text: "えー" },
        { id: "b", text: "びー" },
        { id: "c", rawtext: [{ translate: "item.apple.name" }, { text: "っておいしいよね" }] } // rawtext可
    ],
    defaultValueIndex: 0 // 省略可
})
.toggle("toggle2", "とぐるその２", true) // ModalFormDataそのままに近い書き方も使えます
.submitButtonName("送信！！！！！")
.onSubmit(event => {
    // 送信ボタンを押したとき
    event.player.sendMessage(String(event.getToggleInput("toggle")));
    event.player.sendMessage(String(event.getSliderInput("slider")));
    event.player.sendMessage(event.getTextFieldInput("textField"));
    event.player.sendMessage(event.getDropdownInput("dropdown").value.id); // インデックスも配列中の値も返ります
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

import { MessageFormWrapper } from "./ServerForm-Wrapper";

const form = new MessageFormWrapper()
.title("フォームのタイトル")
.body("本文1行目", "2行目", "3行目...")
.button1("ボタン1", player => {
    // このボタンが押されたときの処理
}, ["bar"]) // 使いどころはさておき一応タグはここでも使えます
.button2({
    name: "ボタン2",
    on(player) {
        // このボタンが押されたときの処理
    }
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

### 自己参照
フォーム内の要素(ex: ボタン, スライダー, トグル)に関する情報を取得することができます。
```js
import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper, ServerFormElementPredicates } from "./UI";

const actionForm = new ActionFormWrapper()
.title("title")
.body("body")
.button("button1", "textures/items/apple", player => {
    const fooButtons = actionForm.buttons.getByPredicate(button => button.name.startsWith("foo")); // 名前が"foo"で始まるボタンをすべて取得
    player.sendMessage(fooButtons.length.toString()); // 2
})
.button("foobar")
.button("foobaz");

const modalForm = new ModalFormWrapper()
.title("title")
.slider({
    id: "hoge",
    label: "すらいだー1",
    range: { min: 0, max: 10 },
    step: 1,
    defaultValue: 5
})
.slider({
    id: "fuga",
    label: "すらいだー2",
    range: { min: 11, max: 20 },
    step: 1,
    defaultValue: 15
})
.onSubmit(event => {
    const sliderHoge = modalForm.elements.getSlider("hoge"); // idが"hoge"のスライダーに関する情報を取得
    const sliderFuga = modalForm.elements.getSlider("fuga"); // idが"fuga"のスライダーに関する情報を取得
    const hoge = event.getSlider("hoge"); // 入力された値
    const fuga = event.getSlider("fuga");

    event.player.sendMessage(`${sliderHoge.label}は${hoge}です`); // スライダーのラベルを取得
    event.player.sendMessage(`${sliderFuga.label}は${fuga}です`);
});

const messageForm = new MessageFormWrapper()
.title("title")
.body("body")
.button1("foo")
.button2("bar")
.onPush(() => true, event => {
    const anotherButton = messageForm.buttons.getByPredicate(button => button.name !== event.button.name);
    event.player.sendMessage(anotherButton.name); // 押されていないほうのボタンの名前を取得
});
```

### その他
`ServerFormElementPredicates`を使用して、取得した要素の種類を確かめることができます。
```js
import { ModalFormWrapper, ServerFormElementPredicates } from "@minecraft/server";

const form = new ModalFormWrapper()
.slider({
    id: "slider",
    label: "label",
    range: { min: 0, max: 100 },
    step: 1,
    defaultValue: 0
})
.textField({
    id: "textField",
    label: "label",
    placeHolder: "placeHolder",
    defaultValue: "default"
})
.onSubmit(event => {
    const textFields = form.elements.getByPredicate(ServerFormElementPredicates.isTextField); // テキストフィールド(の配列)型
});
```

オーバーロードなど詳細な情報については.d.tsを参照してください。

## 動作を確認したバージョン
- 1.21.50

## ライセンス
ServerForm-Wrapperは[MITライセンス](/LICENSE)のもとでリリースされています。

## 作成者
- [Twitter](https://twitter.com/Takenoko_4096)
- Discord: takenoko_4096 | たけのこII#1119
