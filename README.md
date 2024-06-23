# ServerForm-Wrapper
`@minecraft/server-ui`が提供するフォーム作成用APIをより扱いやすいものにしたライブラリです。

## 導入
[Releases]()からダウンロードした.zipファイル内の`scripts/ServerForm-Wrapper.js`と`scripts/ServerForm-Wrapper.d.ts`をアドオンの`scripts`フォルダ内に入れて使用してください。
<br>双方を同一のフォルダ内に置くことを推奨します。

## 使用法

### import
例:
```js
// パスはファイルを置いた場所に合わせてください
import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper } from "./ServerForm-Wrapper";
```

### ActionFormWrapper
`ActionFormData`によるフォーム作成をより直感的に書くことができます
```js
import { world } from "@minecraft/server";

import { ActionFormWrapper } from "./ServerForm-Wrapper";

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

import { ModalFormWrapper } from "./ServerForm-Wrapper";

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

import { MessageFormWrapper } from "./ServerForm-Wrapper";

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

### 自己参照
フォーム内の要素(ex: ボタン, スライダー, トグル)に関する情報を取得することができます。
```js
import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper, ServerFormElementPredicates } from "./ServerForm-Wrapper";

const actionForm = new ActionFormWrapper()
.title("title")
.body("body")
.button("button1", "textures/items/apple", player => {
    const fooButtons = actionForm.buttons.getByPredicate(button => button.name.startsWith("foo")); // 名前が"foo"で始まるボタンをすべて取得
    player.sendMessage(fooButtons.length.toString()); // 2
});
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
- 1.21.0

## ライセンス
ServerForm-Wrapperは[Mitライセンス](https://en.wikipedia.org/wiki/MIT_License)のもとでリリースされています。

## 作成者
- [GitHub](https://github.com/Takenoko-II)
- [Twitter](https://twitter.com/Takenoko_4096)
- Discord: takenoko_4096 | たけのこII#1119
