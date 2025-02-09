/**
 * @author Takenoko-II
 * @copyright 2024/06/23
 */

import { NumberRange } from "@minecraft/common";

import { Player } from "@minecraft/server";

export class ServerFormError extends Error {
    readonly cause: unknown;
}

/**
 * フォームが閉じられる要因
 */
export enum ServerFormCancelationCause {
    /**
     * `UserBusy`, `UserClosed`のどちらも含む
     */
    Any = "Any",

    /**
     * プレイヤーがフォームを開くことができる状況下にないとき
     */
    UserBusy = "UserBusy",

    /**
     * プレイヤー自身がフォームを閉じたとき
     */
    UserClosed = "UserClosed"
}

export class ServerFormElementPredicates {
    /**
     * @param value
     * @returns `value`が`Button`であれば真
     */
    static isButton(value: unknown): value is Button;

    /**
     * @param value
     * @returns `value`が`ModalFormElement`であれば真
     */
    static isModalFormElement(value: unknown): value is ModalFormElement;

    /**
     * @param value
     * @returns `value`が`ModalFormToggle`であれば真
     */
    static isToggle(value: unknown): value is ModalFormToggle;

    /**
     * @param value
     * @returns `value`が`ModalFormSlider`であれば真
     */
    static isSlider(value: unknown): value is ModalFormSlider;

    /**
     * @param value
     * @returns `value`が`ModalFormTextField`であれば真
     */
    static isTextField(value: unknown): value is ModalFormTextField;

    /**
     * @param value
     * @returns `value`が`ModalFormDropdown`であれば真
     */
    static isDropdown(value: unknown): value is ModalFormDropdown;
}

/**
 * フォームを作成するためのクラスが継承するクラス
 */
export abstract class ServerFormWrapper<T extends ServerFormWrapper<T>> {
    /**
     * `ServerFormWrapper`のインスタンスを生成します。
     */
    protected constructor();

    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     * @returns `this`
     */
    public title(text: string): T;

    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    public onCancel(value: keyof typeof ServerFormCancelationCause, callbackFn: (event: ServerFormCancelEvent) => void): T;

    /**
     * フォームが例外を捕捉した際に呼び出されるコールバック関数を登録します。
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    public catch(callbackFn: (event: ServerFormCatchErrorEvent) => void): T;

    /**
     * フォームを表示します。
     * @param player プレイヤー
     */
    public open(player: Player): void;
}

/**
 * ボタンが操作の主軸となるフォームのクラスが実装するインターフェース
 */
export interface Pushable {
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onPush(predicate: (button: Button) => boolean, callbackFn: (player: ServerFormButtonPushEvent) => void): Pushable;
}

/**
 * 送信ボタンのあるフォームのクラスが実装するインターフェース
 */
export interface Submittable {
    /**
     * 送信ボタンの名前を設定します。
     * @param name ボタンの名前
     */
    submitButtonName(name: string): Submittable;

    /**
     * フォームの入力が送信された際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onSubmit(callbackFn: (arg: ModalFormSubmitEvent) => void): Submittable;
}

/**
 * フォームが閉じられたときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormCancelEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * 閉じた理由
     */
    readonly reason: ServerFormCancelationCause;

    /**
     * このフォームを再度開く
     */
    reopen(): void;
}

/**
 * フォームが例外を捕捉したときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormCatchErrorEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * エラー
     */
    readonly error: ServerFormError;
}

/**
 * フォームのボタンが押されたときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormButtonPushEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * ボタンの名前
     */
    readonly button: Button;
}

/**
 * フォームが送信されたときに発火するイベントのコールバックに渡される引数
 */
