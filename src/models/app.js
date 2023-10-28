'use strict';

const Config = require('../config');

class app {
    _db;
    dbKey = "app"

    constructor(db) {
        this._db = db;
    }

    customWelcome = 'customWelcome';

    async getAll() {
        let data = await this._db.get(this.dbKey, {type: "json"}) || {};
        data[this.customWelcome] = data[this.customWelcome] || Config.bot.welcomeMessage();

        return data;
    }

    async getCustomWelcome() {
        let app = await this._db.get(this.dbKey, {type: "json"}) || {};
        let text = app[this.customWelcome] || Config.bot.welcomeMessage();

        return text;
    }

    async saveCustomWelcome({db, input, message, usrSession, isAdmin}) {
        await this._db.update(this.dbKey, {[this.customWelcome]: input})
    }
}

module.exports = app;
