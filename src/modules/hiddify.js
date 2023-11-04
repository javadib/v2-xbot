"use strict";

const {v4: uuidv4} = require('uuid');


const wFetch = require("./wfetch");


module.exports = class Hiddify {
    baseUrl = "https://v2proxy.rew0rk.online/";

    constructor() {
    }

    async createAccount(plan, server, userChatId, comment = "", options = {}) {
        let url = new URL("/hiddify/create", this.baseUrl);

        let raw = {
            // uuid: uuidv4(),
            "baseUrl": server.url,
            "name": options.customName || `${server.remark}-${userChatId}-${new Date().toUnixTIme()}`,
            "volume": plan.volume,
            "maxDays": plan.maxDays,
            "telegramId": userChatId,
            "comment": comment
        }

        return new wFetch().request(url, 'POST', raw, {"Content-Type": "application/json"});
    }

    async extendAccount(messasage, order, plan, server, uid, options = {}) {
        let data = {
            "baseUrl": server.url,
            "uuid": uuidv4(),
            "name": order.accountName,
            "usage_limit_GB": 201,
            "package_days": 51,
            "comment": null,
            "mode": "no_reset",
            "enable": false,
            "telegram_id": chatdId
        }

        return new wFetch().request(url, 'POST', data, {"Content-Type": "application/json"});

    }

    async getAccountInfo(uid, data, options = {}) {
        let url = new URL(`/hiddify/${uid}/details`, this.baseUrl);
        // await options.Logger?.log(`getAccountInfo url: ${url.href}`);

        return new wFetch().request(url, 'POST', data, {"Content-Type": "application/json"});
    }

    async takeBackup(server, options = {}) {
        let url = new URL("/hiddify/backup", this.baseUrl);

        let raw = {
            "baseUrl": server.url,
        }

        return new wFetch().request(url, 'POST', raw, {"Content-Type": "application/json"});
    }

}
