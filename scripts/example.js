import { world } from "@minecraft/server";

import { ActionFormWrapper, MessageFormWrapper, ModalFormWrapper, ServerFormElementPredicates } from "./UI";

const form = new ModalFormWrapper()
.title("title")
.toggle({
    id: "toggle",
    label: "label",
    defaultValue: false
})
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
.dropdown({
    id: "dropdown",
    label: "label",
    list: ["a", "b", "c"],
    defaultValueIndex: 0
})
.onCancel("UserClosed", event => {
    event.reopen();
    event.player.sendMessage(form.elements.getSlider("slider").label);
})
.submitButtonName("submit")
.onSubmit(event => {
    event.player.sendMessage(String(event.getToggle("toggle")));
    event.player.sendMessage(String(event.getSlider("slider")));
    event.player.sendMessage(event.getTextField("textField"));
    event.player.sendMessage(event.getDropdown("dropdown"));
    event.player.sendMessage(String(event.getAll()));
});

const mes = new MessageFormWrapper()
.title("titleText")
.body("1", "2", "3")
.button1("1", ["tag"])
.button2("2", ["tag"])
.onPush(b => b.tags.includes("tag"), e => {
    e.player.sendMessage(e.button.name);
})
.onCancel("Any", e => {
    e.reopen();
    mes.buttons.getByPredicate(b => b.name.startsWith("1")).name += "1";
});

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.type.id !== "minecraft:stick") return;
    
    mes.open(event.source);
});
