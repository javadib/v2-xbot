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
                    "url": "https://exmaple.workder.dev/xxxxxxxxxxx/yyyyyyyyy/admin/",
                }
            },
            {
                model: {
                    "id": 2,
                    "title": "🇩🇪 Germany2",
                    "remark": "Germany2",
                    "url": "https://exmaple.workder.dev/xxxxxxxxxxx/yyyyyyyyy/admin/",
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
