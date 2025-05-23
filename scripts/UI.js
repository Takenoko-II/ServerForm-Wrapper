/**
 * @author @Takenoko-II
 * @copyright 2024/06/23
 * 
 * 書いたのが古すぎて@ts-check走らせると真っ赤になっちゃうのでこのファイルの型チェック無視してあげてください...
 * .d.tsあるから許して
 */

import { Player, system } from "@minecraft/server";

import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

/**
 * @typedef {{readonly player: Player; readonly reason: ServerFormCancelationCause; reopen(): void;}} ServerFormCancelEvent
 * @typedef {{readonly player: Player; readonly error: ServerFormError;}} ServerFormCatchErrorEvent
 * @typedef {{readonly player: Player; readonly button: Button;}} ServerFormButtonPushEvent
 * @typedef {{readonly player: Player; getToggleInput(id: string): boolean | undefined; getSliderInput(id: string): number | undefined; getDropdownInput(id: string): string | undefined; getTextFieldInput(id: string): string | undefined; getAllInputs(): (string | number | boolean)[];}} ModalFormSubmitEvent
 * @typedef {{name: string | import("@minecraft/server").RawMessage; iconPath?: string; readonly callbacks: Set<(player: Player) => void>; readonly tags: string[];}} Button
 * @typedef {{readonly id: string; label: string | import("@minecraft/server").RawMessage;}} ModalFormElement
 * @typedef {{readonly id: string; label: string | import("@minecraft/server").RawMessage; defaultValue: boolean;}} ModalFormToggle
 * @typedef {{readonly id: string; label: string | import("@minecraft/server").RawMessage; readonly range: import("@minecraft/common").NumberRange; step: number; defaultValue: number;}} ModalFormSlider
 * @typedef {{readonly id: string; label: string | import("@minecraft/server").RawMessage; placeHolder: string | import("@minecraft/server").RawMessage; defaultValue: string;}} ModalFormTextField
 * @typedef {{readonly id: string; readonly text: string | import("@minecraft/server").RawMessage;}} DropdownOption
 * @typedef {{readonly id: string; label: string | import("@minecraft/server").RawMessage; readonly list: DropdownOption[]; defaultValueIndex: number;}} ModalFormDropdown
 * @typedef {{name: string | import("@minecraft/server").RawMessage; iconPath?: string; on?(player: Player): void; tags?: string[];}} ActionButtonInput
 * @typedef {{name: string | import("@minecraft/server").RawMessage; on?(player: Player): void; tags?: string[];}} MessageButtonInput
 * @typedef {{id: string; label: string | import("@minecraft/server").RawMessage; defaultValue?: boolean;}} ModalFormToggleInput
 * @typedef {{id: string; label: string | import("@minecraft/server").RawMessage; range: import("@minecraft/common").NumberRange; step?: number; defaultValue?: number;}} ModalFormSliderInput
 * @typedef {{id: string; label: string | import("@minecraft/server").RawMessage; placeHolder: string | import("@minecraft/server").RawMessage; defaultValue?: string;}} ModalFormTextFieldInput
 * @typedef {{id: string; label: string | import("@minecraft/server").RawMessage; list: DropdownOption[]; defaultValueIndex?: number;}} ModalFormDropdownInput
 */

/**
 * @param {unknown} value 
 * @returns {value is number}
 */
