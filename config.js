"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeRecipient = exports.eventAuthority = exports.MPL_TOKEN_METADATA_PROGRAM_ID = exports.mintAuthority = exports.global = exports.RayLiqPoolv4 = exports.PUMP_PROGRAM = exports.connection = exports.rpc = exports.payer = void 0;
var web3_js_1 = require("@solana/web3.js");
var bs58_1 = require("bs58");
// PRIV KEY OF FEEPAYER
exports.payer = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(""));
// ENTER YOUR RPC
exports.rpc = "";
/* DONT TOUCH ANYTHING BELOW THIS */
exports.connection = new web3_js_1.Connection(exports.rpc, "confirmed");
exports.PUMP_PROGRAM = new web3_js_1.PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
exports.RayLiqPoolv4 = new web3_js_1.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
exports.global = new web3_js_1.PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
exports.mintAuthority = new web3_js_1.PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM");
exports.MPL_TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
exports.eventAuthority = new web3_js_1.PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
exports.feeRecipient = new web3_js_1.PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
