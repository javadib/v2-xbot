"use strict";

Object.prototype.transform = function (text) {
    let keys = Object.keys(this);

    if (keys.length <= 0) return text;

    keys.forEach(k => {
        let re = new RegExp(`{${k}}`, 'gi');
        text = text.replaceAll(re, this[k])
    });

    return text;
}

Date.prototype.toUnixTIme = function () {
    return Math.floor(this / 1000);
}

Array.prototype.ToTlgButtons = async function ({idKey, textKey}, prevCmd, addBackButton = true) {
    let data = this.map(p => {
        let text = p.textIcon?.call(p) || p[textKey];

        return [{text: text, callback_data: p[idKey].toString()}];
    }) || [];

    if (prevCmd && addBackButton) {
        data.push([{text: "برگشت ↩️", callback_data: prevCmd}])
    }

    return data;
}

const Config = require('./config');
const Plan = require('./models/plan');
const Server = require('./models/server');
const Order = require('./models/order');
const Payment = require('./models/payment');
const admin = require("./models/admin");
const Admin = require('./models/admin');
const ClientApp = require('./models/client-app');
const Command = require('./models/command');

const DataModel = {Plan, Order, Payment, Server, ClientApp};

const wKV = require('./modules/wkv');
const wkv = new wKV(db);

const Hiddify = require("./modules/hiddify");
const Telegram = require("./modules/telegram");

const SEED = "/seed"
const WEBHOOK = Config.bot.webHook
const SECRET = Config.bot.secret;

const TlgBot = new Telegram(Config.bot.token);


/**
 * Wait for requests to the worker
 */
