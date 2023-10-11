# v2-xBot

[![](https://img.shields.io/github/v/release/javadib/v2-xbot.svg)](https://github.com/javadib/v2-xbot/releases)
[![Downloads](https://img.shields.io/github/downloads/javadib/v2-xbot/total.svg)](#)
[![License](https://img.shields.io/badge/license-GPL%20V3-blue.svg?longCache=true)](https://www.gnu.org/licenses/gpl-3.0.en.html)

v2-xBot is serverless (cloudflare worker) bot to sale & VPN Accounting system.
#

# Features
- [x] Add new order
- [x] Order history
- [x] Management
  - Manage (CRUD) `Panels` in bot
  - Manage (CRUD) `Servers` in bot
  - Manage (CRUD) `Payments` methods in bot
- [ ] Apps & link (for users)
- [ ] User Profile
- [ ] Affiliate system
#

# Get Started
0) Create a cloudflare worker, Create a KV namespace & bind to `db` variable
1) Download [Latest Version](https://github.com/javadib/v2-xbot/releases/latest/download/dist.zip)
2) Extract `dist.zip` and open `index.js` with suitable editor.
3) Edit `bot section` with your variables (search `config.js` in file):
   - Replace `YOUR_BOT_NAME` with your bot name (Optional).
   - Replace `11111111` with your Telegram Admin ID.
   - Replace `@YOUR_SUPPORT_USERNAME` with your support Telegram username (Remember put `@` at the first).
   - Replace `YOUR_BOT_TOKEN` with your Telegram bot token.
4) Replace whole codes with default cloudflare worker code.
5) Save and deploy worker and send a `GET ` request to `/registerWebhook` path to register webhook of your bot. make sure you see `ok` in response.
6) Send message to bot with admin account and manage all you need.
#
![1](./docs/images/register-result.png)

9) Done!
#




# Custom Edition
Under Development ...
#





#

**Buy Me a Coffee :**
- USDT (TRC20): `TBHBELagtDq9c5cmz4HVjcRcKNiXkxr8Ub`
