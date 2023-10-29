"use strict";

const pkg = require('../package.json');

const config = {
    commands: {
        silentButton: "/silentButton",
        updateNewOrderButtons: "/updateNewOrderButtons"
    },
    bot: {
        name: "V2xBot",
        adminId: Number(adminId),
        tlgSupport: tlgSupport,
        token: botToken,
        webHook: '/endpoint',
        secret: "123456789wertyuiopxcvbnmDGHJKRTYIO", // A-Z, a-z, 0-9, _ and -
        aboutBot() {
            return `✳️✳✳️✳️
            
${pkg.name} 
${pkg.description}

Current version: ${pkg.version}

${pkg.repository}

Join channel 🤙: https://t.me/v2_xBot
`
        },
        welcomeMessage() {
            return `سلام به شما دوست گرامی! 🌟
به ربات V2xBot خوش آمدید! 🎉 از اینکه اینجا هستید، بسیار خوشحالیم.

ما اینجا هستیم تا به شما کمک کنیم و هر سوال یا درخواستی که دارید را رفع کنیم.

ممنون از شما که به ما پیوسته‌اید و امیدواریم که اینجا احساس خوبی داشته باشید. اگر هر سوال یا درخواستی دارید، لطفاً به ما بگوید. خوش آمدید! 🌺`
        },
        accessDenied(actName = "انجام این عمل") {
            return `شما دسترسی لازم برای ${actName} رو ندارید 🙏`
        }
    }
}


module.exports = config;