export interface ModalFormSubmitEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * 特定のIDのトグルを取得します。
     * @param id 要素のID
     */
    getToggleInput(id: string): boolean | undefined;

    /**
     * 特定のIDのスライダーを取得します。
     * @param id 要素のID
     */
    getSliderInput(id: string): number | undefined;

    /**
     * 特定のIDのドロップダウンを取得します。
     * @param id 要素のID
     */
    getDropdownInput(id: string): string | undefined;

    /**
     * 特定のIDのテキストフィールドを取得します。
     * @param id 要素のID
     */
    getTextFieldInput(id: string): string | undefined;

    /**
     * 入力された値を順にすべて返します。
     */
    getAllInputs(): (string | number | boolean)[];
}

/**
 * ボタンを表現する型
 */
export interface Button {
    /**
     * ボタンの名前
     */
    name: string;

    /**
     * ボタンのアイコンのテクスチャパス
     */
    iconPath?: string;

    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    readonly callbacks: Set<(player: Player) => void>

    /**
     * ボタンのタグ
     */
    readonly tags: string[];
}

/**
 * ボタンの入力用の型
 */
export interface ButtonInput {
    /**
     * ボタンの名前
     */
    name: string;

    /**
     * ボタンのアイコンのテクスチャパス
     */
    iconPath?: string;

    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    onPush?(event: ServerFormButtonPushEvent): void;

    /**
     * ボタンのタグ
     */
    tags?: string[];
}

/**
 * ModalFormの要素を表現する型
 */
export interface ModalFormElement {
    /**
     * 要素のID
     */
    readonly id: string;

    /**
     * ラベル
     */
    label: string;
}

/**
 * トグルを表現する型
 */
export interface ModalFormToggle extends ModalFormElement {
    /**
     * デフォルト値
     */
    defaultValue: boolean;
}

/**
 * スライダーを表現する型
 */
export interface ModalFormSlider extends ModalFormElement {
    /**
     * スライダーの数値の間隔
     */
    step: number;

    /**
     * スライダーの数値の範囲
     */
    readonly range: NumberRange;

    /**
     * デフォルト値
     */
    defaultValue: number;
}

/**
 * テキストフィールドを表現する型
 */
export interface ModalFormTextField extends ModalFormElement {    
    /**
     * テキストフィールドの入力欄が未入力状態のときに表示する文字列
     */
    placeHolder: string;

    /**
     * デフォルト値
     */
    defaultValue: string;
}

/**
 * ドロップダウンを表現する型
 */
export interface ModalFormDropdown extends ModalFormElement {
    /**
     * ドロップダウンのリスト
     */
    readonly list: string[];

    /**
     * デフォルト値のインデックス
     */
    defaultValueIndex: number;
}

/**
 * トグルの入力用の型
 */
export interface ModalFormToggleInput extends ModalFormToggle {
    /**
     * デフォルト値
     */
    defaultValue?: boolean;
}

/**
 * スライダーの入力用の型
 */
export interface ModalFormSliderInput extends ModalFormSlider {
    /**
     * スライダーの数値の間隔
     */
    step?: number;

    /**
     * デフォルト値
     */
    defaultValue?: number;
}

/**
 * テキストフィールドの入力用の型
 */
export interface ModalFormTextFieldInput extends ModalFormTextField {    
    /**
     * デフォルト値
     */
    override defaultValue?: string;
}

/**
 * ドロップダウンの入力用の型
 */
export interface ModalFormDropdownInput extends ModalFormDropdown {
    /**
     * デフォルト値のインデックス
     */
    override defaultValueIndex?: number;
}

/**
 * ボタンの定義情報
 */
export interface ActionFormButtonDefinitions {
    /**
     * 条件に一致するボタンを取得します。
     * @param predicate ボタンの条件
     */
    getByPredicate(predicate: (button: Button) => boolean): Button[] | undefined;
}

/**
 * ModalFormの要素の定義情報
 */
export interface ModalFormElementDefinitions {
    /**
     * 特定のIDのトグルを取得します。
     * @param id 要素のID
     */
    getToggle(id: string): ModalFormToggle | undefined;

