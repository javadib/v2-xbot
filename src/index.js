/**
 * https://github.com/cvzi/telegram-bot-cloudflare
 */

import * as Server from './models/servers/seed'
import * as Plans from './models/plans/seed'

// const TOKEN = ENV_BOT_TOKEN // Get it from @BotFather https://core.telegram.org/bots#6-botfather
const TOKEN = "6558330560:AAHfBf2CM4VeOE9n_jMeHpXv1lX1OGm8Iio" // Get it from @BotFather https://core.telegram.org/bots#6-botfather
const WEBHOOK = '/endpoint'
const SECRET = "123456789wertyuiopxcvbnmDGHJKRTYIO" // A-Z, a-z, 0-9, _ and -


/**
 * Wait for requests to the worker
 */
addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    let buttons = Plans.default.getButtons(Server.default.seed.cmd);
    // console.log(`buttons: ${JSON.stringify(buttons)}`);

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
        await onMessage(update.message)
    }
    if ('callback_query' in update) {
        let message = update.callback_query.message;
        message.text = update.callback_query.data;


        await onMessage(message)
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
    // let method = 'sendMessage';
    let method = options.method || 'sendMessage';
    let messageId = options.messageId;

    console.log(`options: ${JSON.stringify(options)}`);


    let params = {
        chat_id: chatId,
        reply_markup: {inline_keyboard: buttons},
        text
    };

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
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));

    let json = (await fetch(apiUrl(method, params), requestOptions)).json();
    console.log(`json: ${json}`);

    return json
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
async function onMessage(message) {
    try {
        switch (message.text.toLowerCase()) {
            case "/start":
            case "/help":
                return await sendStartMessage(message);
            case "select_server":
                return await sendServers(message);
            case "select_plan":
                return await sendPlans(message);
            case "select_payment":
                return await sendPlans(message);
            case "status_link":
                return await sendStartMessage(message);
            default:
                return await sendHelpMessage(message);
        }
    } catch (e) {
        let text = e?.message || JSON.stringify(e);
        await sendInlineButtonRow(message.chat.id, text, [])
        // await sendMarkdownV2Text(message.chat.id, text)
    }


    return;
    if (message.text.startsWith('/start') || message.text.startsWith('/help')) {
        return sendMarkdownV2Text(message.chat.id, '*Functions:*\n' +
            escapeMarkdown(
                '`/help` - This message\n' +
                '/button2 - Sends a message with two button\n' +
                '/button4 - Sends a message with four buttons\n' +
                '/markdown - Sends some MarkdownV2 examples\n',
                '`'))
    } else if (message.text.startsWith('/button2')) {
        return sendTwoButtons(message.chat.id)
    } else if (message.text.startsWith('/button4')) {
        return sendFourButtons(message.chat.id)
    } else if (message.text.startsWith('/markdown')) {
        return sendMarkdownExample(message.chat.id)
    } else {
        return sendMarkdownV2Text(message.chat.id, escapeMarkdown('*Unknown command:* `' + message.text + '`\n' +
            'Use /help to see available commands.', '*`'))
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
    let data = Server.default.getButtons(Plans.default.seed.cmd);

    return sendInlineButtonRow(chatId, text, data, {method: 'editMessageText', messageId: message.message_id})
}

function sendPlans(message) {
    let chatId = message.chat.id;
    let text = 'یکی از پلن های زیرو انتخاب کیند';

    let callbackData = "select_payment";
    let data = Plans.default.getButtons(callbackData);


    return sendInlineButtonRow(chatId, text, data, {method: 'editMessageText', messageId: message.message_id})
}

function sendTwoButtons(chatId) {
    return sendInlineButtonRow(chatId, 'Press one of the two button', [{
        text: 'Button One',
        callback_data: 'data_1'
    }, {
        text: 'Button Two',
        callback_data: 'data_2'
    }])
}

function sendFourButtons(chatId) {
    return sendInlineButtons(chatId, 'Press a button', [
        [
            {
                text: 'Button top left',
                callback_data: 'Utah'
            }, {
            text: 'Button top right',
            callback_data: 'Colorado'
        }
        ],
        [
            {
                text: 'Button bottom left',
                callback_data: 'Arizona'
            }, {
            text: 'Button bottom right',
            callback_data: 'New Mexico'
        }
        ]
    ])
}

async function sendMarkdownExample(chatId) {
    await sendMarkdownV2Text(chatId, 'This is *bold* and this is _italic_')
    await sendMarkdownV2Text(chatId, escapeMarkdown('You can write it like this: *bold* and _italic_'))
    return sendMarkdownV2Text(chatId, escapeMarkdown('...but users may write ** and __ e.g. `**bold**` and `__italic__`', '`'))
}
