'use strict';

const Config = require('../config');

const Cmd = {
    adminButtons: {
        newPlan() {
            return [{text: Cmd.list.newPlan.textIcon(), callback_data: Cmd.list.newPlan.id}]
        },
        newServer() {
            return [{text: Cmd.list.newServer.textIcon(), callback_data: Cmd.list.newServer.id}]
        },
        newPayment() {
            return [{text: Cmd.list.newPayment.textIcon(), callback_data: Cmd.list.newPayment.id}]
        },
        newClientApp() {
            return [{text: Cmd.list.newClientApp.textIcon(), callback_data: Cmd.list.newClientApp.id}]
        },
        actions(model, id) {
            return [
                [
                    {text: `✏️ ویرایش`, callback_data: `${model}/${id}/update`},
                    {text: `❌ حذف آیتم`, callback_data: `${model}/${id}/delete`}
                ]
            ]
        },
    },
    list: {
        "selectServer": {
            "prevId": "/editedStart",
            "id": "selectServer",
            "title": "انتخاب سرور",
            "icon": `📍`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `📍 
یک لوکیشین برای اتصال، انتخاب کنید`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "selectPlan",
            "savedInSession": true,
            "appendAdminButtons": false,
            "buttons": "Server"
        },
        "selectPlan": {
            "prevId": "selectServer",
            "id": "selectPlan",
            "title": "انتخاب پلن",
            "icon": `📦`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `📦 
یکی از پلن های زیرو انتخاب کنید`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "selectPayment",
            "savedInSession": true,
            "appendAdminButtons": false,
            "buttons": "Plan"
        },
        "selectPayment": {
            "prevId": "selectPlan",
            "id": "selectPayment",
            "title": "انتخاب درگاه پرداخت",
            "icon": `💳`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `💳 
یک روش پرداخت رو انتخاب کنید`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "show_invoice",
            "savedInSession": true,
            "appendAdminButtons": false,
            "buttons": "Payment"
        },
        "selectClientApp": {
            "prevId": "/editedStart",
            "id": "selectClientApp",
            "title": "مشاهده نرم‌افزار",
            "icon": `🔗`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `🔗 
برای اتصال، یکی از نرم‌افزار‌های زیر رو دانلود و نصب کنید:`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "viewClientApp",
            "savedInSession": true,
            "appendAdminButtons": false,
            "buttons": "ClientApp"
        },
        "viewClientApp": {
            "prevId": "selectClientApp",
            "id": "viewClientApp",
            "title": "مشاهده جزییات",
            "icon": `🔗`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `{icon}  جزییات نرم‌افزار {title}
           
برای دانلود نرم‌افزار از لینک زیر استفاده کنید:             
{url} 
`,
            "successText": ``,
            "helpText": ``,
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "preFunc": 'ClientApp;viewById',
            "nextId": "",
            "savedInSession": false ,
            "buttons": []
        },
        "showInvoice": {
            "prevId": "selectPayment",
            "id": "showInvoice",
            "title": "پیش فاکتور",
            "icon": `📃`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `📃
یک روش پرداخت رو انتخاب کنید`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "show_invoice",
            "buttons": "Payment"
        },
        "userOrders": {
            "prevId": "/",
            "id": "userOrders",
            "title": "سوابق خرید",
            "icon": `🛒`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `    textIcon: "🔗",

لیست سفارشات تون 👇`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "orderDetails",
            "savedInSession": true,
            "buttons": "Order"
        },

        "manage": {
            "prevId": "/editedStart",
            "id": "manage",
            "title": "مدیریت",
            "icon": `👨‍💼`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": ["managePlan", "manageServer", "managePayment", "manageClientApp"]
        },
        "managePlan": {
            "prevId": "manage",
            "id": "managePlan",
            "title": "مدیریت پلن ها",
            "icon": `📦`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `📦 

روی یک پلن ضربه بزنید یا
 از دکمه "پلن جدید" برای افزودن پلن جدید استفاده کنید:`,
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

            "asButton": true,
            "body": `📦 ➕ 

یک پلن طبق الگوی زیر برای ثبت در سیستم ارسال کنید:

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
            "resultInNew": true,
            "buttons": ["managePlan", "manage"]
        },
        "doUpdate": {
            "prevId": "managePlan",
            "id": "doUpdate",
            "asButton": false,
            "body": `✅ پلن شما با موفقیت آپدیت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Plan;doUpdate",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["managePlan", "manage"]
        },
        "deleteItem": {
            "prevId": "managePlan",
            "id": "deleteItem",
            "title": "حذف پلن",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": ``,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "confirmDelete",
            "buttons": []
        },
        "confirmDelete": {
            "prevId": "managePlan",
            "id": "confirmDelete",
            "title": "ساخت پلن جدید",
            "icon": `📦 ➕`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `{modelName} با موفقیت حذف شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Plan;deleteById",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "buttons": ["managePlan", "manage"]
        },

        "manageServer": {
            "prevId": "manage",
            "id": "manageServer",
            "title": "مدیریت سرور ها",
            "icon": `💻`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `💻 

روی یک دکمه ضربه بزنید یا
 از دکمه "سرور جدید" برای افزودن سرور جدید استفاده کنید:`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": "Server"
        },
        "newServer": {
            "prevId": "manageServer",
            "id": "newServer",
            "title": "ساخت سرور جدید",
            "icon": `💻 ➕`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `💻 ➕ 

یک سرور طبق الگوی زیر برای ثبت در سیستم ارسال کنید:

title: ${"نام نماشی برای کاربر".replaceAll(" ", "_")}
remark: ${"نام نمایشی برای ساخت کانفیگ".replaceAll(" ", "_")} 
url: ${"آدرس سرور هیدیفای".replaceAll(" ", "_")} 
`,
            "successText": ``,
            "helpText": `⚠️ لطفا هنگا ثبت موراد زیر رو رعایت کنید:

- در قسمت remark ترجیحا از فاصله، ایموجی، سیمبل استفاده نکنید!

- در قسمت url ترجیحا از آدرس  پنل نماینده برای امنیت بیشتر استفاده کنید`,
            "preFunc": "",
            "nextId": "createServer",
            "buttons": []
        },
        "createServer": {
            "prevId": "manageServer",
            "id": "createServer",
            // "title": "ساخت پلن جدید",
            // "icon": `📦 ➕`,
            // textIcon() {
            //     return `${this.icon} ${this.title}`
            // },
            "asButton": false,
            "body": `✅ سرور شما با موفقیت ثبت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Server;create",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["manageServer", "manage"]
        },
        "doUpdateServer": {
            "prevId": "manageServer",
            "id": "doUpdateServer",
            "asButton": false,
            "body": `✅ سرور شما با موفقیت آپدیت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Server;doUpdate",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["manageServer", "manage"]
        },
        "deleteServer": {
            "prevId": "manageServer",
            "id": "deleteServer",
            "title": "حذف سرور",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": ``,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "confirmDeleteServer",
            "buttons": []
        },
        "confirmDeleteServer": {
            "prevId": "manageServer",
            "id": "confirmDeleteServer",
            "title": "حذف سرور",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `{modelName} با موفقیت حذف شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Server;deleteById",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "buttons": ["manageServer", "manage"]
        },

        "managePayment": {
            "prevId": "manage",
            "id": "managePayment",
            "title": "مدیریت درگاه های پرداخت",
            "icon": `💳`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `💳 

روی یک دکمه ضربه بزنید یا
 از دکمه "درگاه جدید" برای افزودن درگاه جدید استفاده کنید:`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": "Payment"
        },
        "newPayment": {
            "prevId": "managePayment",
            "id": "newPayment",
            "title": "ساخت درگاه جدید",
            "icon": `💳 ➕`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `💳 ➕ 

یک درگاه طبق الگوی زیر برای ثبت در سیستم ارسال کنید:
                    
title: ${"کارت به کارت".replaceAll(" ", "_")}
appKey: ${"نام کامل صاحب کارت".replaceAll(" ", "_")} 
appSecret: ${"شماره کارت صاحبت کارت".replaceAll(" ", "_")} 
`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "createPayment",
            "buttons": []
        },
        "createPayment": {
            "prevId": "managePayment",
            "id": "createPayment",
            "asButton": false,
            "body": `✅ درگاه شما با موفقیت ثبت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Payment;create",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["managePayment", "manage"]
        },
        "doUpdatePayment": {
            "prevId": "managePayment",
            "id": "doUpdatePayment",

            "asButton": false,
            "body": `✅ درگاه شما با موفقیت آپدیت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Payment;doUpdate",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["managePayment", "manage"]
        },
        "deletePayment": {
            "prevId": "managePayment",
            "id": "deletePayment",
            "title": "حذف سرور",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": ``,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "confirmDeletePayment",
            "buttons": []
        },
        "confirmDeletePayment": {
            "prevId": "managePayment",
            "id": "confirmDeletePayment",
            "title": "حذف سرور",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `{modelName} با موفقیت حذف شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "Payment;deleteById",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "buttons": ["managePayment", "manage"]
        },

        "manageClientApp": {
            "prevId": "manage",
            "id": "manageClientApp",
            "title": "مدیریت نرم‌افزارها",
            "icon": `🔗`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": `🔗 

روی یک دکمه ضربه بزنید یا   
 از دکمه "نرم‌افزار جدید" برای ثبت داده استفاده کنید:`,
            "successText": ``,
            "helpText": ``,
            "preFunc": '',
            "nextId": "",
            "buttons": "ClientApp"
        },
        "newClientApp": {
            "prevId": "manageClientApp",
            "id": "newClientApp",
            "title": "ساخت نرم‌افزار جدید",
            "icon": `🔗 ➕`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `🔗 ➕ 

یک درگاه طبق الگوی زیر برای ثبت در سیستم ارسال کنید:
                    
title: ${"عنوان نرم‌افزار".replaceAll(" ", "_")}
icon: ${"آیکون نرم‌افزار".replaceAll(" ", "_")} 
url: ${"لینک دانلود نرم‌افزار".replaceAll(" ", "_")} 
`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "createClientApp",
            "buttons": []
        },
        "createClientApp": {
            "prevId": "manageClientApp",
            "id": "createClientApp",
            "asButton": false,
            "body": `✅ نرم‌افزار شما با موفقیت ثبت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "ClientApp;create",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["manageClientApp", "manage"]
        },
        "doUpdateClientApp": {
            "prevId": "manageClientApp",
            "id": "doUpdateClientApp",
            "asButton": false,
            "body": `✅ نرم‌افزار شما با موفقیت آپدیت شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "ClientApp;doUpdate",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "resultInNew": true,
            "buttons": ["manageClientApp", "manage"]
        },
        "deleteClientApp": {
            "prevId": "manageClientApp",
            "id": "deleteClientApp",
            "title": "حذف نرم‌افزار",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },
            "asButton": true,
            "body": ``,
            "successText": ``,
            "helpText": ``,
            "preFunc": "",
            "nextId": "confirmDeleteClientApp",
            "buttons": []
        },
        "confirmDeleteClientApp": {
            "prevId": "manageClientApp",
            "id": "confirmDeleteClientApp",
            "title": "حذف نرم‌افزار",
            "icon": `❌`,
            textIcon() {
                return `${this.icon} ${this.title}`
            },

            "asButton": true,
            "body": `{modelName} با موفقیت حذف شد.`,
            "successText": ``,
            "helpText": ``,
            "preFunc": "ClientApp;deleteById",
            preFuncData() {
                let [model, func] = this.preFunc.split(';');

                return {model, func}
            },
            "nextId": "",
            "buttons": ["manageClientApp", "manage"]
        },
    },

    yesNoButton(yes, no, options = {}) {
        return [
            [
                {text: no?.text || "منصرف شدم 🚫", callback_data: no.cbData},
                {text: yes?.text || "بله، انجام بشه 👍", callback_data: yes.cbData},
            ]
        ];
    },

    backButton(cbData, text) {
        return [{text: text || "برگشت ↩️", callback_data: cbData}];
    },

    ToTlgButton(text, cbData, options = {}) {
        return {text: text, callback_data: cbData.toString()};
    },

    async buildButtons2(db, cmd, DataModel, isAdmin, options = {}) {
        let opt = Object.assign({}, options, {forAdmin: isAdmin, prevCmd: cmd.prevId});

        return Array.isArray(cmd.buttons) ?
            await this.findByIds(cmd.buttons, p => p.asButton).ToTlgButtons({
                idKey: "id",
                textKey: "textIcon"
            }, undefined) :
            await DataModel[cmd.buttons].findAll(db, cmd, opt);
    },

    async buildCmdInfo(db, cmd, DataModel, isAdmin, options = {}) {
        let text = `${cmd.body}\n${cmd.helpText}`;
        let buttons = await this.buildButtons2(db, cmd, DataModel, isAdmin, options);

        return {text, buttons}
    },

    find(id) {
        return !id ? undefined : this.list[id]
    },

    findByIds(ids = [], filter = p => p, options = {}) {
        let result = ids.map(id => this.list[id]).filter(p => p).filter(filter) || [];

        return result;
    },


}

module.exports = Cmd;
