'use strict';

const Command = require("./command");

module.exports = {
    dbKey: "payment",
    idKey: "id",
    textKey: "title",
    modelName: "درگاه پرداخت",
    seed: {
        name: 'Seed Payments',
        cmd: 'select_payment',
        prev_cmd: 'select_plan',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "کارت به کارت",
                    "appKey": "OWNER_NAME", // نام کامل صاحب کارت
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
    },


    toInput(obj, options = {}) {
        return Object.keys(obj).reduce((pv, cv, i) => {
            pv += `${cv} : ${obj[cv]}\n`;

            return pv;
        }, '')
    },

    async findAll(db, cmd, options = {}) {
        let {addBackButton = true, nextCmd} = options;

        let data = await db.get(this.dbKey, {type: "json"}) || []
        let cbData = (p) => cmd.savedInSession ? `${nextCmd};${p.id}` : nextCmd || `${this.dbKey}/${p.id}/details`;
        let result = data.map(p => [Command.ToTlgButton(p.title, cbData(p))]);
        // await options.pub?.sendToAdmin(`findAll result: ${JSON.stringify(result)}`);

        if (options.forAdmin == true) {
            result.push(Command.adminButtons.newPayment())
        }

        if (addBackButton && options.prevCmd) {
            result.push([{text: "برگشت ↩️", callback_data: options.prevCmd}])
        }

        return result;
    },

    async findByIdDb(db, id) {
        let models = await db.get(this.dbKey, {type: "json"}) || [];

        return models.find(p => p.id == id);
    },

    async parseInput(input, options = {}) {
        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(':');

            if (split.length < 1) return pv;

            pv[split[0].trim()] = split[1].trimLeft().trimRight();

            return pv;
        }, {})

        return result;
    },

    async doUpdate({db, input, message, usrSession}, options = {}) {
        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        let currentModel = oldData.find(p => p.id == input); //TODO: Raise Ex if model not found
        let newData = await this.parseInput(message.text, {});
        newData.id = input;
        currentModel = Object.assign(currentModel, newData);

        // await options.pub?.sendToAdmin(`newData: ${typeof currentModel}, && ${JSON.stringify(currentModel)}`);

        await db.put(this.dbKey, oldData)

        return currentModel;
    },

    async deleteById({db, input}, options = {}) {
        let oldData = await db.get(this.dbKey, {type: "json"}) || [];
        let newData = oldData.filter(p => p.id != input);

        // await options.pub.sendToAdmin(`inputs: ${typeof newData}, && ${JSON.stringify(newData)}`);


        let saved = await db.put(this.dbKey, newData);

        return newData;
    },

    async create({db, input}, options = {}) {
        let data = await this.parseInput(input, options);
        // await options.pub.sendToAdmin(`after input: ${typeof data}`);

        let oldData = await db.get(this.dbKey, {type: "json"}) || [];

        // await options.pub?.sendToAdmin(`oldData: ${JSON.stringify(oldData)}`);

        let newData = {
            "id": new Date().toUnixTIme(),
            "title": data.title,
            "appKey": data.appKey,
            "appSecret": data.appSecret,
            "url": data.url
        };
        oldData.push(newData);

        await db.put(this.dbKey, oldData);

        return oldData;
    },

    async adminRoute(cmdId, db, message, pub) {
        let chatId = message.chat_id || message.chat.id;
        let [model, id, action] = cmdId.split('/');
        let payment = await this.findByIdDb(db, id);
        let confirmDeleteId = Command.list.confirmDeletePayment.id;
        let managePaymentId = Command.list.managePayment.id;


        // await pub.sendInlineButtonRow(chatId, `adminRoute plan: ${JSON.stringify(plan)}`);


        if (!payment) {
            return await pub.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }


        // await pub.sendInlineButtonRow(chatId, `adminRoute actions: ${JSON.stringify(actions)} && action: ${action} `);

        let text, actions;
        let opt = {method: 'editMessageText', messageId: message.message_id, pub: pub}

        switch (action) {
            case action.match(/details/)?.input:
                actions = Command.adminButtons.actions(this.dbKey, payment.id);
                actions.push(Command.backButton(managePaymentId));

                text = ` ${Command.list.managePayment.icon} ${this.modelName} ${payment.title}
                
یکی از عملیات مربوطه روانتخاب کنید:`;
                return await pub.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${Command.list.doUpdatePayment.id};${payment.id}`;
                actions = [];
                actions.push(Command.backButton(managePaymentId));
                text = `✏️ مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
                
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(payment)}
                `;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${confirmDeleteId};${payment.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: managePaymentId})
                actions.push(Command.backButton("/start"));
                text = ` آیا از حذف ${this.modelName} ${payment.title} مطمئنید؟`;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },

}




