'use strict';

const Command = require("./command");
const Config = require("../config");


module.exports = {
    dbKey: "server",
    idKey: "id",
    textKey: "title",
    modelName: "سرور",
    seed: {
        name: 'Seed Servers',
        cmd: 'select_server',
        prev_cmd: '/editedStart',
        data: [
            {
                model: {
                    "id": 1,
                    "title": "DISPLAY_NAME", // نام نماشی برای کاربر
                    "remark": "REMARK_NAME", // نام نمایشی برای ساخت کانفیگ
                    "url": "https://hiddify.com/xxxxxxxxxxxx/yyyyy-yyy-yyyy-yyyy-yyyyyyyyy/admin/",
                }
            }
        ],
    },

    getButtons(nextCmd, addBackButton = true) {
        let data = this.seed.data.map(p => {
            return [{text: p.model.title, callback_data: `${nextCmd};${p.model.id}`}]
        })

        if (addBackButton) {
            data.push([{text: "برگشت ↩️", callback_data: "/editedStart"}])
        }

        return data;
    },

    getHiddifyBaseurl(url, urlPath) {
        return urlPath ? `${url.protocol}//${url.hostname}/${url.pathname.split('/')[1]}/${urlPath}/` :
            `${url.protocol}//${url.hostname}/${url.pathname.split('/')[1]}/`;
    },

    findById(id) {
        return this.seed.data.find(p => p.model.id == id)
    },

    toInput(obj, options = {}) {
        return Object.keys(obj).reduce((pv, cv, i) => {
            pv += `${cv} : ${obj[cv]}\n`;

            return pv;
        }, '')
    },

    async findAll(db, cmd, options = {}) {
        let {addBackButton = true, unitPrice = "تومان", nextCmd} = options;

        let data = await db.get(this.dbKey, {type: "json"}) || []
        let result = data.map(p => {
            // let cbData = (p) => cmd.savedInSession ? `${nextCmd};${p.id}` : nextCmd || `${this.dbKey}/${p.id}/details`;
            let cbData = (p) => nextCmd ? p.transform(cmd.nextId) : `${this.dbKey}/${p.id}/details`;
            return [Command.ToTlgButton(p.title, cbData(p))];
        });
        // await options.pub?.sendToAdmin(`findAll result: ${JSON.stringify(result)}`);

        let canShowAdminButtons = !cmd.hasOwnProperty("appendAdminButtons") || cmd.appendAdminButtons === true;
        if (canShowAdminButtons && options.forAdmin == true) {
            result.push(Command.adminButtons.newServer())
        }

        if (addBackButton && options.prevCmd) {
            result.push([{text: "برگشت ↩️", callback_data: options.prevCmd}])
        }

        return result;
    },

    async findByIdDb(db, id) {
        let plans = await db.get(this.dbKey, {type: "json"}) || [];

        return plans.find(p => p.id == id);
    },

    async parseInput(input, options = {}) {
        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(':');

            if (split.length < 1) return pv;

            pv[split[0].trim()] = split.slice(1).join(':').trimLeft().trimRight();

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

        // await options.pub?.sendToAdmin(`newData: ${typeof currentModel}, && ${JSON.stringify(currentModel)}`);

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
        // await options.pub?.sendToAdmin(`before create: ${typeof input} && ${JSON.stringify(input)}`);
        let data = await this.parseInput(input, options);

        if (!data.title || !data.remark || !data.url) {
            return Promise.reject({message: this.invalidMessage()})
        }

        let oldData = await db.get(this.dbKey, {type: "json"}) || [];

        // await options.pub?.sendToAdmin(`oldData: ${JSON.stringify(oldData)}`);

        let newData = {
            "id": new Date().toUnixTIme(),
            "title": data.title,
            "remark": data.remark,
            "url": data.url
        };
        oldData.push(newData);

        await db.put(this.dbKey, oldData);

        return newData;
    },

    async adminRoute(cmdId, db, message, pub) {
        let chatId = message.chat_id || message.chat.id;
        let [model, id, action] = cmdId.split('/');
        let server = await this.findByIdDb(db, id);
        let confirmDeleteId = Command.list.confirmDeleteServer.id;
        let manageServerId = Command.list.manageServer.id;


        // await pub.sendInlineButtonRow(chatId, `adminRoute plan: ${JSON.stringify(plan)}`);


        if (!server) {
            return await pub.sendInlineButtonRow(chatId, `${this.modelName} مربوطه پیدا نشد! 🫤`);
        }


        // await pub.sendInlineButtonRow(chatId, `adminRoute actions: ${JSON.stringify(actions)} && action: ${action} `);

        let text, actions;
        let opt = {method: 'editMessageText', messageId: message.message_id, pub: pub}

        switch (action) {
            case action.match(/details/)?.input:
                actions = Command.adminButtons.actions(this.dbKey, server.id);
                actions.push(Command.backButton(manageServerId));

                text = ` ${Command.list.manageServer.icon} ${this.modelName} ${server.title}
                
یکی از عملیات مربوطه روانتخاب کنید:`;
                return await pub.sendInlineButtonRow(chatId, text, actions, opt)

            case action.match(/update/)?.input:
                let doUpdate = `${Command.list.doUpdateServer.id};${server.id}`;
                actions = [];
                actions.push(Command.backButton(manageServerId));
                text = `✏️ مقادیری که می خواهید اپدیت شوند رو ارسال کنید.
                
بقیه موارد تغییری نخواهند کرد:

مشخصات فعلی ${this.modelName} : 

${this.toInput(server)}
                `;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                await db.update(chatId, {currentCmd: doUpdate})

                return res

            case action.match(/delete/)?.input:
                let doDelete = `${confirmDeleteId};${server.id}`;
                actions = Command.yesNoButton({cbData: doDelete}, {cbData: manageServerId})
                actions.push(Command.backButton("/start"));
                text = ` آیا از حذف ${this.modelName} ${server.title} مطمئنید؟`;
                var res = await pub.sendInlineButtonRow(chatId, text, actions, opt);

                // await db.update(chatId, {currentCmd: Command.list.confirmDelete.id})

                return res
        }
    },

}
