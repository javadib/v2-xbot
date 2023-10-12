'use strict';

const Command = require("./command");
const Config = require("../config");

const clientApp = {
    dbKey: "ClientApp",
    idKey: "id",
    textKey: "title",
    modelName: "نرم‌افزار",
    seed: {
        name: 'Seed clientApp',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "iOS - v2rayNG",
                    "icon": "📟",
                    "isActive": true,
                    "url": "https://play.google.com/store/apps/details?id=com.v2ray.ang&hl=en&gl=US",
                }
            },
            {
                model: {
                    "id": 2,
                    "title": "Android - SagerNet",
                    "icon": "📟",
                    "isActive": true,
                    "url": "https://play.google.com/store/apps/details?id=io.nekohasekai.sagernet&hl=de&gl=US",
                }
            },
            {
                model: {
                    "id": 3,
                    "title": "Android - OneClick",
                    "icon": "📟",
                    "isActive": true,
                    "url": "https://play.google.com/store/apps/details?id=earth.oneclick",
                }
            },
            {
                model: {
                    "id": 4,
                    "title": "iOS - V2Box",
                    "icon": "📱",
                    "isActive": true,
                    "url": "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690",
                }
            },
            {
                model: {
                    "id": 5,
                    "title": "iOS - FoxRay",
                    "icon": "📱",
                    "isActive": true,
                    "url": "https://apps.apple.com/us/app/foxray/id6448898396",
                }
            },
            {
                model: {
                    "id": 6,
                    "title": "iOS - OneClick",
                    "icon": "📱",
                    "isActive": true,
                    "url": "https://apps.apple.com/us/app/id1545555197",
                }
            },
            {
                model: {
                    "id": 7,
                    "title": "Windows - v2rayN",
                    "icon": "💻",
                    "isActive": true,
                    "url": "https://github.com/2dust/v2rayN/releases/latest/download/v2rayN-With-Core.zip",
                }
            },
            {
                model: {
                    "id": 8,
                    "title": "Windows - Nekoray",
                    "icon": "💻",
                    "isActive": true,
                    "url": "https://github.com/Matsuridayo/nekoray/releases",
                }
            },
            {
                model: {
                    "id": 9,
                    "title": "MacOs - Fair",
                    "icon": "🍏",
                    "isActive": true,
                    "url": "https://apps.apple.com/us/app/fair-vpn/id1533873488",
                }
            },
            {
                model: {
                    "id": 10,
                    "title": "MacOs - V2Box",
                    "icon": "🍏",
                    "isActive": true,
                    "url": "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690",
                }
            },
        ],
    },

    newFunc: Command.adminButtons.newClientApp,
    confirmDeleteId: Command.list.confirmDeleteClientApp.id,
    managePaymentId: Command.list.manageClientApp.id,


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
        let result = data.map(p => [Command.ToTlgButton(`${p.icon} ${p.title}`, cbData(p))]);
        // await options.pub?.sendToAdmin(`findAll result: ${JSON.stringify(result)}`);

        if (options.forAdmin == true) {
            result.push(this.newFunc())
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

    invalidMessage: function () {
        return `❌مقدار ارسالی ناقص است.
✍️   لطفا موراد رو با دقت بخونید و تمام داده های درخواستی رو ارسال کنید`;
    },

    async create({db, input}, options = {}) {
        let data = await this.parseInput(input, options);

        if (!data.title || !data.url) {
            return Promise.reject({message: this.invalidMessage()})
        }

        let oldData = await db.get(this.dbKey, {type: "json"}) || [];

        // await options.pub?.sendToAdmin(`oldData: ${JSON.stringify(oldData)}`);

        let newData = {
            "id": new Date().toUnixTIme(),
            "title": data.title,
            "icon": data.icon || "🈸",
            "isActive": data.isActive || true,
            "url": data.url
        };
        oldData.push(newData);

        await db.put(this.dbKey, oldData);

        return oldData;
    },

    async adminRoute(cmdId, db, message, pub) {
        let chatId = message.chat_id || message.chat.id;
        let [model, id, action] = cmdId.split('/');
        let dbModel = await this.findByIdDb(db, id);


        // await pub.sendInlineButtonRow(chatId, `adminRoute plan: ${JSON.stringify(plan)}`);


        if (!dbModel) {
            return await pub.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }


        // await pub.sendInlineButtonRow(chatId, `adminRoute actions: ${JSON.stringify(actions)} && action: ${action} `);

        let text, actions;
        let opt = {method: 'editMessageText', messageId: message.message_id, pub: pub}

        switch (action) {
            case action.match(/details/)?.input:
                actions = Command.adminButtons.actions(this.dbKey, dbModel.id);
                actions.push(Command.backButton(this.managePaymentId));

                text = ` ${Command.list.managePayment.icon} ${this.modelName} ${dbModel.title}
                
یکی از عملیات مربوطه روانتخاب کنید:`;
                return await pub.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${Command.list.doUpdatePayment.id};${dbModel.id}`;
                actions = [];
                actions.push(Command.backButton(this.managePaymentId));
                text = `✏️ مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
                
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(dbModel)}
                `;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${this.confirmDeleteId};${dbModel.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: this.managePaymentId})
                actions.push(Command.backButton("/start"));
                text = ` آیا از حذف ${this.modelName} ${dbModel.title} مطمئنید؟`;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },
}


module.exports = clientApp;