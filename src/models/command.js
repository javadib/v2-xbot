'use strict';

const Config = require('../config');

module.exports = {
    list: {
        "manage":{
            "prevId": "/start",
            "id": "manage",
            "title": "مدیریت",
            "icon": `🦹‍♂️`,
            "textIcon": `مدیریت 🦹‍♂️`,
            "tags": [],
            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "postEndpoint": '',
            "postFunc": '',
            "nextId": "",
            "buttons": ["managePlan", "manageServer", "managePayment"]
        },
        "managePlan":{
            "id": "managePlan",
            "title": "مدیریت پلن ها",
            "icon": `📦`,
            "textIcon": `📦 مدیریت پلن ها`,
            "tags": [],
            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "postEndpoint": '',
            "postFunc": '',
            "firstCommand": true,
            "lastCommand": false,
            "nextId": "",
            "commandIds": ["user.myConfig", "user.newOrder"]
        },
        "manageServer":{
            "id": "manageServer",
            "title": "مدیریت سرورها",
            "icon": `💻`,
            "textIcon": `💻 مدیریت سرورها`,
            "tags": [],
            "asButton": true,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "postEndpoint": '',
            "postFunc": '',
            "firstCommand": true,
            "lastCommand": false,
            "nextId": "",
            "commandIds": ["user.myConfig", "user.newOrder"]
        },
        "managePayment":{
            "id": "managePayment",
            "title": "مدیریت",
            "icon": `🦹‍`,
            "textIcon": `🦹 مدیریت`,
            "tags": [],
            "asButton": false,
            "body": ` به بخش مدیریت خوش آمدید 🌹
یکی از دستورات رو از طریق دکمه انتخاب کنید 👇`,
            "successText": ``,
            "helpText": ``,
            "postEndpoint": '',
            "postFunc": '',
            "firstCommand": true,
            "lastCommand": false,
            "nextId": "",
            "commandIds": ["user.myConfig", "user.newOrder"]
        }
    },

    find(id) {
        return this.list[id]
    },

    findByIds(ids = [], filter, options = {}) {
        let result = ids.map(id => this.list[id]).filter(p => p).filter(filter) || [];

        return result;
    }

}




