import { world } from "@minecraft/server";

import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper } from "./UI";

const modalForm = new ModalFormWrapper()
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
})
.submitButtonName("submit")
.onSubmit(event => {
    event.player.sendMessage(String(event.getToggle("toggle")));
    event.player.sendMessage(String(event.getSlider("slider")));
    event.player.sendMessage(event.getTextField("textField"));
    event.player.sendMessage(event.getDropdown("dropdown"));
});

const messageForm = new MessageFormWrapper()
.title("titleText")
.body("1", "2", "3")
.button1("1")
.button2("2")
.onPush(() => true, event => {
    event.player.sendMessage(event.button.name);
})
.onCancel("Any", event => {
    event.reopen();
});

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.type.id !== "minecraft:stick") return;
    
    messageForm.open(event.source);
});
