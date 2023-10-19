"use strict";

const Config = require('../config');

module.exports = class Telegram {
    _token;

    static instance =  new Telegram(Config.bot.token);

    constructor(token) {
        this._token = token;
    }

    /**
     * Return url to telegram api, optionally with parameters added
     */
    apiUrl2(methodName) {
        let botUrl = `https://api.telegram.org/bot${this._token}/${methodName}`;

        return botUrl;
    }

    apiUrl(methodName, params = null) {
        let botUrl = `https://api.telegram.org/bot${this._token}/${methodName}`;
        let query = ''

        if (params) {
            query = '?' + new URLSearchParams(params).toString()
        }

        return `${botUrl}${query}`
    }

    /**
     * Send plain text message
     * https://core.telegram.org/bots/api#sendmessage
     */
    async sendPlainText(chatId, text) {
        return (await fetch(this.apiUrl('sendMessage', {
            chat_id: chatId,
            text
        }))).json()
    }

    /**
     * Send a message with a single button
     * `button` must be an button-object like `{ text: 'Button', callback_data: 'data'}`
     * https://core.telegram.org/bots/api#sendmessage
     */
    async sendInlineButton(chatId, text, button) {
        return this.sendInlineButtonRow(chatId, text, [button])
    }

    /**
     * Send a message with buttons, `buttonRow` must be an array of button objects
     * https://core.telegram.org/bots/api#sendmessage
     */
    async sendInlineButtonRow(chatId, text, buttonRow, options = {}) {
        return this.sendInlineButtons(chatId, text, buttonRow, options)
    }

    /**
     * Send a message with buttons, `buttons` must be an array of arrays of button objects
     * https://core.telegram.org/bots/api#sendmessage
     */
    async sendInlineButtons(chatId, text, buttons, options = {}) {
        let method = options.method || 'sendMessage';
        let messageId = options.messageId;

        let params = {
            chat_id: chatId,
            reply_markup: {inline_keyboard: buttons}
        };

        if (text) {
            params.text = text
        }

        if (messageId) {
            params.message_id = messageId
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(params)
        };

        // console.log(`before reuest: ${JSON.stringify(requestOptions)}`);
        let botUrl = this.apiUrl2(method);
        return fetch(botUrl, requestOptions)
    }

    /**
     * Answer callback query (inline button press)
     * This stops the loading indicator on the button and optionally shows a message
     * https://core.telegram.org/bots/api#answercallbackquery
     */
    async answerCallbackQuery(callbackQueryId, text = null) {
        const data = {
            callback_query_id: callbackQueryId
        }
        if (text) {
            data.text = text
        }
        return (await fetch(this.apiUrl('answerCallbackQuery', data))).json()
    }

    async sendToAdmin(text, buttonRow = [], options = {}) {
        return this.sendInlineButtonRow(Config.bot.adminId, text, buttonRow, options)
    }

    async log(text, options = {}) {
        text = `log: ${text}`;

        //TODO: change adminId, have no idea
        return this.sendToAdmin(text, [], {})
    }
}
