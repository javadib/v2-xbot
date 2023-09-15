'use strict';

module.exports = {
    seed: {
        name: 'seed plans',
        cmd: 'select_plan',
        prev_cmd: 'select_server',
        next_cmd: 'select_server',
        data: [
            {
                model: {
                    "id": 1,
                    "name": "30 روزه 30 گیگ",
                    "totalPrice": 10000,
                    "maxDays": 30,
                    "volume": 30,
                    "maxIp": 1,
                    "sharedId": 0,
                    "note": "ایاددشت برای ادمین"
                }
            },
            {
                model: {
                    "id": 1,
                    "name": "60 روزه 60 گیگ",
                    "totalPrice": 170000,
                    "maxDays": 30,
                    "volume": 30,
                    "maxIp": 1,
                    "sharedId": 0,
                    "note": "ایاددشت برای ادمین"
                }
            },
            {
                model: {
                    "id": 1,
                    "name": "90 روزه 90 گیگ",
                    "totalPrice": 250000,
                    "maxDays": 90,
                    "volume": 90,
                    "maxIp": 1,
                    "sharedId": 0,
                    "note": "ایاددشت برای ادمین"
                }
            },
        ],
    },

    getButtons(nextCmd, addBackButton = true) {
        let data = this.seed.data.map(p => {
            return [{text: p.model.name, callback_data: `${nextCmd};${p.model.id}`}]
        })

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: this.seed.prev_cmd}])

        }

        return data;
    },

    findById(id) {
        return this.seed.data.find(p => p.model.id == id)
    }
}




