"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSenderKey = generateSenderKey;
exports.generateSenderKeyId = generateSenderKeyId;
exports.generateSenderSigningKey = generateSenderSigningKey;
const nodeCrypto = __importStar(require("crypto"));
/* @ts-ignore */
const curve_1 = require("libsignal/src/curve");
function generateSenderKey() {
    return nodeCrypto.randomBytes(32);
}
function generateSenderKeyId() {
    return nodeCrypto.randomInt(2147483647);
}
function generateSenderSigningKey(key) {
    if (!key) {
        key = (0, curve_1.generateKeyPair)();
    }
    return {
        public: Buffer.from(key.pubKey),
        private: Buffer.from(key.privKey),
    };
}
