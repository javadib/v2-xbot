"use strict";

module.exports = class wKV {
    ns;

    constructor(namespace) {
        this.ns = namespace;
    }

    async update(key, data) {
        let ns = this.ns;

        let oldData = JSON.parse(await ns.get(key));
        let newData = Object.assign({}, oldData, data);

        await ns.put(key, JSON.stringify(newData))

        return newData;
    }
}
