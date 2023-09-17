"use strict";

module.exports = class wFetch {
    constructor() {
    }

    #buildHeaders = (obj = {}) => {
        const h = new Headers();
        // h.append("Content-Type", "application/json");

        Object.keys(obj).forEach(k => h.append(k, obj[k]))

        return h;
    }

    async request(url, method, rawJson, headers = {},  options = {}) {
        const opt = {
            method: method,
            headers: this.#buildHeaders(headers),
            redirect: options.redirect || 'follow'
        };

        if (rawJson) {
            opt.body = JSON.stringify(rawJson)
        }

        return fetch(url, opt)
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));
    }
}
