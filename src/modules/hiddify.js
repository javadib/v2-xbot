"use strict";

const Plan = require("../models/plan");
const Server = require("../models/server");
const Payment = require("../models/payment");
const wFetch = require("./wfetch");


module.exports = class Hiddify {

    baseUrl = "https://v2proxy.rew0rk.online/";

    constructor() {
    }

    async createAccount(plan, server, userChatId, comment, options = {}) {
        let url = new URL("/hiddify/create", this.baseUrl);
        let name = options.customName || `${userChatId}`;

        let raw = {
            "baseUrl": server.url,
            "name": name,
            "volume": plan.volume,
            "maxDays": plan.maxDays,
            "telegramId": userChatId,
            "comment": comment
        }

        return new wFetch().request(url, 'POST', raw, {"Content-Type": "application/json"});
    }
}
