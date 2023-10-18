'use strict';

const Command = require("./command");
const Config = require("../config");


module.exports = {
    dbKey: "plan",
    idKey: "id",
    textKey: "name",
    modelName: "پلن",
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
            actions(id) {
                return [
                    [
                        {text: `✏️ ویرایش`, callback_data: `${"plan"}/${id}/update`},
                        {text: `❌ حذف آیتم`, callback_data: `${"plan"}/${id}/delete`}
                    ]
                ]
            },
        }
    },


    async adminRoute(cmdId, db, message, pub) {
        let chatId = message.chat_id || message.chat.id;
        let isAdmin = chatId === Config.bot.adminId;
        let [model, id, action] = cmdId.split('/');
        let plan = await this.findByIdDb(db, id);
        let confirmDeleteId = Command.list.confirmDelete.id;
        let managePlanId = Command.list.managePlan.id;


        // await pub.sendInlineButtonRow(chatId, `adminRoute plan: ${JSON.stringify(plan)}`);


        if (!plan) {
            return await pub.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }


        // await pub.sendInlineButtonRow(chatId, `adminRoute actions: ${JSON.stringify(actions)} && action: ${action} `);

        let text, actions;
        let opt = {method: 'editMessageText', messageId: message.message_id}

        switch (action) {
            case action.match(/details/)?.input:
                actions = this.seed.adminButtons.actions(plan?.id);
                actions.push(Command.backButton(managePlanId));

                text = ` ${Command.list.managePlan.icon} ${this.modelName} ${plan.name}
                
یکی از عملیات مربوطه روانتخاب کنید:`;
                return await pub.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${Command.list.doUpdate.id};${plan.id}`;
                actions = []; // Command.yesNoButton({text: `ثبت تغییرات ✅`, cbData: doUpdate}, {cbData: managePlanId});
                actions.push(Command.backButton(managePlanId));
                text = `✏️
              
مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(plan)}
                `;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${confirmDeleteId};${plan.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: managePlanId})
                // var actions = this.seed.adminButtons.actions(plan?.id);
                actions.push(Command.backButton("/editedStart"));
                text = ` آیا از حذف ${this.modelName} ${plan.name} مطمئنید؟`;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },


    async seedData(db, options = {}) {
        await db.update(this.dbKey, this.seed.data.map(p => p.model))
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

    async findAll(db, cmd, options = {}) {
        let {addBackButton = true, nextCmd} = options;

        let data = await db.get(this.dbKey, {type: "json"}) || []
        // let cbData = (p) => cmd.savedInSession ? `${nextCmd};${p.id}` : nextCmd || `${this.dbKey}/${p.id}/details`;
        let cbData = (p) => nextCmd ? p.transform(cmd.nextId) : `${this.dbKey}/${p.id}/details`;
        let result = data.map(p => [Command.ToTlgButton(p.name, cbData(p))]);

        let canShowAdminButtons = !cmd.hasOwnProperty("appendAdminButtons") || cmd.appendAdminButtons === true;
        if (canShowAdminButtons && options.forAdmin == true) {
            result.push(this.seed.adminButtons.newPlan)
        }

        if (addBackButton) {
            result.push([{text: "برگشت ↩️", callback_data: options.prevCmd}])
        }

        return result;
    },

    async findByIdDb(db, id) {
        let plans = await db.get(this.dbKey, {type: "json"}) || [];

        return plans.find(p => p.id == id);
    },

    toInput(obj, options = {}) {
        return Object.keys(obj).reduce((pv, cv, i) => {
            pv += `${cv} : ${obj[cv]}\n`;

            return pv;
        }, '')
    },

    async parseInput(input, options = {}) {
        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(':');

            if (split.length < 1) return pv;

            pv[split[0].trim()] = split.slice(1).join(":").trimLeft().trimRight();

            return pv;
        }, {})

        return result;
    },

    async doUpdate({db, input, message, usrSession}, options = {}) {
        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        let currentModel = oldData.find(p => p.id == input);

        if (!currentModel) {
            return Promise.reject({message: `${this.modelName} برای ویرایش پیدا نشد!`})
        }


        let newData = await this.parseInput(message.text, {});
        await options.Logger?.log(`doUpdate newData: ${JSON.stringify(newData)}`);

        newData.id = input;
        currentModel = Object.assign(currentModel, newData);
        await options.Logger?.log(`newData: ${typeof currentModel}, && ${JSON.stringify(currentModel)}`);

        await db.put(this.dbKey, oldData)

        return currentModel;
    },

    async deleteById({db, input}, options = {}) {
        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        let newData = oldData.filter(p => p.id != input);

        let saved = await db.put(this.dbKey, newData);

        return {ok: true, modelName: this.modelName};
    },


    invalidMessage: function () {
        return `❌مقدار ارسالی ناقص است.
✍️   لطفا موراد رو با دقت بخونید و تمام داده های درخواستی رو ارسال کنید`;
    },

    async create({db, input}, options = {}) {
        await options.Logger?.log(`create input: ${JSON.stringify(input)}`);

        let data = await this.parseInput(input, options);

        await options.Logger?.log(`create data: ${JSON.stringify(data)}`);


        if (!data.name || !data.totalPrice || !data.maxDays || !data.volume) {
            return Promise.reject({message: this.invalidMessage()})
        }


        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        await options.Logger?.log(`oldData: ${JSON.stringify(oldData)}`);

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

        return newData;
    }
}




