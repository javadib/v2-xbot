"use strict";

export class BaseModel {
    constructor() {
    }

    toInput(obj, options = {}) {
        let {separator = ':'} = options;
        return Object.keys(obj).reduce((pv, cv, i) => {
            pv += `${cv} ${separator} ${obj[cv]}\n`;

            return pv;
        }, '')
    }

    async parseInput(input, options = {}) {
        let {separator = ':'} = options;

        let result = input.split('\n').reduce((pv, cv, i) => {
            let split = cv.split(separator);

            if (split.length < 2) return pv;

            pv[split[0].trim()] = split.slice(1).join(separator).trim();

            return pv;
        }, {})

        return result;
    }
}