function isNumber(value) {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * @param {unknown} value 
 * @returns {value is string[]}
 */
function isStringArray(value) {
    if (!Array.isArray(value)) return false;
    
    return !value.some(_ => typeof _ !== "string");
}

/**
 * @param {unknown} value
 * @returns {value is DropdownOption[]}
 */
function isDropdownOptionArray(value) {
    if (!Array.isArray(value)) return false;

    return value.every(_ => {
        if (typeof _ === "object" && _ !== null) {
            return typeof _["id"] === "string"
                && (typeof _["text"] === "string" || (typeof _["text"] === "object" && _["text"] !== null))
        }
        else return false;
    });
}

export class ServerFormElementPredicates {
    /**
     * @param {unknown} value
     * @returns {value is Button}
     */
    static isButton(value) {
        if (value === undefined || value === null) return false;
        return typeof value["name"] === "string"
            && (typeof value["iconPath"] === "string" || value["iconPath"] === undefined)
            && value["callbacks"] instanceof Set
            && isStringArray(value["tags"])
    }

    /**
     * @param {unknown} value
     * @returns {value is ActionButtonInput}
     */
    static isActionButtonInput(value) {
        if (value === undefined || value === null) return false;
        return (typeof value["name"] === "string" || (typeof value["name"] === "object" && value !== null))
            && (typeof value["iconPath"] === "string" || value["iconPath"] === undefined)
            && (typeof value["onPush"] === "function" || value["onPush"] === undefined)
            && (isStringArray(value["tags"]) || value["tags"] === undefined)
    }

    /**
     * @param {unknown} value
     * @returns {value is MessageButtonInput}
     */
    static isMessageButtonInput(value) {
        if (value === undefined || value === null) return false;
        return (typeof value["name"] === "string" || (typeof value["name"] === "object" && value !== null))
            && (typeof value["onPush"] === "function" || value["onPush"] === undefined)
            && (isStringArray(value["tags"]) || value["tags"] === undefined)
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormElement}
     */
    static isModalFormElement(value) {
        if (value === undefined || value === null) return false;
        return typeof value["id"] === "string"
            && (typeof value["label"] === "string" || (typeof value["label"] === "object" && value !== null));
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormToggle}
     */
    static isToggle(value) {
        return this.isModalFormElement(value)
            && typeof value["defaultValue"] === "boolean";
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormSlider}
     */
    static isSlider(value) {
        return this.isModalFormElement(value)
            && isNumber(value["range"]?.min)
            && isNumber(value["range"]?.max)
            && isNumber(value["step"])
            && isNumber(value["defaultValue"]);
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormTextField}
     */
    static isTextField(value) {
        return this.isModalFormElement(value)
            && (typeof value["placeHolder"] === "string" || (typeof value["placeHolder"] === "object" && value !== null))
            && typeof value["defaultValue"] === "string";
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormDropdown}
     */
    static isDropdown(value) {
        return this.isModalFormElement(value)
            && isDropdownOptionArray(value["list"])
            && isNumber(value["defaultValueIndex"]);
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormToggleInput}
     */
    static isToggleInput(value) {
        return this.isModalFormElement(value)
            && (typeof value["defaultValue"] === "boolean" || value["defaultValue"] === undefined);
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormSliderInput}
     */
    static isSliderInput(value) {
        return this.isModalFormElement(value)
            && isNumber(value["range"]?.min)
            && isNumber(value["range"]?.max)
            && (isNumber(value["step"]) || value["step"] === undefined)
            && (isNumber(value["defaultValue"]) || value["defaultValue"] === undefined);
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormTextFieldInput}
     */
    static isTextFieldInput(value) {
        return this.isModalFormElement(value)
            && (typeof value["placeHolder"] === "string" || (typeof value["placeHolder"] === "object" && value !== null))
            && (typeof value["defaultValue"] === "string" || value["defaultValue"] === undefined);
    }

    /**
     * @param {unknown} value 
     * @returns {value is ModalFormDropdownInput}
     */
    static isDropdownInput(value) {
        return this.isModalFormElement(value)
            && isDropdownOptionArray(value["list"])
            && (isNumber(value["defaultValueIndex"]) || value["defaultValueIndex"] === undefined);
    }
}

/**
 * @param {object} object
 * @param {...string} keys
 * @returns {object}
 */
function freezeKey(object, ...keys) {
    if (typeof object !== "object" || object === null || !Array.isArray(keys)) {
        throw new TypeError("第一引数がオブジェクトでないか、残余引数が配列ではありません");
    }
    else if (keys.length === 0 || keys.some(_ => typeof _ !== "string")) {
        throw new TypeError("残余引数の配列の長さが0か、string[]ではありません");
    }

    for (const key of keys) {
        Object.defineProperty(object, key, { configurable: false, writable: false });
    }

    return object;
}

export class ServerFormWrapper {
    /**
     * @param {symbol} key 
     */
    constructor(key) {
        if (key !== ServerFormWrapper.PRIVATE_KEY) {
            throw new Error("このクラスのコンストラクタを外部から呼び出すことは原則禁止されています");
        }
    }

    /**
     * @type {string | import("@minecraft/server").RawMessage}
     */
    titleText;

    /**
     * @readonly
     */
    cancelationCallbacks = {
        /**
         * @type {Set<(event: ServerFormCancelEvent) => void>}
         * @readonly
         */
        "UserBusy": new Set(),
        /**
         * @type {Set<(event: ServerFormCancelEvent) => void>}
         * @readonly
         */
        "UserClosed": new Set(),
        /**
         * @type {Set<(event: ServerFormCancelEvent) => void>}
         * @readonly
         */
        "Any": new Set()
    };

    /**
     * @readonly
     * @type {Set<(event: ServerFormCatchErrorEvent) => void>}
     */
    catchers = new Set();

    /**
     * @param {string | import("@minecraft/server").RawMessage} text
     */
    title(text) {
        if (typeof text !== "string" && typeof text !== "object") {
            throw new TypeError("第一引数はstring | RawText型である必要があります");
        }

        this.titleText = text;

        return this;
    }

    /**
     * @param {string} value 
     * @param {(event: ServerFormCancelEvent) => void} callbackFn 
     */
    onCancel(value, callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("第二引数は関数である必要があります");
        }

        switch (value) {
            case "Any": {
                this.cancelationCallbacks.Any.add(callbackFn);
                break;
            }
            case "UserBusy": {
                this.cancelationCallbacks.UserBusy.add(callbackFn);
                break;
            }
            case "UserClosed": {
                this.cancelationCallbacks.UserClosed.add(callbackFn);
                break;
            }
            default: throw new TypeError("第一引数は列挙型'ServerFormCancelationCause'の値である必要があります");
        }

        return this;
    }

    /**
     * @param {(event: ServerFormCatchErrorEvent) => void} callbackFn
     */
    onCatch(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("第二引数は関数である必要があります");
        }

        this.catchers.add(callbackFn);

        return this;
    }

    /**
     * @param {void} _ 
     */
    open(_) {
        throw new Error("ServerFormWrapperクラスから直接open関数を使用することはできません");
    }

    /**
     * @readonly
     */
    static PRIVATE_KEY = Symbol("ServerFormWrapper");
}