addEventListener('fetch', async event => {
    const url = new URL(event.request.url);

    switch (url.pathname) {
        case SEED:
            event.respondWith(seedDb(event))
            break;
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

async function seedDb(event) {
    let clientApps = await ClientApp.seedDb(wkv);

    await TlgBot.sendToAdmin(`seedDb clientApps: ${JSON.stringify(clientApps)}`)

    return new Response(JSON.stringify(clientApps))

}

/**
 * Handle requests to WEBHOOK
 * https://core.telegram.org/bots/api#update
 */
async function handleWebhook(event) {
    // Check secret
    let xSecret = event.request.headers?.get('X-Telegram-Bot-Api-Secret-Token');
    if (xSecret !== SECRET) {
        await TlgBot.sendToAdmin(`handleWebhook: Unauthorized - ${SECRET} && tlg secret: ${xSecret}`, [])

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
    const r = await (await fetch(TlgBot.apiUrl('setWebhook', {url: webhookUrl, secret_token: secret}))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Remove webhook
 * https://core.telegram.org/bots/api#setwebhook
 */
async function unRegisterWebhook(event) {
    const r = await (await fetch(TlgBot.apiUrl('setWebhook', {url: ''}))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

async function buildButtons(cmd, isAdmin, options = {}) {
    let prevCmd = cmd.prevId;
    let opt = Object.assign({}, options, {forAdmin: isAdmin, prevCmd: cmd.prevId});

    return Array.isArray(cmd.buttons) ?
        await Command.findByIds(cmd.buttons, p => p.asButton).ToTlgButtons({
            textKey: "textIcon", idKey: "id"
        }, prevCmd) :
        await DataModel[cmd.buttons].findAll(wkv, cmd, opt);
}

/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
async function onMessage(message, options = {}) {
    let chatId = message.chat_id || message.chat.id;
    let isAdmin = chatId === Config.bot.adminId;

    try {
        let usrSession = await wkv.get(chatId, {type: "json"}) || {};
        let [cmdId, input] = message.text.split(';');
        let handler = {db: wkv, input: input || message.text, message, usrSession, isAdmin};

        // await TlgBot.sendToAdmin(`DEBUG MODE - [cmdId, input]: ${JSON.stringify([cmdId, input])}`, [])
        // await TlgBot.sendToAdmin(`DEBUG MODE - user Session: ${JSON.stringify(usrSession)}`, [])

        switch (cmdId) {
            case  cmdId.match(/\/silentButton/)?.input:
                return await Promise.resolve();

            // case cmdId.match(/\//)?.input :
            case "/editedStart" :
                let opt = {method: 'editMessageText', messageId: message.message_id};
                return await sendStartMessage(message, isAdmin, opt);

            case cmdId.match(/\/start/)?.input :
            case cmdId.match(/\/help/)?.input :
                return await sendStartMessage(message, isAdmin);

            case cmdId.match(/show_invoice/)?.input :
                if (input) {
                    let payment = {[Command.list.selectPayment.id]: input};
                    usrSession = await wkv.update(chatId, payment);
                }

                return await sendInvoice2(message, usrSession, "show_invoice");

            case cmdId.match(/order_history/)?.input :
                if (input) {
                    let payment = {[Command.list.selectPayment.id]: input};
                    usrSession = await wkv.update(chatId, payment);
                }

                return await showOrders(message, "/editedStart", "show_invoice");

            case cmdId.match(/confirm_order/)?.input:
                if (!isAdmin) {
                    return Promise.reject({message: Config.bot.accessDenied()})
                }

                return await confirmOrder(message, usrSession);

            case cmdId.match(/reject_order/)?.input:
                if (!isAdmin) {
                    return Promise.reject({message: Config.bot.accessDenied()})
                }

                return await rejectOrder(message, usrSession, options)

            case cmdId.match(/status_link/)?.input :
                return await sendStartMessage(message, isAdmin);

            case cmdId.match(/plan\/(.?)*\/details/)?.input:
            case cmdId.match(/plan\/(.?)*\/update/)?.input:
            // case cmdId.match(/plan\/(.?)*\/doUpdate/)?.input:
            case cmdId.match(/plan\/.*\/delete/)?.input:
                return await Plan.adminRoute(cmdId, wkv, message, TlgBot);

            case cmdId.match(/server\/(.?)*\/details/)?.input:
            case cmdId.match(/server\/(.?)*\/update/)?.input:
            case cmdId.match(/server\/.*\/delete/)?.input:
                return await Server.adminRoute(cmdId, wkv, message, TlgBot);

            case cmdId.match(/payment\/(.?)*\/details/)?.input:
            case cmdId.match(/payment\/(.?)*\/update/)?.input:
            case cmdId.match(/payment\/.*\/delete/)?.input:
                return await Payment.adminRoute(cmdId, wkv, message, TlgBot);

            case cmdId.match(/clientApp\/(.?)*\/details/)?.input:
            case cmdId.match(/clientApp\/(.?)*\/update/)?.input:
            case cmdId.match(/clientApp\/.*\/delete/)?.input:
                // await TlgBot.sendToAdmin(`ClientApp.adminRoute}: ${JSON.stringify(cmdId)}`, []);
                return await ClientApp.adminRoute(cmdId, handler, TlgBot);
        }

        let vars = {};
        let cmd = Command.find(cmdId);
        if (cmd) {
            if (input) {
                let data = {[cmd.prevId]: input};
                usrSession = await wkv.update(chatId, data);
            }

            if (cmd.preFunc) {
                let {model, func} = cmd.preFuncData();
                // await TlgBot.sendToAdmin(`cmd: {model, func}: ${JSON.stringify({model, func})}`, []);

                let result = await DataModel[model]?.[func](handler, {pub: TlgBot, debug: true});
                vars = Object.assign({}, vars, typeof result === 'object' ? result : {})
                // await TlgBot.sendToAdmin(`vars: ${JSON.stringify(vars)}`)
            }

            let buttons = await buildButtons(cmd, isAdmin, {pub: TlgBot, nextCmd: `${cmd.nextId}`});
            // await TlgBot.sendToAdmin(`buttons: ${JSON.stringify(buttons)}`, []);

            let opt = {method: 'editMessageText', messageId: message.message_id, pub: TlgBot}
            let text1 = (typeof vars === 'object' ? vars : {}).transform(`${cmd.body}\n${cmd.helpText}`);
            let response = await TlgBot.sendInlineButtonRow(chatId, text1, buttons, opt);

            // if (cmd.nextId) {
            await wkv.update(chatId, {currentCmd: cmd.nextId})
            // }

            return response
        }

        var [uCmdId, uInput] = usrSession.currentCmd?.split(';') || [];
        let currentCmd = Command.find(uCmdId);

        if (currentCmd) {
            if (currentCmd.preFunc) {
                let {model, func} = currentCmd.preFuncData();
                // await TlgBot.sendToAdmin(`currentCmd: {model, func}: ${JSON.stringify({model, func})}`, []);

                handler.input = uInput || handler.input;
                let preFunc = await DataModel[model]?.[func](handler, {
                    pub: TlgBot,
                    debug: true,
                    nextCmd: currentCmd.nextId
                });
                vars = Object.assign({}, vars, typeof preFunc === 'object' ? preFunc : {})

            }

            let buildOpt = {nextCmd: currentCmd.nextId};
            let {text, buttons} = await Command.buildCmdInfo(wkv, currentCmd, DataModel, isAdmin, buildOpt);
            text = (typeof vars === 'object' ? vars : {}).transform(`${cmd.body}\n${cmd.helpText}`);
            // await TlgBot.sendToAdmin(`currentCmd buttons: ${JSON.stringify(buttons)}`, []);


            let opt = {method: 'editMessageText', messageId: message.message_id}
            let sentMessageRes = await TlgBot.sendInlineButtonRow(chatId, text, buttons, {});

            // if (currentCmd.nextId) {
            await wkv.update(chatId, {currentCmd: currentCmd.nextId})
            // }

            return sentMessageRes
        }


        let result = usrSession.isLast === true ?
            await saveOrder2(message, usrSession) :
            await sendStartMessage(message, isAdmin);

        // await sendInlineButtonRow(message.chat.id, `userSession values: ${JSON.stringify(usrSession)}`, [])

        return result;

    } catch (e) {
        let text = e?.stack || e?.message || JSON.stringify(e);
        await TlgBot.sendInlineButtonRow(chatId, text, [])
    }
}

function pushAdminButtons(buttons = [], isAdmin = false) {
    if (isAdmin) {
        buttons.push(Admin.buttons.default);
    }

    return buttons;
}

async function sendStartMessage(message, isAdmin, options = {}) {
    let chatId = message.chat_id || message.chat.id;
    let buttonRow = [
        [{text: '📦  خرید اشتراک', callback_data: 'selectServer'}],
        [{text: '🛒 سوابق_خرید', callback_data: 'order_history'}],
        [{text: '🛒 سوابق خرید', callback_data: Command.list.userOrders.id}],
        [{text: '🔗 مشاهده نرم‌افزار', callback_data: Command.list.selectClientApp.id}],
    ];

    buttonRow = pushAdminButtons(buttonRow, isAdmin)
    return await TlgBot.sendInlineButtonRow(chatId, Config.bot.welcomeMessage(), buttonRow, options)
}

async function editButtons(message, buttons = []) {
    return await TlgBot.sendInlineButtonRow(message.chat_id || message.chat.id, undefined, buttons, {
        method: 'editMessageReplyMarkup',
        messageId: message.message_id
    });
}

async function confirmOrder(message) {
    let [model, userChatId, orderId] = message.text.split(';') || [];
    let chatId = message.chat_id || message.chat.id;
    // await TlgBot.sendToAdmin(`confirmOrder vars: ${JSON.stringify([model, userChatId, orderId])}`)

    if (!orderId || !userChatId) {
        let text = `سفارشی برای پردازش پیدا نشد!`;
        return await TlgBot.sendInlineButtonRow(chatId, text, [])
    }

    let order = await Order.findByIdDb(wkv, userChatId, orderId, {pub: TlgBot})
    let sPlan = await Plan.findByIdDb(wkv, order[Command.list.selectPlan.id]);
    let sServer = await Server.findByIdDb(wkv, order[Command.list.selectServer.id]);


    let opt = {}
    if (order.invoiceMessageId) {
        opt = {method: 'editMessageText', messageId: order.invoiceMessageId};
    }

    let hiddify = new Hiddify();
    let accOpt = {customName: `${sServer.remark}-${userChatId}-${new Date().toUnixTIme()}`, logger: TlgBot}
    let res = await hiddify.createAccount(sPlan, sServer, userChatId, "", accOpt);
    // await TlgBot.sendToAdmin(`confirmOrder res: ${JSON.stringify(res.status)} && ${await res.text()}`)

    if (res.status != 200) {
        let text = `در ساخت اکانت برای کاربر مشکلی پیش اومد! لطفا مجدد امتحان کنید
در صورت تکرار این مشکل رو به تیم پشتیبانی گزارش بدید 🙏`;
        text += `\n\n ${res.status} : ${JSON.stringify(await res.text())}`;

        return await TlgBot.sendToAdmin(text, [], {method: 'sendMessage', reply_to_message_id: chatId});
    }

    let data = await res.json() || {};

    await Order.updateByIdDb(wkv, userChatId, orderId, {accountName: accOpt.customName})

    let accountText = admin.newAccountText(sPlan, data.userUrl, Config)
    let response = await TlgBot.sendInlineButtonRow(userChatId, accountText, [
        [{text: "🏡 صفحه اصلی", callback_data: "/start"}]
    ], opt);


    await editButtons(message, [
        [{text: "سفارش ارسال شده!", callback_data: Config.commands.silentButton}]
    ])

    return response
}


async function rejectOrder(message) {
    let [model, userChatId, orderId] = message.text.split(';') || [];

    if (!userChatId || !orderId) {
        return await TlgBot.sendInlineButtonRow(Config.bot.adminId, `یوزر برای ارسال پیام پیدا نشد!`, [])
    }

    let opt = {}
    let order = await Order.findByIdDb(wkv, userChatId, orderId)

    if (order.invoiceMessageId) {
        opt = {method: 'editMessageText', messageId: order.invoiceMessageId};
    }

    await Order.updateByIdDb(wkv, userChatId, orderId, {rejected: true})

    let text = `سفارش شما رد شد! 
برای بررسی مجدد، اطلاعات پرداخت رو برای پشتیبانی ارسال کنید  🙏
    
    ${Config.bot.tlgSupport}
`;
    let response = await TlgBot.sendInlineButtonRow(Number(userChatId), text, [
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

async function sendOrderToAdmin2(message, session, orderId) {
    let chatId = message.chat.id || message.chat_id;
    let sPlan = await Plan.findByIdDb(wkv, session[Command.list.selectPlan.id]);
    let sPayment = await Payment.findByIdDb(wkv, session[Command.list.selectPayment.id]);
    let msg = Order.adminNewOrderText(message.chat, sPlan, sPayment, message);

    let buttons = admin.getNewOrderButtons(chatId, orderId);

    return await TlgBot.sendInlineButtonRow(Config.bot.adminId, msg, buttons)
}

async function saveOrder2(message, session, sendToAdmin = true, deleteSession = true) {
    let chatId = message.chat.id || message.chat_id;
    let sPlan = await Plan.findByIdDb(wkv, session[Command.list.selectPlan.id]);
    let sPayment = await Payment.findByIdDb(wkv, session[Command.list.selectPayment.id]);

    let msg = await Order.savedOrderText(sPlan, sPayment);
    let sentUserOrderRes = await TlgBot.sendInlineButtonRow(chatId, msg, [
        // [{text: "پیگیری", callback_data: "send_message"}]
    ]);

    let data = await sentUserOrderRes.json() || {};
    let newOrder = Object.assign({}, session, {
        id: new Date().toUnixTIme(),
        // userId: chatId,
        invoiceMessageId: data.result?.message_id,
        payProofText: message.text,
        createdAt: new Date().toUnixTIme()
    })
    delete newOrder.isLast;
    delete newOrder.lastCmd;
    delete newOrder.currentCmd;

    let orderId = Order.getId(chatId);
    await wkv.push(orderId, newOrder)


    if (deleteSession) {
        await wkv.delete(chatId)
    }

    if (sendToAdmin) {
        await sendOrderToAdmin2(message, session, newOrder.id)
    }
    return sentUserOrderRes
}

async function showOrders(message, backCmdId, nextCmd) {
    let chatId = message.chat_id || message.chat.id;
    let orders = await Order.findByUser(wkv, chatId, p => p.accountName, {pub: TlgBot}) || []
    // await TlgBot.sendToAdmin(`showOrders orders: ${JSON.stringify(orders)}`, [])

    let buttons = orders.filter(p => p.accountName).map(o => [Command.ToTlgButton(o.accountName, o.id)]);
    buttons.push(Command.backButton(backCmdId))
    // await TlgBot.sendToAdmin(`showOrders buttons: ${JSON.stringify(buttons)}`, [])
    let opt = {method: 'editMessageText', messageId: message.message_id};

    let text = buttons.length < 2 ? `هیچ سفارش ثبت شده ای ندارید!` : `لیست سفارشات تون 👇`;
    return await TlgBot.sendInlineButtonRow(chatId, text, buttons, opt)
}

async function sendInvoice2(message, session, nextCmd) {
    let chatId = message.chat_id || message.chat.id;
    let sPlan = await Plan.findByIdDb(wkv, session[Command.list.selectPlan.id]);
    let sPayment = await Payment.findByIdDb(wkv, session[Command.list.selectPayment.id]);

    let msg = Order.reviewInvoiceText(sPlan, sPayment);

    await wkv.update(chatId, {lastCmd: "show_invoice", isLast: true});

    return await TlgBot.sendInlineButtonRow(chatId, msg, [
        // [{text: '❗️ لغو خرید', callback_data: '/start'}],
        [{text: "برگشت ↩️", callback_data: Command.list.selectPayment.id}]
    ], {method: 'editMessageText', messageId: message.message_id})
}



