'use strict';

const Command = require("./command");
const Hiddify = require("../modules/hiddify");
const Server = require("./server");

const order = {
    dbKey: "order",
    idKey: "id",
    modelName: "سفارش",
    textIcon: "🛒",
    meta: {
        cmd: 'save_order',
        prev_cmd: 'select_payment',
        templates: {
            "savedOrder": {
                "text": `🛍 سفارش تون با موفقیت ثبت شد.
                
بعد از تایید پرداخت، کانفیگ براتون توسط ربات ارسال میشه 🙏`,
            }
        },
    },

    // newFunc: Command.adminButtons.newClientApp,
    // confirmDeleteId: Command.list.confirmDeleteClientApp.id,
    manageId: "order_history",
    // doUpdateId: Command.list.doUpdateClientApp.id,

    actions: {
        details(chatId, id) {
            let orderKey = order.dbKey; //`${order.getId(chatId)}`;
            return [
                [
                    {text: `♻️ تمدید اکانت`, callback_data: `${orderKey}/${id}/continuation`},
                    // {text: `♻️ سفارش مجدد`, callback_data: `${order.getId(chatId)}/${id}/reOrder`}
                ]
            ]
        }
    },

    adminNewOrderText(tUser, sPlan, sPayment, message) {
        let msg = `💳 خرید جدید ( کارت به کارت )

💡آیدی کاربر: ${tUser.id}

🧑‍ نام کاربری: @${tUser.username}

💰مبلغ پرداختی: ${Number(sPlan?.totalPrice).toLocaleString()} تومان
 
📦 نام پلن:  ${sPlan.name}
 
 ℹ️  اطلاعات واریز:  \n${message.text}`;
        msg += `\n\n این اطلاعات بمنزله پرداخت نیست. لطفا بعد بررسی اطلاعات پرداخت، آن را تائید یا رد کنید 🙏`

        return msg
    },

    savedOrderText(sPlan, sPayment) {
        let msg = `〽️ نام پلن: ${sPlan?.name}\n\n💎 قیمت پنل : ${Number(sPlan?.totalPrice).toLocaleString()} \n\n💳 پرداخت: ${sPayment.title}\n\n\n`;

        msg += this.meta.templates.savedOrder.text;

        return msg;
    },

    reviewInvoiceText(sPlan, sPayment, options = {}) {
        let {unitPrice = 'تومان', extendAcc} = options;

        let headerText = extendAcc ? `📃 پیش فاکتور (تمدید)`: `📃 پیش فاکتور `;
        let msg = `${headerText}
        
        
📦 نام پلن: ${sPlan?.name}

💎 قیمت :${Number(sPlan?.totalPrice).toLocaleString()} ${unitPrice}
      
🔰  ${sPayment?.appSecret} بنام ${sPayment?.appKey}


♻️ بعد از پرداخت مبلغ به شما کارت بالا، لطفا مشخصات پرداخت رو بصورت متنی ارسال کنید:
`

        return msg;
    },

    getId(chatId) {
        return `${this.dbKey}:${chatId}`;
    },

    parseId(id) {
        let [model, userChatId, unixTime] = id.split(':') || []

        return {model, userChatId, unixTime};
    },

    toButtons(order, nextCmd, addBackButton = true) {
        let data = [];
        let text = order.accountName || order.createdAt || order.id;
        data.push([{text: text, callback_data: `${nextCmd};${order.id}`}])

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: "/editedStart"}])
        }

        return data;
    },

    async gerOrders(db, chatId, options = {}) {
        let buttons;
        let query = `order:${chatId}:`;
        let orders = await db.list({prefix: query}) || [];

        await options.Logger?.log(`orders: ${JSON.stringify(orders)}`, [])


        buttons = orders.keys.map(p => this.toButtons(p, options.nextCmd));

        if (options.toButtons && options.nextCmd) {
        }

        await options.Logger?.log(`buttons: ${JSON.stringify(buttons)}`, [])


        return {orders, buttons};
    },

    async findByUser(db, chatId, filter, options = {}) {
        filter = filter || (p => p);
        let oId = this.getId(chatId);
        let models = await db.get(oId, {type: "json"}) || [];

        return models.filter(filter);
    },

    async findByIdDb(db, chatId, id, options = {}) {
        let oId = this.getId(chatId);
        let models = await db.get(oId, {type: "json"}) || [];
        // await options.pub?.sendToAdmin(`findByIdDb: ${oId} && ${JSON.stringify(models)}`)

        return models.find(p => p.id == id);
    },

    async updateByIdDb(db, chatId, id, data, options = {}) {
        let oId = this.getId(chatId);
        let oldData = await db.get(oId, {type: "json"}) || [];
        let currentModel = oldData.find(p => p.id == id);

        if (!currentModel) {
            return Promise.reject({message: `${this.modelName} برای ویرایش پیدا نشد!`})
        }

        data.id = id;
        currentModel = Object.assign(currentModel, data);
        // await options.pub?.sendToAdmin(`newData: ${typeof currentModel}, && ${JSON.stringify(currentModel)}`);

        await db.put(oId, oldData)

        return currentModel;
    },

    async doUpdate({db, input, message, usrSession}, options = {}) {
        let chatId = message.chat_id || message.chat.id;
        let newData = await this.parseInput(message.text, {});
        newData.id = input;

        return this.updateByIdDb(db, chatId, input, newData, options)
    },

    async deleteById({db, input}, options = {}) {
        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        let newData = oldData.filter(p => p.id != input);

        let saved = await db.put(this.dbKey, newData);

        return {ok: true, modelName: this.modelName};
    },


    async route(cmdId, orderModel, server, handler, pub) {
        let {db, message, usrSession, isAdmin} = handler;
        let chatId = message.chat_id || message.chat.id;
        let [model, id, action] = cmdId.split('/');

        if (!orderModel) {
            return await pub.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }

        let text, actions, res;
        let opt = {method: 'editMessageText', messageId: message.message_id, pub: pub}

        switch (action) {
            case action.match(/details/)?.input:
                actions = this.actions.details(chatId, orderModel.id);
                actions.push(Command.backButton(this.manageId));

                let hiddify = new Hiddify();
                let data = { "baseUrl": Server.getHiddifyBaseurl(new URL(server.url), orderModel.uId) }
                res = await hiddify.getAccountInfo(orderModel.uId, data, {pub: pub})

                if (res.status != 200) {
                    let text = ` مشکلی در گرفتن اطلاعات کاربر پیش اومد! لطفا مجدد امتحان کنید
در صورت تکرار این مشکل رو به تیم پشتیبانی گزارش بدید 🙏`;

                    // let adminText = text + `\n\n ${res.status} : ${JSON.stringify(await res.text())}`;
                    // return await Logger.log(adminText, []); //TODO: public support channel/Group

                    return Promise.reject({message: text})
                }

                let accInfo = await res.json();
                text = ` 
${order.textIcon} مشخصات اکانت ${orderModel.accountName}
                
🤷‍♂️ شناسه اکانت :  {uuid}

🎚 حجم اکانت :  {volumeText}

📅 تعداد روز :  {dayText}


از عملیات زیر برای این اکانت می تونید استفاده کنید
`;
                text = accInfo.data?.transform(text);
                return await pub.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${this.doUpdateId};${orderModel.id}`;
                actions = [];
                actions.push(Command.backButton(this.manageId));
                text = `✏️ مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
                
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(orderModel)}
                `;
                res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${this.confirmDeleteId};${orderModel.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: this.manageId})
                actions.push(Command.backButton("/editedStart"));
                text = ` آیا از حذف ${this.modelName} ${orderModel.title} مطمئنید؟`;
                res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },
}

module.exports = order;
