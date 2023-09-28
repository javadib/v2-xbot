'use strict';

const Command = require("./command");


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
                    "name": "PLAN_NAME", // نام نمایشی به کاربر
                    "totalPrice": 100000, // قیمت
                    "maxDays": 30, // تعداد روز
                    "volume": 30, // حجم به گیگ
                    "maxIp": 1, // حداکثر تعدا آی پی
                    "sharedId": 0, // اکانت اشتراکی
                    "note": "ADMIN_NOTE" // یاددشت برای ادمین
                }
            },
            {
                model: {
                    "id": 2,
                    "name": "PLAN_NAME_2",
                    "totalPrice": 170000,
                    "maxDays": 60,
                    "volume": 60,
                    "maxIp": 1,
                    "sharedId": 0,
                    "note": "ایاددشت برای ادمین"
                }
            },
            {
                model: {
                    "id": 3,
                    "name": "PLAN_NAME_2",
                    "totalPrice": 250000,
                    "maxDays": 90,
                    "volume": 90,
                    "maxIp": 1,
                    "sharedId": 0,
                    "note": "ایاددشت برای ادمین"
                }
            },
        ],
        adminButtons: {
            newPlan: [{text: Command.list.newPlan.textIcon(), callback_data: Command.list.newPlan.id}],
        }
    },
    dbKey: "plan",
    idKey: "id",
    textKey: "name",

    async seedData(db, options = {}) {
        await db.update(this.dbKey, this.seed.data.map(p => p.model))
    },

    async findAll(db, options = {}) {
        let {addBackButton = true, unitPrice = "تومان"} = options;

        let data = await db.get(this.dbKey, {type: "json"}) || []
        let result = await data.ToTlgButtons({textKey: this.textKey, idKey: this.idKey}, options.prevCmd, false);

        await options.pub?.sendToAdmin(`plan result: ${JSON.stringify(result)}`);


        if (options.forAdmin == true) {
            result.push(this.seed.adminButtons.newPlan)
        }

        if (addBackButton) {
            result.push([{text: "برگشت ↩️", callback_data: options.prevCmd}])
        }

        return result;
    },

    getButtons(nextCmd, options = {}) {
        let {addBackButton = true, unitPrice = "تومان"} = options;
        let data = this.seed.data.map(p => {
            return [{
                text: `${p.model.name} - ${p.model.totalPrice.toLocaleString()} ${unitPrice}`,
                callback_data: `${nextCmd};${p.model.id}`
            }]
        })

        if (options.forAdmin == true) {
            data.push(this.seed.adminButtons.newPlan)
        }

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: options.prevCmd || this.seed.prev_cmd}])

        }

        return data;
    },

    findById(id) {
        return this.seed.data.find(p => p.model.id == id)
    },

    async parseInput(input, options = {}) {
        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(':');

            if (split.length < 1) return pv;

            pv[split[0]] = split[1].trim();

            return pv;
        }, {})

        return result;
    },

    async create({db, input}, options = {}) {
        let data = await this.parseInput(input, options);
        // await options.pub.sendToAdmin(`after input: ${typeof data}`);

        let oldData = await db.get(this.dbKey, {type: "json"}) || [];

        await options.pub?.sendToAdmin(`oldData: ${JSON.stringify(oldData)}`);

        let newData = {
            "id": new Date().toUnixTIme(),
            "name": data.name,
            "totalPrice": Number(data.totalPrice),
            "maxDays": Number(data.maxDays),
            "volume": Number(data.volume),
            "maxIp": 1,
            "sharedId": 0,
            "note": "ADMIN_NOTE"
        };
        oldData.push(newData);

        await db.put(this.dbKey, oldData);

        return oldData;
    }
}




