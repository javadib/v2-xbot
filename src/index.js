"use strict";

Date.prototype.toUnixTIme = function () {
    return Math.floor(this / 1000);
}


const Config = require('./config');
const Plan = require('./models/plan');
const Server = require('./models/server');
const Order = require('./models/order');
const Payment = require('./models/payment');
const admin = require("./models/admin");

const wKV = require('./modules/wkv');
const wkv = new wKV(db);

const Hiddify = require("./modules/hiddify");

const TOKEN = Config.bot.token
const WEBHOOK = Config.bot.webHook
const SECRET = Config.bot.secret


/**
 * Wait for requests to the worker
 */
addEventListener('fetch', async event => {
    const url = new URL(event.request.url);

    switch (url.pathname) {
        case WEBHOOK:
            event.respondWith(handleWebhook(event))
            break;
        case '/registerWebhook':
            event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
            break;
        case '/unRegisterWebhook':
            event.respondWith(unRegisterWebhook(event))
            break;
        default:
            event.respondWith(new Response('No handler for this request'))
            break;
    }
})

/**
 * Handle requests to WEBHOOK
 * https://core.telegram.org/bots/api#update
 */
async function handleWebhook(event) {
    // Check secret
    if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
        return new Response('Unauthorized', {status: 403})
    }

    // Read request body synchronously
    const update = await event.request.json()

    // Deal with response asynchronously
    event.waitUntil(onUpdate(update))

    return new Response('Ok')
}

/**
 * Handle incoming Update
 * supports messages and callback queries (inline button presses)
 * https://core.telegram.org/bots/api#update
 */
async function onUpdate(update) {
    if ('message' in update) {
        await onMessage(update.message, {update})
    }

    if ('callback_query' in update) {
        let message = update.callback_query.message;
        message.text = update.callback_query.data;

        await onMessage(message, {update})
        // await onCallbackQuery(update.callback_query)
    }
}

/**
 * Set webhook to this worker's url
 * https://core.telegram.org/bots/api#setwebhook
 */
