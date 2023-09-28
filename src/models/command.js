'use strict';

const Config = require('../config');

module.exports = {
    list: {
        "manage": {
            "prevId": "/start",
            "id": "manage",
            "title": "مدیریت",
            "icon": `👨‍💼`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "tags": [],
            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": ["managePlan", "manageServer", "managePayment"]
        },
        "managePlan": {
            "prevId": "manage",
            "id": "managePlan",
            "title": "مدیریت پلن ها",
            "icon": `📦`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "tags": [],
            "asButton": true,
            "body": `📦 روی یک پلن ضربه بزنید یا دکمه ثبت جدید برای انتخاب کنید:`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": "Plan"
        },
        "newPlan": {
            "prevId": "managePlan",
            "id": "newPlan",
            "title": "ساخت پلن جدید",
            "icon": `📦 ➕`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "tags": [],
            "asButton": true,
            "body": `📦 ➕ یک پلن طبق الگوی زیر برای ثبت در سیستم ارسال کنید:

name: ${"نام نمایشی".replaceAll(" ", "_")}
totalPrice: ${"قیمت".replaceAll(" ", "_")} 
maxDays: ${"تعداد روز".replaceAll(" ", "_")} 
volume: ${"حجم به گیگ".replaceAll(" ", "_")}
`,
            "successText": ``,
            "helpText": `
توجه کنید فقط مقدار بعد از : رو تغییر بدید`,
            "preFunc": "",
            "nextId": "createPlan",
            "buttons": []
        },
        "createPlan": {
            "prevId": "managePlan",
            "id": "createPlan",
            // "title": "ساخت پلن جدید",
            // "icon": `📦 ➕`,
            // textIcon() {
            //     return `${this.icon} ${this.title}`
            // },
            "tags": [],
            "asButton": false,
            "body": `✅ پلن شما با موفقیت ثبت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Plan;create",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "buttons": ["managePlan", "manage"]
        },
        "manageServer": {
            "id": "manageServer",
            "title": "مدیریت سرورها",
            "icon": `💻`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "tags": [],
            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": ["user.myConfig", "user.newOrder"]
        },
        "managePayment": {
            "id": "managePayment",
            "title": "مدیریت",
            "icon": `🦹‍`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "tags": [],
            "asButton": false,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": ["user.myConfig", "user.newOrder"]
        }
    },

    async buildButtons2(db, cmd, DataModel, isAdmin, options = {}) {
        let opt = Object.assign({}, options, {forAdmin: isAdmin, prevCmd: cmd.prevId});

        return Array.isArray(cmd.buttons) ?
            await this.findByIds(cmd.buttons, p => p.asButton).ToTlgButtons({
                idKey: "id",
                textKey: "textIcon"
            }, undefined) :
            await DataModel[cmd.buttons].findAll(db, opt);
    },

    async buildCmdInfo(db, cmd, DataModel, isAdmin, options = {}) {
        let text = `${cmd.body}\n${cmd.helpText}`;
        let buttons = await this.buildButtons2(db, cmd, DataModel, isAdmin, options);

        return {text, buttons}
    },

    find(id) {
        return this.list[id]
    },

    findByIds(ids = [], filter, options = {}) {
        let result = ids.map(id => this.list[id]).filter(p => p).filter(filter) || [];

        return result;
    },


}




