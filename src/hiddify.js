"use strict";

const Plan = require("./models/plan");
const Server = require("./models/server");
const Payment = require("./models/payment");
const wFetch = require("./modules/wfetch");


module.exports = {
    baseUrl: "https://v2proxy.rew0rk.online/",

    async createAccount(usrSession, message, options = {}) {
        let plan = Plan.findById(usrSession[Plan.seed.cmd])?.model;
        let server = Server.findById(usrSession[Server.seed.cmd])?.model;
        let payment = Payment.findById(usrSession[Payment.seed.cmd])?.model;

        let url = new URL("/hiddify/create", this.baseUrl);
        let name = options.customName || `${message.chat.id}`;

        let raw = {
            "baseUrl": url,
            "name": name,
            "volume": plan.volume,
            "maxDays": plan.maxDays,
            // "mode": "no_reset",
            "telegramId": message.chat.id,
            // "enable": "n",
            "comment": "fucky day"
        }

        return new wFetch().request(url, 'POST', raw, {"Content-Type": "application/json"});
    }
}
