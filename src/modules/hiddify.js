"use strict";

// const uuidv4 = require("uuid").v4();

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

    async getAccountInfo(uid, data, options = {}) {
        let url = new URL(`/hiddify/${uid}/details`, this.baseUrl);
        // await options.pub?.sendToAdmin(`getAccountInfo url: ${url.href}`);

        return new wFetch().request(url, 'POST', data, {"Content-Type": "application/json"});
    }
}