async function registerWebhook(event, requestUrl, suffix, secret) {
    // https://core.telegram.org/bots/api#setwebhook
    const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
    const r = await (await fetch(apiUrl('setWebhook', {url: webhookUrl, secret_token: secret}))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Remove webhook
 * https://core.telegram.org/bots/api#setwebhook
 */
async function unRegisterWebhook(event) {
    const r = await (await fetch(apiUrl('setWebhook', {url: ''}))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Return url to telegram api, optionally with parameters added
 */
function apiUrl2(methodName) {
    let botUrl = `https://api.telegram.org/bot${TOKEN}/${methodName}`;

    return botUrl;
}

function apiUrl(methodName, params = null) {
    let botUrl = `https://api.telegram.org/bot${TOKEN}/${methodName}`;
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
async function sendPlainText(chatId, text) {
    return (await fetch(apiUrl('sendMessage', {
        chat_id: chatId,
        text
    }))).json()
}

/**
 * Send text message formatted with MarkdownV2-style
 * Keep in mind that any markdown characters _*[]()~`>#+-=|{}.! that
 * are not part of your formatting must be escaped. Incorrectly escaped
 * messages will not be sent. See escapeMarkdown()
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendMarkdownV2Text(chatId, text) {
    return (await fetch(apiUrl('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2'
    }))).json()
}

/**
 * Escape string for use in MarkdownV2-style text
 * if `except` is provided, it should be a string of characters to not escape
 * https://core.telegram.org/bots/api#markdownv2-style
 */
function escapeMarkdown(str, except = '') {
    const all = '_*[]()~`>#+-=|{}.!\\'.split('').filter(c => !except.includes(c))
    const regExSpecial = '^$*+?.()|{}[]\\'
    const regEx = new RegExp('[' + all.map(c => (regExSpecial.includes(c) ? '\\' + c : c)).join('') + ']', 'gim')
    return str.replace(regEx, '\\$&')
}

/**
 * Send a message with a single button
 * `button` must be an button-object like `{ text: 'Button', callback_data: 'data'}`
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendInlineButton(chatId, text, button) {
    return sendInlineButtonRow(chatId, text, [button])
}

/**
 * Send a message with buttons, `buttonRow` must be an array of button objects
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendInlineButtonRow(chatId, text, buttonRow, options = {}) {
    return sendInlineButtons(chatId, text, buttonRow, options)
}

/**
 * Send a message with buttons, `buttons` must be an array of arrays of button objects
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendInlineButtons(chatId, text, buttons, options = {}) {
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
    let botUrl = apiUrl2(method);
    return fetch(botUrl, requestOptions)
}

/**
 * Answer callback query (inline button press)
 * This stops the loading indicator on the button and optionally shows a message
 * https://core.telegram.org/bots/api#answercallbackquery
 */
async function answerCallbackQuery(callbackQueryId, text = null) {
    const data = {
        callback_query_id: callbackQueryId
    }
    if (text) {
        data.text = text
    }
    return (await fetch(apiUrl('answerCallbackQuery', data))).json()
}

/**
 * Handle incoming callback_query (inline button press)
 * https://core.telegram.org/bots/api#message
 */
async function onCallbackQuery(callbackQuery) {
    await sendMarkdownV2Text(callbackQuery.message.chat.id, escapeMarkdown(`You pressed the button with data=\`${callbackQuery.data}\``, '`'))
    return answerCallbackQuery(callbackQuery.id, 'Button press acknowledged!')
}


/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
async function onMessage(message, options = {}) {
    let id = message.chat.id;
    try {
        let usrSession = JSON.parse(await db.get(id)) || {};
        let values = message.text.split(';');

        switch (values[0].toLowerCase()) {
            case Config.commands.silentButton.toLowerCase():
                return await Promise.resolve();
            case "/start".toLowerCase():
            case "/help".toLowerCase():
                return await sendStartMessage(message);
            case Server.seed.cmd.toLowerCase():
                return await sendServers(message);
            case Plan.seed.cmd.toLowerCase():
                if (values[1]) {
                    let server = {[Server.seed.cmd]: values[1]};
                    usrSession = await wkv.update(id, server);
                }

                return await sendPlans(message);
            case Payment.seed.cmd.toLowerCase():
                if (values[1]) {
                    let plan = {[Plan.seed.cmd]: values[1]};
                    usrSession = await wkv.update(id, plan)
                }

                return await sendPayments(message, "show_invoice");
            case "show_invoice".toLowerCase():
                if (values[1]) {
                    let payment = {[Payment.seed.cmd]: values[1]};
                    usrSession = await wkv.update(id, payment);
                }

                return await sendInvoice(message, usrSession, "show_invoice");
            case "confirm_order".toLowerCase():
                //TODO: admin ACL
                return await confirmOrder(message, usrSession);
            case "reject_order".toLowerCase():
                //TODO: admin ACL check
                return await rejectOrder(message, usrSession, options)
            // case Config.commands.updateNewOrderButtons.toLowerCase():
            //     return await updateNewOrderButtons(message);
            case "status_link".toLowerCase():
                return await sendStartMessage(message);
        }

        let result = usrSession.isLast === true ? await saveOrder(message, usrSession) : await sendStartMessage(message);

        // await sendInlineButtonRow(message.chat.id, `userSession values: ${JSON.stringify(usrSession)}`, [])


        return result;

    } catch (e) {
        let text = e?.stack || e?.message || JSON.stringify(e);
        await sendInlineButtonRow(id, text, [])
    }
}

function sendStartMessage(message) {
    return sendInlineButtonRow(message.chat.id, Config.bot.welcomeMessage, [
        [{text: 'خرید اشتراک', callback_data: 'select_server'}],
        // [{text: 'وضعیت اشتراک', callback_data: 'status_link'}]
    ])
}

function sendHelpMessage(message) {
    let chatId = message.chat.id;
    let text = 'شت! چیزی پیدا نشد :|'

    return sendInlineButtonRow(chatId, text, [
        [{text: 'خرید اشتراک', callback_data: 'select_server'}],
        [{
            text: 'وضعیت اشتراک',
            callback_data: 'status_link'
        }]
    ])
}

function sendServers(message) {
    let chatId = message.chat.id;
    let text = 'یک لوکیشین برای اتصال، انتخاب کیند ';
    let data = Server.getButtons(Plan.seed.cmd);

    return sendInlineButtonRow(chatId, text, data, {method: 'editMessageText', messageId: message.message_id})
}

function sendPlans(message) {
    let chatId = message.chat.id;
    let text = 'یکی از پلن های زیرو انتخاب کیند';

    let buttons = Plan.getButtons(Payment.seed.cmd);


    return sendInlineButtonRow(chatId, text, buttons, {method: 'editMessageText', messageId: message.message_id})
}

async function editButtons(message, buttons = []) {
    return await sendInlineButtonRow(message.chat_id || message.chat.id, undefined, buttons, {
        method: 'editMessageReplyMarkup',
        messageId: message.message_id
    });
}

async function confirmOrder(message) {
    let values = message.text.split(';');
    let orderId = values[1];

    if (!orderId) {
        let text = `سفارشی برای پردازش پیدا نشد!`;
        return await sendInlineButtonRow(Config.bot.adminId, text, [])
    }

    let {model, userChatId, unixTime} = Order.parseId(orderId);

    let order = JSON.parse(await db.get(orderId)) || {};
    let sPlan = Plan.findById(order[Plan.seed.cmd])?.model;
    let sServer = Server.findById(order[Server.seed.cmd])?.model;

    let opt = {}
    if (order.invoiceMessageId) {
        opt = {method: 'editMessageText', messageId: order.invoiceMessageId};
    }

    let hiddify = new Hiddify();
    let res = await hiddify.createAccount(sPlan, sServer, orderId);
    let data = await res.json();

    let accountText = admin.newAccountText(sPlan, data.userUrl, Config)
    let response = await sendInlineButtonRow(userChatId, accountText, [
        [{text: "🏡 صفحه اصلی", callback_data: "/start"}]
    ], opt);


    await editButtons(message, [
        [{text: "سفارش ارسال شده!", callback_data: Config.commands.silentButton}]
    ])

    return response
}


async function rejectOrder(message) {
    let values = message.text.split(';');

    if (values.length < 2) {
        return await sendInlineButtonRow(Config.bot.adminId, `یوزر برای ارسال پیام پیدا نشد!`, [])
    }

    let opt = {}
    let orderId = values[1];
    let {model, userChatId, unixTime} = Order.parseId(orderId);

    let order = JSON.parse(await db.get(orderId)) || {};
    if (order.invoiceMessageId) {
        opt = {method: 'editMessageText', messageId: order.invoiceMessageId};
    }

    await wkv.update(orderId, {rejected: true});

    let text = `سفارش شما رد شد. لطفا با پشتیبانی تماس بگیرید`;
    let response = await sendInlineButtonRow(Number(userChatId), text, [
        [
            {text: "✨  شروع مجدد", callback_data: "/start"}
        ]
    ], opt);

    await editButtons(message, [
        [{text: "سفارش رد شده!", callback_data: Config.commands.silentButton}],
        // [{text: "↩️ بازنگری", callback_data: `${Config.commands.updateNewOrderButtons};${userChatId}`}],
    ])

    return response
}

async function sendOrderToAdmin(message, session, orderId) {
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;
    let msg = Order.adminNewOrder(message.chat, sPlan, sPayment, message);

    let buttons = admin.getNewOrderButtons(orderId);

    return await sendInlineButtonRow(Config.bot.adminId, msg, buttons)
}

async function saveOrder(message, session, sendToAdmin = true, deleteSession = true) {
    let chatId = message.chat.id || message.chat_id;

    //Send msg to user
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;
    let msg = Order.savedOrderText(sPlan, sPayment);
    let sentUserOrderRes = await sendInlineButtonRow(chatId, msg, [
        // [{text: "پیگیری", callback_data: "send_message"}]
    ]);

    let data = await sentUserOrderRes.json() || {};
    let newOrder = Object.assign({}, session, {
        userId: chatId,
        invoiceMessageId: data.result?.message_id,
        payProofText: message.text
    })

    let orderId = Order.getId(chatId);
    await wkv.put(orderId, newOrder)


    if (deleteSession) {
        await wkv.delete(chatId)
    }

    if (sendToAdmin) {
        await sendOrderToAdmin(message, session, orderId)
    }
    return sentUserOrderRes
}

async function sendInvoice(message, session, nextCmd) {
    let chatId = message.chat.id;
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;

    let msg = Order.reviewInvoice(sPlan, sPayment);

    await wkv.update(chatId, {lastCmd: "show_invoice", isLast: true});

    return await sendInlineButtonRow(chatId, msg, [
        // [{text: '❗️ لغو خرید', callback_data: '/start'}],
        [{text: "برگشت ↩️", callback_data: Payment.seed.cmd}]
    ], {method: 'editMessageText', messageId: message.message_id})
}

function sendPayments(message, nextCmd) {
    let chatId = message.chat.id;
    let text = 'یک روش پر داخت رو انتخاب کنید';

    let buttons = Payment.getButtons(nextCmd)

    return sendInlineButtonRow(chatId, text, buttons, {method: 'editMessageText', messageId: message.message_id})
}



