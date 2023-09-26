'use strict';

const Config = require('../config');
const Command = require('./command');

module.exports = {
    buttons: {
        default: [{text: Command.list.manage.textIcon(), callback_data: Command.list.manage.id}],
        buttons: [
            [{text: Command.list.managePlan.textIcon(), callback_data: Command.list.managePlan.id}],
            [{text: Command.list.manageServer.textIcon(), callback_data: Command.list.manageServer.id}],
            [{text: Command.list.managePayment.textIcon(), callback_data: Command.list.managePayment.id}],
        ]
    },

    getNewOrderButtons(id) {
        return [
            [
                {text: "✅  تایید", callback_data: `confirm_order;${id}`},
                {text: "❌ رد درخواست", callback_data: `reject_order;${id}`}
            ]
        ];
    },

    newAccountText(plan, userUrl, config) {
        let {tlgSupport} = config.bot;
        let {name: planName, maxDays, volume} = plan;

        let result = `😍 سفارش شما تائید شد

📦 نام بسته:${planName}

🎚حجم بسته:${volume} گیگ

⏳ زمان:${maxDays} روز


برای مشاهده جزئیات لینک زیر رو باز کنید:
${userUrl}

درصورت بروز هرگونه مشکل با پشتیبانی تماس بگیرید:
${tlgSupport}

`;

        return result;
    }
}




