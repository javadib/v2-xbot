"use strict";

module.exports = {
    async update(ns, key, data) {
        let oldData = JSON.parse(await ns.get(key));
        let newData = Object.assign({}, oldData, data);

        await ns.put(key, JSON.stringify(newData))

        return newData;
    }
}
