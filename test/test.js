"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestStorage {
    constructor() {
        this.Log = log4js.getLogger("TestStorage");
    }
    bootstrap(options) {
    }
    save(uri, data, options) {
        this.Log.info("saving page data on %s is success", uri);
    }
    exist(...uris) {
        return false;
    }
    release() {

    }
}
exports.TestStorage = TestStorage;