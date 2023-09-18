"use strict";

module.exports = class wKV {
    ns;

    constructor(namespace) {
        this.ns = namespace;
    }

    async get(key) {
        return this.ns.get(key)
    };

    // NAMESPACE.put(key, value, {expiration: secondsSinceEpoch}) :
    // NAMESPACE.put(key, value, {expirationTtl: secondsFromNow}) :
    async put(key, value, options = {}) {
        let val = typeof value === 'object' ? JSON.stringify(value) : value;

        return this.ns.put(key, val)
    };

    async delete(key) {
        return this.ns.delete(key)
    };

    async update(key, data) {
        let ns = this.ns;

        let oldData = JSON.parse(await ns.get(key));
        let newData = Object.assign({}, oldData, data);

        await ns.put(key, JSON.stringify(newData))

        return newData;
    }
}
