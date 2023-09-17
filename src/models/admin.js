'use strict';

const Config = require('../config');

module.exports = {
    meta: {
        command: {}
    },

    updateNewOrderButtons(message) {
        return [
            [
                {text: "✅  تایید", callback_data: `confirm_order;${message.chat_id || message.chat.id}`},
                {text: "❌ رد درخواست", callback_data: `reject_order;${message.chat_id || message.chat.id}`}
            ]
        ];
    },

    newAccMessage(plan, userUrl, config) {
        let {tlgSupport} = config.bot;
        let {name: planName, maxDays, volume} = plan;

        let result = `😍 سفارش جدید شما

📦 نام بسته:  ${planName}

🎚حجم بسته: ${volume} گیگ

🕓 زمان: ${maxDays} روز


برای مشاهده جزئیات لینک زیر رو باز کنید:
${userUrl}

درصورت بروز هرگونه مشکل با پشتیبانی تماس بگیرید:
${tlgSupport}`;

        return result;
    }
}




