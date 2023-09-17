'use strict';

module.exports = {
    seed: {
        name: 'Seed Payments',
        cmd: 'select_payment',
        prev_cmd: 'select_plan',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "کارت به کارت",
                    "appKey": "علی رضایی",
                    "appSecret": "xxxx-xxxx-xxxx-xxxx",
                    "url": ""
                }
            }
        ],
    },

    getButtons(nextCmd, addBackButton = true) {
        let data = this.seed.data.map(p => {
            return [{text: p.model.title, callback_data: `${nextCmd};${p.model.id}`}]
        })

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: this.seed.prev_cmd}])
        }

        return data;
    },

    findById(id) {
      return this.seed.data.find(p => p.model.id === Number(id))
    }
}