export class ActionFormWrapper extends ServerFormWrapper {
    constructor() {
        super(ServerFormWrapper.PRIVATE_KEY);
    }

    /**
     * @readonly
     */
    #data = {
        /**
         * @type {string | import("@minecraft/server").RawMessage}
         */
        body: { text: "" },

        /**
         * @type {Button[]}
         * @readonly
         */
        buttons: [],

        /**
         * @type {Map<(button: Button) => boolean, (event: ServerFormButtonPushEvent) => void>}
         * @readonly
         */
        pushEventCallbacks: new Map()
    };

    /**
     * @param  {...(string | import("@minecraft/server").RawMessage)} text
     */
    body(...text) {
        if (!Array.isArray(text)) {
            throw new TypeError("引数が配列ではありません");
        }
        else if (text.length === 0 || text.some(_ => typeof _ !== "string" && typeof _ !== "object" && _ !== null)) {
            throw new TypeError("引数の配列の長さが0か、配列が(string | RawMessage)[]ではありません");
        }

        this.#data.body = {
            rawtext: text.map((_, i) => {
                const r = (typeof _ === "string") ? { text: _ } : _;

                if (i < text.length - 1) return {
                    rawtext: [
                        r,
                        { text: "\n" }
                    ]
                };
                else return r;
            })
        };

        return this;
    }

    button(x, a, b, c) {
        if (ServerFormElementPredicates.isActionButtonInput(x) && a === undefined && b === undefined && c === undefined) {
            /**
             * @type {Button}
             */
            const button = Object.defineProperties({}, {
                name: {
                    writable: true,
                    enumerable: true,
                    configurable: false,
                    value: x.name
                },
                iconPath: {
                    writable: true,
                    enumerable: true,
                    configurable: false,
                    value: x.iconPath
                },
                tags: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: x.tags ?? []
                },
                callbacks: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: new Set()
                }
            });

            if (typeof x.on === "function") {
                button.callbacks.add(x.on);
            }

            this.#data.buttons.push(button);
        }
        else if (typeof x === "string" || (typeof x === "object" && x !== null)) {
            /**
             * @type {Button}
             */
            const button = { name: x };

            Object.defineProperties(button, {
                tags: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: []
                },
                callbacks: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: new Set()
                }
            });

            this.#data.buttons.push(button);

            if ((typeof a === "string" || typeof a === "object") && b === undefined && c === undefined) {
                button.iconPath = a;
            }
            else if (typeof a === "function" && b === undefined && c === undefined) {
                button.callbacks.add(a);
            }
            else if ((typeof a === "string" || typeof a === "object") && typeof b === "function" && c === undefined) {
                button.iconPath = a;
                button.callbacks.add(b);
            }
            else if (isStringArray(a) && b === undefined && c === undefined) {
                button.tags.push(...a);
            }
            else if ((typeof a === "string" || typeof a === "object") && isStringArray(b) && c === undefined) {
                button.iconPath = a;
                button.tags.push(...b);
            }
            else if (typeof a === "function" && isStringArray(b) && c === undefined) {
                button.callbacks.add(a);
                button.tags.push(...b);
            }
            else if ((typeof a === "string" || typeof a === "object") && typeof b === "function" && isStringArray(c)) {
                button.iconPath = a;
                button.callbacks.add(b);
                button.tags.push(...c);
            }
            else if (!(a === undefined && b === undefined && c === undefined)) {
                console.warn(a, b, c);
                throw new TypeError("渡された引数の型が適切ではありません");
            }
        }
        else {
            throw new TypeError("この形式の関数呼び出しでは第一引数はstring | RawMessageである必要があります");
        }

        return this;
    }

    open(player) {
        if (!(player instanceof Player)) {
            throw new TypeError("プレイヤーじゃないやつにフォーム表示できるわけないやろ");
        }

        if (typeof this.titleText !== "string" && typeof this.titleText !== "object") {
            throw new TypeError("タイトル文字列として保存されている値がstring | RawMessageではありません: " + this.titleText);
        }

        const form = new ActionFormData()
        .title(this.titleText);

        if (this.#data.body !== undefined) {
            form.body(this.#data.body);
        }

        for (const button of this.#data.buttons) {
            form.button(button.name, button.iconPath);
        }

        const promise = form.show(player).then(response => {
            if (response.selection === undefined) {
                const that = this;
                const input = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };

                this.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(input);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }

                return;
            }

            const button = this.#data.buttons[response.selection];

            if (button.callbacks.size > 0) {
                button.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
            }

            this.#data.pushEventCallbacks.forEach((callbackFn, predicate) => {
                if (predicate(button)) {
                    callbackFn({ player, button });
                }
            });
        });

        if (this.catchers.size > 0) {
            promise.catch(error => {
                this.catchers.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }

    onPush(predicate, callbackFn) {
        if (typeof predicate !== "function") {
            throw new TypeError("第一引数は関数である必要があります");
        }
        if (typeof callbackFn !== "function") {
            throw new TypeError("第二引数は関数である必要があります");
        }

        this.#data.pushEventCallbacks.set(predicate, callbackFn);

        return this;
    }

    /**
     * @readonly
     */
    get buttons() {
        const that = this;

        return {
            getByPredicate(predicate) {
                if (typeof predicate !== "function") {
                    throw new TypeError("引数は関数である必要があります");
                }

                return that.#data.buttons.filter(predicate);
            }
        };
    }

    set buttons(_) {
        throw new TypeError("プロパティ 'buttons' は読み取り専用です");
    }
}

export class ModalFormWrapper extends ServerFormWrapper {
    constructor() {
        super(ServerFormWrapper.PRIVATE_KEY);
    }

    /**
     * @private
     * @readonly
     */
    #data = {
        /**
         * @type {(ModalFormToggle | ModalFormSlider | ModalFormTextField | ModalFormDropdown)[]}
         * @readonly
         */
        values: [],

        /**
         * @type {Set<(event: ModalFormSubmitEvent) => void>}
         * @readonly
         */
        submitEventCallbacks: new Set(),

        /**
         * @type {string | import("@minecraft/server").RawMessage}
         */
        submitButtonName: undefined
    };

    toggle(id, label, defaultValue = false) {
        if (ServerFormElementPredicates.isToggleInput(id) && label === undefined && defaultValue === false) {
            if (id.defaultValue === undefined) {
                id.defaultValue = defaultValue;
            }

            const obj = Object.assign({ type: "toggle" }, id);
            this.#data.values.push(freezeKey(obj, "id", "type"));
            return this;
        }

        if (typeof id !== "string") {
            throw new TypeError("この形式の関数呼び出しでは第一引数はstringである必要があります");
        }
        else if (typeof label !== "string" && typeof label !== "object") {
            throw new TypeError("この形式の関数呼び出しでは第二引数はstring | RawMessageである必要があります");
        }
        else if (typeof defaultValue !== "boolean") {
            throw new TypeError("この形式の関数呼び出しでは第三引数はbooleanである必要があります");
        }

        const toggle = { id, type: "toggle", label, defaultValue };

        this.#data.values.push(toggle);

        return this;
    }

    slider(id, label, range, step = 1, defaultValue = 0) {
        if (ServerFormElementPredicates.isSliderInput(id) && label === undefined && range === undefined && step === 1 && defaultValue === 0) {
            if (id.defaultValue === undefined) {
                id.defaultValue = defaultValue;
            }

            if (id.step === undefined) {
                id.step = step;
            }

            const obj = Object.assign({ type: "slider" }, id);
            this.#data.values.push(freezeKey(obj, "id", "type", "range"));
            return this;
        }

        if (typeof id !== "string") {
            throw new TypeError("この形式の関数呼び出しでは第一引数はstringである必要があります");
        }
        else if (typeof label !== "string" && typeof label !== "object") {
            throw new TypeError("この形式の関数呼び出しでは第二引数はstring | RawMessageである必要があります");
        }
        else if (!(typeof range === "object" && range !== null)) {
            throw new TypeError("この形式の関数呼び出しでは第三引数はオブジェクトである必要があります");
        }
        else if (!(isNumber(range.min) && isNumber(range.max))) {
            throw new TypeError("この形式の関数呼び出しでは第三引数はNumberRangeである必要がありますが、キーが非NaNのnumber型ではないか、存在しない可能性があります");
        }
        else if (!isNumber(step)) {
            throw new TypeError("この形式の関数呼び出しでは第四引数はNaNでないnumberである必要があります");
        }
        else if (!isNumber(defaultValue)) {
            throw new TypeError("この形式の関数呼び出しでは第五引数はNaNでないnumberである必要があります");
        }

        const slider = { id, type: "slider", label, range, step, defaultValue };

        this.#data.values.push(slider);

        return this;
    }

    dropdown(id, label, list, defaultValueIndex = 0) {
        if (ServerFormElementPredicates.isDropdownInput(id) && label === undefined && list === undefined && defaultValueIndex === 0) {
            if (id.defaultValueIndex === undefined) {
                id.defaultValueIndex = defaultValueIndex;
            }

            const obj = Object.assign({ type: "dropdown" }, id);
            this.#data.values.push(freezeKey(obj, "id", "list"));
            return this;
        }

        if (typeof id !== "string") {
            throw new TypeError("この形式の関数呼び出しでは第一引数はstringである必要があります");
        }
        else if (typeof label !== "string" && typeof label !== "object") {
            throw new TypeError("この形式の関数呼び出しでは第二引数はstring | RawMessageである必要があります");
        }
        else if (!Array.isArray(list)) {
            throw new TypeError("この形式の関数呼び出しでは第三引数は配列である必要があります");
        }
        else if (list.length === 0) {
            throw new TypeError("この形式の関数呼び出しでは第三引数の配列の長さは1以上である必要があります");
        }
        else if (list.some(_ => typeof _ !== "string" && typeof _ !== "object")) {
            throw new TypeError("この形式の関数呼び出しでは第三引数は(string | RawMessage)[]である必要があります");
        }
        else if (!isNumber(defaultValueIndex)) {
            throw new TypeError("この形式の関数呼び出しでは第四引数はNaNでないnumberである必要があります");
        }

        const dropdown = { id, type: "dropdown", label, list, defaultValueIndex };

        this.#data.values.push(dropdown);

        return this;
    }

    textField(id, label, placeHolder = "", defaultValue = "") {
        if (ServerFormElementPredicates.isTextFieldInput(id) && label === undefined && placeHolder === "" && defaultValue === "") {
            if (id.defaultValue === undefined) {
                id.defaultValue = defaultValue;
            }

            const obj = Object.assign({ type: "textField" }, id);
            this.#data.values.push(freezeKey(obj, "id"));
            return this;
        }

        if (typeof id !== "string") {
            throw new TypeError("この形式の関数呼び出しでは第一引数はstringである必要があります");
        }
        else if (typeof label !== "string" && typeof label !== "object" && label !== null) {
            throw new TypeError("この形式の関数呼び出しでは第二引数はstring | RawMessageである必要があります");
        }
        else if (typeof placeHolder !== "string" && typeof placeHolder !== "object" && placeHolder !== null) {
            throw new TypeError("この形式の関数呼び出しでは第三引数はstring | RawMessageである必要があります");
        }
        else if (typeof defaultValue !== "string") {
            throw new TypeError("この形式の関数呼び出しでは第四引数はstringである必要があります");
        }

        const textField = { id, type: "textField", label, placeHolder, defaultValue };

        this.#data.values.push(textField);

        return this;
    }

    submitButtonName(name) {
        if (typeof name !== "string" && typeof name !== "object" && name !== null) {
            throw new TypeError("引数がstring | RawMessageではありません");
        }

        this.#data.submitButtonName = name;

        return this;
    }

    onSubmit(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("引数は関数である必要があります");
        }

        this.#data.submitEventCallbacks.add(callbackFn);

        return this;
    }

    open(player) {
        if (!(player instanceof Player)) {
            throw new TypeError("引数はプレイヤーである必要があります");
        }

        if (typeof this.titleText !== "string" && typeof this.titleText !== "object") {
            throw new TypeError("タイトル文字列として保存されている値がstring | RawMessageではありません: " + this.titleText);
        }

        const form = new ModalFormData()
        .title(this.titleText);

        if (this.#data.submitButtonName !== undefined) {
            form.submitButton(this.#data.submitButtonName);
        }

        for (const value of this.#data.values) {
            switch (value.type) {
                case "toggle": {
                    form.toggle(value.label, value.defaultValue);
                    break;
                }
                case "slider": {
                    form.slider(value.label, value.range.min, value.range.max, value.step, value.defaultValue);
                    break;
                }
                case "dropdown": {
                    form.dropdown(value.label, value.list.map(_ => _.text), value.defaultValueIndex);
                    break;
                }
                case "textField": {
                    form.textField(value.label, value.placeHolder, value.defaultValue);
                    break;
                }
            }
        }

        const promise = form.show(player).then(response => {
            if (response.formValues === undefined) {
                const that = this;
                const input = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };

                this.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(input);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }

                return;
            }

            const that = this;

            /**
             * @param {string} id 
             * @returns {"toggle" | "slider" | "dropdown" | "textField" | undefined}
             */
            function type(id) {
                if (typeof id !== "string") {
                    throw new TypeError("引数はstringである必要があります");
                }

                const index = that.#data.values.findIndex(_ => _.id === id);
                if (index === -1) return undefined;

                return that.#data.values[index].type;
            }

            /**
             * @param {string} id 
             * @returns {string | number | boolean | undefined}
             */
            function value(id) {
                if (typeof id !== "string") {
                    throw new TypeError("引数はstringである必要があります");
                }

                const index = that.#data.values.findIndex(_ => _.id === id);
                if (index === -1) return undefined;

                const value = that.#data.values[index];

                return value.type === "dropdown" ? { index: response.formValues[index], value: value.list[response.formValues[index]] } : response.formValues[index];
            }

            const input = {
                getToggleInput(id) {
                    if (type(id) === "toggle") return value(id);
                },
                getSliderInput(id) {
                    if (type(id) === "slider") return value(id);
                },
                getDropdownInput(id) {
                    if (type(id) === "dropdown") return value(id);
                },
                getTextFieldInput(id) {
                    if (type(id) === "textField") return value(id);
                },
                getAllInputs() {
                    return response.formValues.map((formValue, index) => {
                        const value = that.#data.values[index];
                        return value.type === "dropdown" ? value.list[formValue] : formValue;
                    });
                }
            };

            this.#data.submitEventCallbacks.forEach(callbackFn => {
                callbackFn({ player, ...input });
            });
        });

        if (this.catchers.size > 0) {
            promise.catch(error => {
                this.catchers.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }

    /**
     * @readonly
     */
    get elements() {
        const that = this;

        function getElement(id) {    
            if (typeof id !== "string") {
                throw new TypeError("引数はstringである必要があります");
            }
    
            return that.#data.values.find(_ => _.id === id);
        }

        return {
            getToggle(id) {
                const element = getElement(id);

                return element.type === "toggle" ? element : undefined;
            },
            getSlider(id) {
                const element = getElement(id);

                return element.type === "slider" ? element : undefined;
            },
            getTextField(id) {
                const element = getElement(id);

                return element.type === "textField" ? element : undefined;
            },
            getDropdown(id) {
                const element = getElement(id);

                return element.type === "dropdown" ? element : undefined;
            },
            getSubmitButtonName() {
                return that.#data.submitButtonName;
            },
            getByPredicate(predicate) {
                if (typeof predicate !== "function") {
                    throw new TypeError("引数は関数である必要があります");
                }

                return that.#data.values.filter(predicate);
            }
        };
    }

    set elements(_) {
        throw new TypeError("プロパティ 'elements' は読み取り専用です");
    }
}

export class MessageFormWrapper extends ServerFormWrapper {
    constructor() {
        super(ServerFormWrapper.PRIVATE_KEY);

        Object.defineProperties(this.#data.button1, {
            tags: {
                writable: false,
                enumerable: true,
                configurable: false,
                value: []
            },
            callbacks: {
                writable: false,
                enumerable: true,
                configurable: false,
                value: new Set()
            }
        });

        Object.defineProperties(this.#data.button2, {
            tags: {
                writable: false,
                enumerable: true,
                configurable: false,
                value: []
            },
            callbacks: {
                writable: false,
                enumerable: true,
                configurable: false,
                value: new Set()
            }
        });
    }

    /**
     * @private
     * @readonly
     */
    #data = {
        /**
         * @type {string | import("@minecraft/server").RawMessage}
         */
        body: { text: "" },

        /**
         * @readonly
         * @type {Button}
         */
        button1: {
            /**
             * @type {string | import("@minecraft/server").RawMessage}
             * @readonly
             */
            name: "",

            /**
             * @type {Set<(player: Player) => void>}
             * @readonly
             */
            callbacks: new Set()
        },

        /**
         * @type {Button}
         * @readonly
         */
        button2: {
            /**
             * @type {string | import("@minecraft/server").RawMessage}
             * @readonly
             */
            name: "",

            /**
             * @type {Set<(player: Player) => void>}
             * @readonly
             */
            callbacks: new Set()
        },

        /**
         * @type {Map<(button: Button) => boolean, (event: ServerFormButtonPushEvent) => void>}
         * @readonly
         */
        pushEventCallbacks: new Map()
    };

    body(...text) {
        if (!Array.isArray(text)) {
            throw new TypeError("引数が配列ではありません");
        }
        else if (text.some(_ => typeof _ !== "string" && typeof _ !== "object")) {
            throw new TypeError("引数が(string | RawMessage)[]ではありません");
        }

        this.#data.body = {
            rawtext: text.map((_, i) => {
                const r = (typeof _ === "string") ? { text: _ } : _;

                if (i < text.length - 1) return {
                    rawtext: [
                        r,
                        { text: "\n" }
                    ]
                };
                else return r;
            })
        };

        return this;
    }

    button1(name, a, b) {
        if (ServerFormElementPredicates.isMessageButtonInput(name)) {
            this.#data.button1.name = name.name;

            if (typeof name.on === "function") {
                this.#data.button1.callbacks.add(name.on);
            }

            if (isStringArray(name.tags)) {
                this.#data.button1.tags.push(...name.tags);
            }
        }
        else if (typeof name === "string" || (typeof name === "object" && name !== null)) {
            this.#data.button1.name = name;

            if (typeof a === "function" && b === undefined) {
                this.#data.button1.callbacks.add(a);
            }
            else if (isStringArray(a) && b === undefined) {
                this.#data.button1.tags.push(...a);
            }
            else if (typeof a === "function" && isStringArray(b)) {
                this.#data.button1.callbacks.add(a);
                this.#data.button1.tags.push(...b);
            }
            else if (!(a === undefined && b === undefined)) throw new TypeError("渡された引数の型が適切ではありません");
        }
        else {
            throw new TypeError("第一引数はstring | RawMessage | ButtonInputである必要があります");
        }

        return this;
    }

    button2(name, a, b) {
        if (ServerFormElementPredicates.isMessageButtonInput(name)) {
            this.#data.button2.name = name.name;

            if (typeof name.on === "function") {
                this.#data.button2.callbacks.add(name.on);
            }

            if (isStringArray(name.tags)) {
                this.#data.button2.tags.push(...name.tags);
            }
        }
        else if (typeof name === "string" || (typeof name === "object" && name !== null)) {
            this.#data.button2.name = name;

            if (typeof a === "function" && b === undefined) {
                this.#data.button2.callbacks.add(a);
            }
            else if (isStringArray(a) && b === undefined) {
                this.#data.button2.tags.push(...a);
            }
            else if (typeof a === "function" && isStringArray(b)) {
                this.#data.button2.callbacks.add(a);
                this.#data.button2.tags.push(...b);
            }
            else if (!(a === undefined && b === undefined)) throw new TypeError("渡された引数の型が適切ではありません");
        }
        else {
            throw new TypeError("第一引数はstring | RawMessage | ButtonInputである必要があります");
        }

        return this;
    }

    open(player) {
        if (!(player instanceof Player)) {
            throw new TypeError("引数はプレイヤーである必要があります");
        }

        if (typeof this.titleText !== "string" && typeof this.titleText !== "object") {
            throw new TypeError("タイトル文字列として保存されている値がstring | RawMessageではありません: " + this.titleText);
        }

        const form = new MessageFormData()
        .title(this.titleText);

        if (this.#data.body !== undefined) {
            form.body(this.#data.body);
        }

        form.button1(this.#data.button1.name);
        form.button2(this.#data.button2.name);

        const promise = form.show(player).then(response => {
            if (response.selection === undefined) {
                const that = this;
                const input = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };

                this.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(input);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(input);
                    });
                }

                return;
            }

            if (response.selection === 0) {
                this.#data.button1.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });

                this.#data.pushEventCallbacks.forEach((callbackFn, predicate) => {
                    if (predicate(this.#data.button1)) {
                        callbackFn({ button: this.#data.button1, player });
                    }
                });
            }
            else {
                this.#data.button2.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });

                this.#data.pushEventCallbacks.forEach((callbackFn, predicate) => {
                    if (predicate(this.#data.button2)) {
                        callbackFn({ button: this.#data.button2, player });
                    }
                });
            }
        });

        if (this.catchers.size > 0) {
            promise.catch(error => {
                this.catchers.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }

    onPush(predicate, callbackFn) {
        if (typeof predicate !== "function") {
            throw new TypeError("第一引数は関数である必要があります");
        }
        else if (typeof callbackFn !== "function") {
            throw new TypeError("第二引数は関数である必要があります");
        }

        this.#data.pushEventCallbacks.set(predicate, callbackFn);

        return this;
    }

    /**
     * @readonly
     */
    get buttons() {
        const that = this;

        return {
            getByPredicate(predicate) {
                if (typeof predicate !== "function") {
                    throw new TypeError("引数は関数である必要があります");
                }

                return [that.#data.button1, that.#data.button2].find(predicate);
            }
        };
    }

    set buttons(_) {
        throw new TypeError("プロパティ 'buttons' は読み取り専用です");
    }
}

export const ServerFormCancelationCause = Object.defineProperties({}, {
    Any: {
        writable: false,
        configurable: false,
        enumerable: true,
        value:  "Any"
    },
    UserBusy: {
        writable: false,
        configurable: false,
        enumerable: true,
        value: "UserBusy"
    },
    UserClosed: {
        writable: false,
        configurable: false,
        enumerable: true,
        value: "UserClosed"
    }
});

export class ServerFormError extends Error {
    /**
     * @readonly
     * @type {unknown}
     */
    cause;

    /**
     * @param {unknown} cause 
     */
    constructor(cause) {
        super("Unhandled Promise Rejection", { cause });
        this.cause = cause;
    }
}
