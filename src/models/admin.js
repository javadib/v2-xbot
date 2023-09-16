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
}




