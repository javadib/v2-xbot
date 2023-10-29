'use strict';

const Command = require("./command");
const Config = require("../config");

const clientApp = {
    dbKey: "clientApp",
    idKey: "id",
    textKey: "title",
    modelName: "نرم‌افزار",
    textIcon: "🔗",
    seed: {
        name: 'Seed clientApp',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "Android - v2rayNG",
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
    manageId: Command.list.manageClientApp.id,
    doUpdateId: Command.list.doUpdateClientApp.id,

    async seedDb(db) {
        return await db.put(this.dbKey, this.seed.data.map(p => p.model))
    },


    async viewById({db, input, message, usrSession, isAdmin}, options = {}) {
        let model = await this.findByIdDb(db, input);

        return model;
    },

    async findAll(db, cmd, options = {}) {
        let {addBackButton = true, nextCmd = cmd.nextId} = options;

        let data = await db.get(this.dbKey, {type: "json"}) || []
        // let cbData = (p) => cmd.savedInSession ? `${nextCmd};${p.id}` : nextCmd || `${this.dbKey}/${p.id}/details`;
        let cbData = (p) => nextCmd ? p.transform(cmd.nextId) : `${this.dbKey}/${p.id}/details`;
        let result = data.map(p => [Command.ToTlgButton(`${p.icon} ${p.title}`, cbData(p))]);
        // await options.Logger?.log(`findAll result: ${JSON.stringify(result)}`);

        let canShowAdminButtons = !cmd.hasOwnProperty("appendAdminButtons") || cmd.appendAdminButtons === true;
        if (canShowAdminButtons && options.forAdmin == true) {
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

    toInput(obj) {
        return Object.keys(obj).reduce((pv, cv, i) => {
            pv += `${cv} : ${obj[cv]}\n`;

            return pv;
        }, '')
    },

    async parseInput(input, options = {}) {
        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(':');

            if (split.length < 2) return pv;

            pv[split[0].trim()] = split.slice(1).join(':').trim();

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
        newData.id = input;
        currentModel = Object.assign(currentModel, newData);

        // await options.Logger?.log(`newData: ${typeof currentModel}, && ${JSON.stringify(currentModel)}`);

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
        let data = await this.parseInput(input, options);

        if (!data.title || !data.url) {
            return Promise.reject({message: this.invalidMessage()})
        }

        let oldData = await db.get(this.dbKey, {type: "json"}) || [];

        // await options.Logger?.log(`oldData: ${JSON.stringify(oldData)}`);

        let newData = {
            "id": new Date().toUnixTIme(),
            "title": data.title,
            "icon": data.icon || "🈸",
            "isActive": data.isActive || true,
            "url": data.url
        };
        oldData.push(newData);

        await db.put(this.dbKey, oldData);

        return newData;
    },

    async adminRoute(cmdId, handler, tlgBot) {
        let {db, message, usrSession, isAdmin} = handler;
        let chatId = message.chat_id || message.chat.id;
        let [model, id, action] = cmdId.split('/');
        let dbModel = await this.findByIdDb(db, id);
        // await tlgBot.sendInlineButtonRow(chatId, `adminRoute dbModel: ${JSON.stringify(dbModel)}`);

        if (!dbModel) {
            return await tlgBot.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }

        let text, actions;
        let opt = {method: 'editMessageText', messageId: message.message_id}

        switch (action) {
            case action.match(/details/)?.input:
                actions = Command.adminButtons.actions(this.dbKey, dbModel.id);
                actions.push(Command.backButton(this.manageId));

                text = ` ${Command.list.manageClientApp.icon} ${this.modelName} ${dbModel.title}
                
یکی از عملیات مربوطه روانتخاب کنید:`;
                return await tlgBot.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${this.doUpdateId};${dbModel.id}`;
                actions = [];
                actions.push(Command.backButton(this.manageId));
                text = `✏️ مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
                
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(dbModel)}
                `;
                var res = await tlgBot.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${this.confirmDeleteId};${dbModel.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: this.manageId})
                actions.push(Command.backButton("/editedStart"));
                text = ` آیا از حذف ${this.modelName} ${dbModel.title} مطمئنید؟`;
                var res = await tlgBot.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },
}


module.exports = clientApp;
