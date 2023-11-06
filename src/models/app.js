'use strict';

import {BaseModel} from "./base-model";
import {log} from "util";

const Config = require('../config');

class app extends BaseModel {
    _db;
    dbKey = "app"
    keys = {
        seedCaliApp: {id: "seedCaliApp", default: false},
        serverBackup: {
            id: "serverBackup",
            messages: {
                notSet: `تنیظمات بکاپ گیری بدرستی انجام نشده. 
لطفا در قسمت مدیریت آنها را اعمال کنید یا
 برای غیر فعال کردن بکاپ خودکار، در تنظیمات کلودفلر، بخش Cron Triggers را پاک کنید`
            }

        },
    }

    constructor(db) {
        super();

        this._db = db;
    }

    async getAll() {
        let data = await this._db.get(this.dbKey, {type: "json"}) || {};
        data[this.customWelcome] = data[this.customWelcome] || Config.bot.welcomeMessage();

        return data;
    }

    async getSeedClientApp() {
        let app = await this._db.get(this.dbKey, {type: "json"}) || {};
        let data = app[this.keys.seedCaliApp.id] || this.keys.seedCaliApp.default;

        return data;
    }

    async updateSeedClientApp({input}) {
        await this._db.update(this.dbKey, {[this.keys.seedCaliApp.id]: input})
    }

    customWelcome = 'customWelcome';

    async getCustomWelcome() {
        let app = await this._db.get(this.dbKey, {type: "json"}) || {};
        let text = app[this.customWelcome] || Config.bot.welcomeMessage();

        return text;
    }

    async saveCustomWelcome({db, input, message, usrSession, isAdmin}) {
        await this._db.update(this.dbKey, {[this.customWelcome]: input})
    }

    async getBackupInfo(options = {}) {
        let app = JSON.parse(await this._db.get(this.dbKey)) || {};
        let data = app[this.keys.serverBackup.id] || {};

        return data;
    }

    async setBackupInfo({db, input, message, usrSession, isAdmin}) {
        let data = await this.parseInput(input);

        await this._db.update(this.dbKey, {[this.keys.serverBackup.id]: data})
    }
}

module.exports = app;
