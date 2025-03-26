import { world } from "@minecraft/server";
import { ActionFormWrapper, ModalFormWrapper, MessageFormWrapper, ServerFormElementPredicates } from "./UI-2.0";
import { sentry } from "./TypeSentry";

world.afterEvents.itemUse.subscribe(({ source, itemStack:{ type: { id } } }) => {
    if (id !== "minecraft:stick") return;

    const form = new ModalFormWrapper()
        .title("this is a title")
        .header({
            id: "test_header",
            text: "header da yoooon"
        })
        .divider({ id: "div" })
        .onCancel("UserBusy", e => e.reopen())
        .onCatch(e => console.error(e.error))
        .toggle({
            id: "test_toggle",
            label: "toggle label"
        })
        .slider({
            id: "test_slider",
            label: "label of slider",
            range: {
                min: 0,
                max: 10
            }
        })
        .dropdown({
            id: "test_dropdown",
            label: "label of dropdown",
            list: [
                {
                    id: "foo",
                    text: "foo da yoon"
                }
            ]
        })
        .submitButton({
            name: "submit!",
            on(event) {
                form.elements.getSubmitButton().name = "foo"
            }
        })
});
