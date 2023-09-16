"use strict";

const Config = require('./config');
const Plan = require('./models/plan');
const Server = require('./models/server');
const Order = require('./models/order');
const Payment = require('./models/payment');
const wkv = require('./wkv');
const admin = require("./models/admin");

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

    console.log(`options: ${JSON.stringify(options)}`);


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

function transform(template, model) {
    return new Function('return `' + template + '`;').call(model);
}

/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
async function onMessage(message, options = {}) {
    try {
        let usrSession = JSON.parse(await db.get(message.chat.id));
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
                    await wkv.update(db, message.chat.id, server);
                }

                return await sendPlans(message);
            case Payment.seed.cmd.toLowerCase():
                if (values[1]) {
                    let plan = {[Plan.seed.cmd]: values[1]};
                    await wkv.update(db, message.chat.id, plan)
                }

                return await sendPayments(message, "show_invoice");
            case "show_invoice".toLowerCase():
                if (values[1]) {
                    let payment = {[Payment.seed.cmd]: values[1].toString()};
                    await wkv.update(db, message.chat.id, payment);
                }

                // await sendInlineButtonRow(message.chat.id, `userSession values: ${JSON.stringify(usrSession)}`, [])
                let result = await sendInvoice(message, usrSession, "show_invoice");
                await wkv.update(db, message.chat.id, {lastCmd: "show_invoice", isLast: true});

                return result;
            case "confirm_order".toLowerCase():
                //TODO: admin ACL check
                return await confirmOrder(message, usrSession);
            case "reject_order".toLowerCase():
                //TODO: admin ACL check
                return await rejectOrder(message, usrSession, options)
            case Config.commands.updateNewOrderButtons.toLowerCase():
                return await updateNewOrderButtons(message);
            case "status_link".toLowerCase():
                return await sendStartMessage(message);
        }

        let result = !usrSession.isLast ? await sendHelpMessage(message) :
            await saveOrder(message, usrSession) && await sendOrderToAdmin(message, usrSession);

        // await sendInlineButtonRow(message.chat.id, `userSession values: ${JSON.stringify(usrSession)}`, [])


        return result;

    } catch (e) {
        let text = e?.stack || e?.message || JSON.stringify(e);
        await sendInlineButtonRow(message.chat.id, text, [])
    }
}

function sendStartMessage(message) {
    let text = 'سلااام به ربات ویزویز خوش اومدی 🫡🌸\n' +
        '\n' +
        'ما اینجاییم تا شما را بدون هیچ محدویتی به شبکه جهانی متصل کنیم ❤️\n' +
        '\n' +
        '✅ کیفیت در ساخت انواع کانکشن ها\n' +
        '📡 برقرای امنیت در ارتباط شما\n' +
        '☎️ پشتیبانی تا روز آخر \n';

    return sendInlineButtonRow(message.chat.id, text, [
        [{text: 'خرید اشتراک', callback_data: 'select_server'}],
        [{text: 'وضعیت اشتراک', callback_data: 'status_link'}]
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

    let callbackData = "select_payment";
    let buttons = Plan.getButtons(callbackData);


    return sendInlineButtonRow(chatId, text, buttons, {method: 'editMessageText', messageId: message.message_id})
}

async function confirmOrder(message, session) {
    return Promise.resolve();



    let chatId = message.chat.id;
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;

    await wkv.update(db, message.chat_id, {payProofMessageId: message.message_id})

    let msg = Order.savedOrder(sPlan, sPayment);

    return await sendInlineButtonRow(chatId, msg, [
        // [{text: "پیگیری", callback_data: "send_message"}]
    ])
}

async function editButtons(message, buttons = []) {
    return await sendInlineButtonRow(message.chat_id || message.chat.id, undefined, buttons, {
        method: 'editMessageReplyMarkup',
        messageId: message.message_id
    });
}

async function updateNewOrderButtons(message, options = {}) {
    let values = message.text.split(';');

    if (values.length < 2) {
        let text = `${updateNewOrderButtons.name} : تعداد پارامترها صحیح نیست!`;
        return await sendInlineButtonRow(Config.bot.adminId, text, [])
    }

    let buttons = admin.updateNewOrderButtons({chat_id: values[1]});

    return await editButtons(message, buttons);
}

async function rejectOrder(message, session, options = {}) {
    await wkv.update(db, message.chat.id, {rejected: true});
    let values = message.text.split(';');


    // let ssss = `update: ${JSON.stringify(options.update)}`;
    // await sendInlineButtonRow(Config.bot.adminId, ssss, [])

    if (values.length < 2) {
        return await sendInlineButtonRow(Config.bot.adminId, `یوزر برای ارسال پیام پیدا نشد!`, [])
    }

    let res = await editButtons(message, [
        [{text: "سفارش رد شده!", callback_data: Config.commands.silentButton}],
        [{
            text: "↩️ بازنگری",
            callback_data: `${Config.commands.updateNewOrderButtons};${values[1]}`
        }],
    ])

    let text = `سفارش شما رد شد. لطفا با پشتیبانی تماس بگیرید`;
    return await sendInlineButtonRow(Number(values[1]), text, [
        [
            {text: "✨  شروع مجدد", callback_data: "/start"}
        ]
    ])
}

async function sendOrderToAdmin(message, session) {
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;
    let msg = Order.adminNewOrder(message.chat, sPlan, sPayment, message);

    let buttons = admin.updateNewOrderButtons(message);
    return await sendInlineButtonRow(Config.bot.adminId, msg, buttons)
}

async function saveOrder(message, session) {
    let chatId = message.chat.id;
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;

    await wkv.update(db, message.chat_id, {payProofMessageId: message.message_id})

    let msg = Order.savedOrder(sPlan, sPayment);

    return await sendInlineButtonRow(chatId, msg, [
        // [{text: "پیگیری", callback_data: "send_message"}]
    ])
}

async function sendInvoice(message, session, nextCmd) {
    let chatId = message.chat.id;
    let sPlan = Plan.findById(session[Plan.seed.cmd])?.model;
    let sPayment = Payment.findById(session[Payment.seed.cmd])?.model;

    let msg = Order.reviewInvoice(sPlan, sPayment);

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



