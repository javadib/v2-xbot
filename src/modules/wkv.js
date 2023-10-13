"use strict";

module.exports = class wKV {
    ns;

    constructor(namespace) {
        this.ns = namespace;
    }

    async list(options = {}) {
        return this.ns.list(options)
    };

    async get(key, options = {}) {
        return this.ns.get(key, options)
    };

    async getWithMetadata(key) {
        return this.ns.getWithMetadata(key)
    };


    // NAMESPACE.put(key, value, {expiration: secondsSinceEpoch}) :
    // NAMESPACE.put(key, value, {expirationTtl: secondsFromNow}) :
    async put(key, value, options = {}) {
        // let val = typeof value === 'object' ? JSON.stringify(value) : value;
        let metadata = options.metadata;

        return metadata ? this.ns.put(key, JSON.stringify(value), {
            metadata: metadata,
        }) : this.ns.put(key, JSON.stringify(value))
    };

    async delete(key) {
        return this.ns.delete(key)
    };

    async update(key, data, options = {}) {
        let oldData = JSON.parse(await this.get(key));
        let newData = Object.assign({}, oldData, data);

        await this.put(key, newData, options)

        return newData;
    }

    async push(key, data, options = {}) {
        let oldData = await this.get(key, {type: "json"}) || [];
        oldData.push(data);

        await this.put(key, oldData)

        return oldData;
    }
}
