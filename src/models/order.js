'use strict';

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
        return `💳 خرید جدید ( کارت به کارت )\n\n▫️آیدی کاربر: ${tUser.id}\n⚡️ نام کاربری: @${tUser.username}\n💰مبلغ پرداختی: ${sPlan.totalPrice.toLocaleString()} تومان\n✏️ نام سرویس: ${sPlan.name}\n\n    \nاطلاعات واریز: ${message.text}`
    },

    savedOrderText(sPlan, sPayment) {
        let msg = `〽️ نام پلن: ${sPlan?.name}\n\n💎 قیمت پنل : ${sPlan?.totalPrice.toLocaleString()} \n\n💳 پرداخت: ${sPayment.title}\n\n\n\n`;

        msg += this.meta.templates.savedOrder.text;

        return msg;
    },

    reviewInvoice(sPlan, sPayment) {
        let msg = `〽️ نام پلن: ${sPlan?.name}\n➖➖➖➖➖➖➖\n💎 قیمت پنل : ${sPlan?.totalPrice.toLocaleString()} \n➖➖➖➖➖➖➖\n\n♻️ عزیزم یه تصویر از فیش واریزی یا شماره پیگیری -  ساعت پرداخت - نام پرداخت کننده رو در یک پیام برام ارسال کن :\n\n🔰  ${sPayment?.appKey} - ${sPayment?.appSecret} \n\n✅ بعد از اینکه پرداختت تایید شد ( لینک سرور ) به صورت خودکار از طریق همین ربات برات ارسال میشه!`

        return msg;
    },

    getId(chatId) {
        return `order:${chatId}:${new Date().toUnixTIme()}`;
    },

    parseId(id) {
        let [model, userChatId, unixTime] = id.split(':')

        return {model, userChatId, unixTime};
    }

}




