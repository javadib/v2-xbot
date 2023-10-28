'use strict';

const Config = require('../config');
const Command = require('./command');

class app {
    _db;
    dbKey = "app"

    constructor(db) {
        this._db = db;
    }

    customWelcome = 'customWelcome';

    async saveCustomWelcome(text) {
        await this._db.update(this.dbKey, {[this.customWelcome]: text})
    }
}

module.exports = app;
