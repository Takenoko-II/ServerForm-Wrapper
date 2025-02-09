import { world } from "@minecraft/server";

import { ModalFormWrapper } from "./UI";

const modalForm = new ModalFormWrapper()
.title("title")
.toggle({
    id: "toggle",
    label: "label"
})
.slider({
    id: "slider",
    label: "label",
    range: { min: 0, max: 100 }
})
.textField({
    id: "textField",
    label: "label",
    placeHolder: "placeHolder"
})
.dropdown({
    id: "dropdown",
    label: "label",
    list: ["a", "b", "c"]
})
.onCancel("UserClosed", event => {
    event.reopen();
})
.submitButtonName("submit")
.onSubmit(event => {
    event.player.sendMessage(String(event.getToggleInput("toggle")));
    event.player.sendMessage(String(event.getSliderInput("slider")));
    event.player.sendMessage(event.getTextFieldInput("textField") ?? "");
    event.player.sendMessage(event.getDropdownInput("dropdown") ?? "");
});

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.type.id !== "minecraft:stick") return;
    
    modalForm.open(event.source);
});
