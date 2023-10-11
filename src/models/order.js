'use strict';

const index = require('../index');

module.exports = {
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

    adminNewOrder(tUser, sPlan, sPayment, message) {
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

    reviewInvoice(sPlan, sPayment, options = {}) {
        let {unitPrice = 'تومان'} = options;

        let msg = `📃 پیش فاکتور 
        
        
📦 نام پلن: ${sPlan?.name}

💎 قیمت :${Number(sPlan?.totalPrice).toLocaleString()} ${unitPrice}
      
🔰  ${sPayment?.appSecret} بنام ${sPayment?.appKey}


♻️ بعد از پرداخت مبلغ به شما کارت بالا، لطفا مشخصات پرداخت رو بصورت متنی ارسال کنید:

✅ بعد از تایید پرداخت، کانفیگ به صورت خودکار توسط ربات براتون ارسال میشه!`

        return msg;
    },

    getId(chatId) {
        return `order:${chatId}:${new Date().toUnixTIme()}`;
    },

    parseId(id) {
        let [model, userChatId, unixTime] = id.split(':')

        return {model, userChatId, unixTime};
    },

    toButtons(order, nextCmd, addBackButton = true) {
        let data = [];
        let text = order.accountName || order.createdAt || order.id;
        data.push([{text: text, callback_data: `${nextCmd};${order.id}`}])

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: "/start"}])
        }

        return data;
    },

    async gerOrders(db, chatId, options = {}) {
        let buttons;
        let query = `order:${chatId}:`;
        let orders = await db.list({prefix: query}) || [];

        await options.pub?.sendToAdmin(`orders: ${JSON.stringify(orders)}`, [])


        buttons = orders.keys.map(p => this.toButtons(p, options.nextCmd));

        if (options.toButtons && options.nextCmd) {
        }

        await options.pub?.sendToAdmin(`buttons: ${JSON.stringify(buttons)}`, [])



        return {orders, buttons};
    }

}