    /**
     * 特定のIDのスライダーを取得します。
     * @param id 要素のID
     */
    getSlider(id: string): ModalFormSlider | undefined;

    /**
     * 特定のIDのドロップダウンを取得します。
     * @param id 要素のID
     */
    getDropdown(id: string): ModalFormDropdown | undefined;

    /**
     * 特定のIDのテキストフィールドを取得します。
     * @param id 要素のID
     */
    getTextField(id: string): ModalFormTextField | undefined;

    /**
     * 送信ボタンの名前を取得します。
     */
    getSubmitButtonName(): string | undefined;

    /**
     * 条件に一致する要素を取得します。
     * @param predicate 要素の条件
     */
    getByPredicate<T extends ModalFormElement>(predicate: (element: ModalFormElement) => element is T): T[] | undefined;
}

/**
 * ボタンの定義情報
 */
export interface MessageFormButtonDefinitions {
    /**
     * 条件に一致するボタンを取得します。
     * @param predicate ボタンの条件
     */
    getByPredicate(predicate: (button: Button) => boolean): Button | undefined;
}

/**
 * `ActionFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class ActionFormWrapper extends ServerFormWrapper<ActionFormWrapper> implements Pushable {
    /**
     * `ActionFormWrapper`のインスタンスを生成します。
     */
    public constructor();

    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    public body(...texts: string[]): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     */
    public button(name: string): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param iconPath ボタンのアイコンのテクスチャパス
     * @overload
     */
    public button(name: string, iconPath: string): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @overload
     */
    public button(name: string, callbackFn: (player: Player) => void): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param iconPath ボタンのアイコンのテクスチャパス
     * @param callbackFn コールバック関数
     * @overload
     */
    public button(name: string, iconPath: string, callbackFn: (player: Player) => void): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param tags ボタンのタグ
     * @overload
     */
    public button(name: string, tags: string[]): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param iconPath ボタンのアイコンのテクスチャパス
     * @param tags ボタンのタグ
     * @overload
     */
    public button(name: string, iconPath: string, tags: string[]): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @param tags ボタンのタグ
     * @overload
     */
    public button(name: string, callbackFn: (player: Player) => void, tags: string[]): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param iconPath ボタンのアイコンのテクスチャパス
     * @param callbackFn コールバック関数
     * @param tags ボタンのタグ
     * @overload
     */
    public button(name: string, iconPath: string, callbackFn: (player: Player) => void, tags: string[]): ActionFormWrapper;

    /**
     * フォームにボタンを追加します。
     * @param button ボタン
     * @overload
     */
    public button(button: ButtonInput): ActionFormWrapper;

    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     */
    public onPush(predicate: (button: Button) => void, callbackFn: (event: ServerFormButtonPushEvent) => void): ActionFormWrapper;

    /**
     * フォームのボタンの定義情報
     */
    public readonly buttons: ActionFormButtonDefinitions;
}

