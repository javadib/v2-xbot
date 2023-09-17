'use strict';

module.exports = {
    seed: {
        name: 'Seed Servers',
        cmd: 'select_server',
        prev_cmd: '/start',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "🇩🇪 Germany",
                    "remark": "Germany",
                    "url": "https://gcloudp.rew0rk.online/6S8eNbo96qGXLGrQ4b8WVqW7fW7v/a3c074eb-ae34-4286-9289-542bfcc8ecdd/admin/",
                }
            }
        ],
    },

    getButtons(nextCmd, addBackButton = true) {
        let data = this.seed.data.map(p => {
            return [{text: p.model.title, callback_data: `${nextCmd};${p.model.id}`}]
        })

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: "/start"}])
        }

        return data;
    },

    findById(id) {
        return this.seed.data.find(p => p.model.id == id)
    }
}
