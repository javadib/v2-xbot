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
        let msg = `💳 خرید جدید ( کارت به کارت )

💡آیدی کاربر: ${tUser.id}

🧑‍ نام کاربری: @${tUser.username}

💰مبلغ پرداختی: ${sPlan.totalPrice.toLocaleString()} تومان
 
📦 نام پلن:  ${sPlan.name}
 
 ℹ️  اطلاعات واریز:  \n${message.text}`;
        msg += `\n\n این اطلاعات بمنزله پرداخت نیست. لطفا بعد بررسی اطلاعات پرداخت، آن را تائید یا رد کنید 🙏`

        return msg
    },

    savedOrderText(sPlan, sPayment) {
        let msg = `〽️ نام پلن: ${sPlan?.name}\n\n💎 قیمت پنل : ${sPlan?.totalPrice.toLocaleString()} \n\n💳 پرداخت: ${sPayment.title}\n\n\n`;

        msg += this.meta.templates.savedOrder.text;

        return msg;
    },

    reviewInvoice(sPlan, sPayment) {
        let msg = `📃 پیش فاکتور  شما 
        
        
📦 نام پلن: ${sPlan?.name}

💎 قیمت :${sPlan?.totalPrice.toLocaleString()} 
      
🔰  ${sPayment?.appKey} - ${sPayment?.appSecret}

♻️ بعد از پرداخت مبلغ به شما کارت بالا، لطفا مشخصات پرداخت رو در یک پیام ارسال کنید:

✅ بعد از تایید پرداخت، کانفیگ به صورت خودکار توسط ربات براتون ارسال میشه!`

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




