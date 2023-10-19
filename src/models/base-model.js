"use strict";

export class BaseModel {
    constructor() {
        if (this.constructor == BaseModel) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
}