/**
 * `ModalFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class ModalFormWrapper extends ServerFormWrapper<ModalFormWrapper> implements Submittable {
    /**
     * `ModalFormWrapper`のインスタンスを生成します。
     */
    public constructor();

    /**
     * フォームにトグルを追加します。
     * @param id ID
     * @param label トグルのラベル
     * @param defaultValue デフォルト値
     */
    public toggle(id: string, label: string, defaultValue?: boolean): ModalFormWrapper;

    /**
     * フォームにトグルを追加します。
     * @param toggle トグル
     * @overload
     */
    public toggle(toggle: ModalFormToggleInput): ModalFormWrapper;

    /**
     * フォームにスライダーを追加します。
     * @param id ID
     * @param label スライダーのラベル
     * @param range スライダーの範囲
     * @param step スライダーの間隔
     * @param defaultValue デフォルト値
     */
    public slider(id: string, label: string, range: NumberRange, step?: number, defaultValue?: number): ModalFormWrapper;

    /**
     * フォームにスライダーを追加します。
     * @param slider スライダー
     * @overload
     */
    public slider(slider: ModalFormSliderInput): ModalFormWrapper;

    /**
     * フォームにドロップダウンを追加します。
     * @param id ID
     * @param label ドロップダウンのラベル
     * @param list ドロップダウンのリスト
     * @param defaultValueIndex デフォルトのインデックス
     */
    public dropdown(id: string, label: string, list: string[], defaultValueIndex?: number): ModalFormWrapper;

    /**
     * フォームにドロップダウンを追加します。
     * @param dropdown ドロップダウン
     * @overload
     */
    public dropdown(dropdown: ModalFormDropdownInput): ModalFormWrapper;

    /**
     * フォームにテキストフィールドを追加します。
     * @param id ID
     * @param label テキストフィールドのラベル
     * @param placeHolder テキストフィールドのプレイスホルダー
     * @param defaultValue デフォルト値
     */
    public textField(id: string, label: string, placeHolder: string, defaultValue?: string): ModalFormWrapper;

    /**
     * フォームにテキストフィールドを追加します。
     * @param textField テキストフィールド
     * @overload
     */
    public textField(textField: ModalFormTextFieldInput): ModalFormWrapper;

    /**
     * 送信ボタンの名前を設定します。
     * @param name ボタンの名前
     */
    public submitButtonName(name: string): ModalFormWrapper;

    /**
     * フォームの入力が送信された際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    public onSubmit(callbackFn: (event: ModalFormSubmitEvent) => void): ModalFormWrapper;

    /**
     * フォームの要素の定義情報
     */
    public readonly elements: ModalFormElementDefinitions;
}

/**
 * `MessageFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class MessageFormWrapper extends ServerFormWrapper<MessageFormWrapper> implements Pushable {
    /**
     * `MessageFormWrapper`のインスタンスを生成します。
     */
    public constructor();

    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    public body(...texts: string[]): MessageFormWrapper;

    /**
     * フォームにボタン1を追加します。
     * @param name ボタンの名前
     */
    public button1(name: string): MessageFormWrapper;

    /**
     * フォームにボタン1を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @overload
     */
    public button1(name: string, callbackFn: (player: Player) => void): MessageFormWrapper;

    /**
     * フォームにボタン1を追加します。
     * @param name ボタンの名前
     * @param tags ボタンのタグ
     * @overload
     */
    public button1(name: string, tags: string[]): MessageFormWrapper;

    /**
     * フォームにボタン1を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @param tags ボタンのタグ
     * @overload
     */
    public button1(name: string, callbackFn: (player: Player) => void, tags: string[]): MessageFormWrapper;

    /**
     * フォームにボタン1を追加します。
     * @param button1 ボタン1
     * @overload
     */
    public button1(button1: ButtonInput): MessageFormWrapper;

    /**
     * フォームにボタン2を追加します。
     * @param name ボタンの名前
     */
    public button2(name: string): MessageFormWrapper;

    /**
     * フォームにボタン2を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @overload
     */
    public button2(name: string, callbackFn: (player: Player) => void): MessageFormWrapper;

    /**
     * フォームにボタン2を追加します。
     * @param name ボタンの名前
     * @param tags ボタンのタグ
     * @overload
     */
    public button2(name: string, tags: string[]): MessageFormWrapper;

    /**
     * フォームにボタン2を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     * @param tags ボタンのタグ
     * @overload
     */
    public button2(name: string, callbackFn: (player: Player) => void, tags: string[]): MessageFormWrapper;

    /**
     * フォームにボタン2を追加します。
     * @param button2 ボタン2
     * @overload
     */
    public button2(button2: ButtonInput): MessageFormWrapper;

    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     */
    public onPush(predicate: (button: Button) => boolean, callbackFn: (event: ServerFormButtonPushEvent) => void): MessageFormWrapper;

    /**
     * フォームのボタンの定義情報
     */
    public readonly buttons: MessageFormButtonDefinitions;
}
