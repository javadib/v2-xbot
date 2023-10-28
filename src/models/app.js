'use strict';

const Config = require('../config');

class app {
    _db;
    dbKey = "app"
    keys = {
        seedCaliApp: {id: "seedCaliApp", default: false},
    }

    constructor(db) {
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
}

module.exports = app;
