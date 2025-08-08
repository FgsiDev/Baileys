"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSingleFileAuthState = void 0;
const async_lock_1 = __importDefault(require("async-lock"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const WAProto_1 = require("../../WAProto");
const auth_utils_1 = require("./auth-utils");
const generics_1 = require("./generics");
const fileLock = new async_lock_1.default({ maxPending: Infinity });
const KEY_MAP = {
    "pre-key": "preKeys",
    session: "sessions",
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
};
const useSingleFileAuthState = async (filename) => {
    let creds;
    let keys = {};
    const writeData = (data, file) => {
        const filePath = (0, path_1.join)(fixFileName(file));
        return fileLock.acquire(filePath, () => (0, promises_1.writeFile)((0, path_1.join)(filePath), JSON.stringify(data, generics_1.BufferJSON.replacer, 2)));
    };
    const readData = async (file) => {
        try {
            const filePath = (0, path_1.join)(fixFileName(file));
            const data = await fileLock.acquire(filePath, () => (0, promises_1.readFile)(filePath, { encoding: "utf-8" }));
            return JSON.parse(data, generics_1.BufferJSON.reviver);
        }
        catch (error) {
            return null;
        }
    };
    const removeData = async (file) => {
        try {
            const filePath = (0, path_1.join)(fixFileName(file));
            await fileLock.acquire(filePath, () => (0, promises_1.unlink)(filePath));
        }
        catch (_a) { }
    };
    const fixFileName = (file) => { var _a; return (_a = file === null || file === void 0 ? void 0 : file.replace(/\//g, "__")) === null || _a === void 0 ? void 0 : _a.replace(/:/g, "-"); };
    const fileData = await readData(fixFileName(filename));
    if (fileData)
        ({ creds, keys } = fileData);
    else
        (0, auth_utils_1.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict, id) => {
                        var _a;
                        let value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                        if (value) {
                            if (type === "app-state-sync-key") {
                                value = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: async (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    writeData({ creds, keys }, filename);
                },
            },
        },
        saveState: () => {
            return writeData({ creds, keys }, filename);
        },
    };
};
exports.useSingleFileAuthState = useSingleFileAuthState;
