"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLUT = exports.extendLUT = void 0;
var web3_js_1 = require("@solana/web3.js");
var fs_1 = require("fs");
var path_1 = require("path");
var config_1 = require("../config");
var prompt_sync_1 = require("prompt-sync");
var jito_1 = require("./clients/jito");
var types_js_1 = require("jito-ts/dist/sdk/block-engine/types.js");
var config_2 = require("./clients/config");
var LookupTableProvider_1 = require("./clients/LookupTableProvider");
var createKeys_1 = require("./createKeys");
var spl = require("@solana/spl-token");
var pumpfun_IDL_json_1 = require("../pumpfun-IDL.json");
var anchor_1 = require("@coral-xyz/anchor");
var bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
var prompt = (0, prompt_sync_1.default)();
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
var provider = new anchor_1.AnchorProvider(config_1.connection, config_1.payer, {});
(0, anchor_1.setProvider)(provider);
var program = new anchor_1.Program(pumpfun_IDL_json_1.default, config_1.PUMP_PROGRAM);
function extendLUT() {
    return __awaiter(this, void 0, void 0, function () {
        var jitoTipAmt, poolInfo, data, bundledTxns1, accounts, lut, lookupTableAccount, mintKp, mintAuthority, MPL_TOKEN_METADATA_PROGRAM_ID, global, bondingCurve, metadata, associatedBondingCurve, eventAuthority, feeRecipient, keypairs1, _i, keypairs1_1, keypair, ataToken, keypairs2, _a, keypairs2_1, keypair, ataToken, ataTokenpayer, extendLUTixs1, extendLUTixs2, extendLUTixs3, extendLUTixs4, extendLUTixs5, accountChunks, i, chunk, extendInstruction, block1, extend1, extend2, extend3, extend4, extend5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * web3_js_1.LAMPORTS_PER_SOL;
                    poolInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        data = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        poolInfo = JSON.parse(data);
                    }
                    bundledTxns1 = [];
                    accounts = [];
                    lut = new web3_js_1.PublicKey(poolInfo.addressLUT.toString());
                    return [4 /*yield*/, config_1.connection.getAddressLookupTable(lut)];
                case 1:
                    lookupTableAccount = (_b.sent()).value;
                    if (lookupTableAccount == null) {
                        console.log("Lookup table account not found!");
                        process.exit(0);
                    }
                    mintKp = web3_js_1.Keypair.generate();
                    console.log("Mint: ".concat(mintKp.publicKey.toString()));
                    poolInfo.mint = mintKp.publicKey.toString();
                    poolInfo.mintPk = bytes_1.bs58.encode(mintKp.secretKey);
                    fs_1.default.writeFileSync(keyInfoPath, JSON.stringify(poolInfo, null, 2));
                    mintAuthority = new web3_js_1.PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM");
                    MPL_TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
                    global = new web3_js_1.PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
                    bondingCurve = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), mintKp.publicKey.toBytes()], program.programId)[0];
                    metadata = web3_js_1.PublicKey.findProgramAddressSync([
                        Buffer.from("metadata"),
                        MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(),
                        mintKp.publicKey.toBytes(),
                    ], MPL_TOKEN_METADATA_PROGRAM_ID)[0];
                    associatedBondingCurve = web3_js_1.PublicKey.findProgramAddressSync([
                        bondingCurve.toBytes(),
                        spl.TOKEN_PROGRAM_ID.toBytes(),
                        mintKp.publicKey.toBytes(),
                    ], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0];
                    eventAuthority = new web3_js_1.PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
                    feeRecipient = new web3_js_1.PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
                    // These values vary based on the new market created
                    accounts.push(spl.ASSOCIATED_TOKEN_PROGRAM_ID, spl.TOKEN_PROGRAM_ID, MPL_TOKEN_METADATA_PROGRAM_ID, mintAuthority, global, program.programId, config_1.PUMP_PROGRAM, metadata, associatedBondingCurve, bondingCurve, eventAuthority, web3_js_1.SystemProgram.programId, web3_js_1.SYSVAR_RENT_PUBKEY, mintKp.publicKey, feeRecipient); // DO NOT ADD PROGRAM OR JITO TIP ACCOUNT??
                    keypairs1 = (0, createKeys_1.loadKeypairs1)();
                    _i = 0, keypairs1_1 = keypairs1;
                    _b.label = 2;
                case 2:
                    if (!(_i < keypairs1_1.length)) return [3 /*break*/, 5];
                    keypair = keypairs1_1[_i];
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(mintKp.publicKey, keypair.publicKey)];
                case 3:
                    ataToken = _b.sent();
                    accounts.push(keypair.publicKey, ataToken);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    keypairs2 = (0, createKeys_1.loadKeypairs2)();
                    _a = 0, keypairs2_1 = keypairs2;
                    _b.label = 6;
                case 6:
                    if (!(_a < keypairs2_1.length)) return [3 /*break*/, 9];
                    keypair = keypairs2_1[_a];
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(mintKp.publicKey, keypair.publicKey)];
                case 7:
                    ataToken = _b.sent();
                    accounts.push(keypair.publicKey, ataToken);
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, spl.getAssociatedTokenAddress(mintKp.publicKey, config_1.payer.publicKey)];
                case 10:
                    ataTokenpayer = _b.sent();
                    // Add just in case
                    accounts.push(config_1.payer.publicKey, ataTokenpayer, lut, spl.NATIVE_MINT);
                    extendLUTixs1 = [];
                    extendLUTixs2 = [];
                    extendLUTixs3 = [];
                    extendLUTixs4 = [];
                    extendLUTixs5 = [];
                    accountChunks = Array.from({ length: Math.ceil(accounts.length / 30) }, function (v, i) { return accounts.slice(i * 30, (i + 1) * 30); });
                    console.log("Num of chunks:", accountChunks.length);
                    console.log("Num of accounts:", accounts.length);
                    for (i = 0; i < accountChunks.length; i++) {
                        chunk = accountChunks[i];
                        extendInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
                            lookupTable: lut,
                            authority: config_1.payer.publicKey,
                            payer: config_1.payer.publicKey,
                            addresses: chunk,
                        });
                        if (i == 0) {
                            extendLUTixs1.push(extendInstruction);
                            console.log("Chunk:", i);
                        }
                        else if (i == 1) {
                            extendLUTixs2.push(extendInstruction);
                            console.log("Chunk:", i);
                        }
                        else if (i == 2) {
                            extendLUTixs3.push(extendInstruction);
                            console.log("Chunk:", i);
                        }
                        else if (i == 3) {
                            extendLUTixs4.push(extendInstruction);
                            console.log("Chunk:", i);
                        }
                        else if (i == 4) {
                            extendLUTixs5.push(extendInstruction);
                            console.log("Chunk:", i);
                        }
                    }
                    // Add the jito tip to the last txn
                    extendLUTixs5.push(web3_js_1.SystemProgram.transfer({
                        fromPubkey: config_1.payer.publicKey,
                        toPubkey: (0, config_2.getRandomTipAccount)(),
                        lamports: BigInt(jitoTipAmt),
                    }));
                    return [4 /*yield*/, config_1.connection.getLatestBlockhash()];
                case 11:
                    block1 = (_b.sent()).blockhash;
                    return [4 /*yield*/, buildTxn(extendLUTixs1, block1, lookupTableAccount)];
                case 12:
                    extend1 = _b.sent();
                    return [4 /*yield*/, buildTxn(extendLUTixs2, block1, lookupTableAccount)];
                case 13:
                    extend2 = _b.sent();
                    return [4 /*yield*/, buildTxn(extendLUTixs3, block1, lookupTableAccount)];
                case 14:
                    extend3 = _b.sent();
                    return [4 /*yield*/, buildTxn(extendLUTixs4, block1, lookupTableAccount)];
                case 15:
                    extend4 = _b.sent();
                    return [4 /*yield*/, buildTxn(extendLUTixs5, block1, lookupTableAccount)];
                case 16:
                    extend5 = _b.sent();
                    bundledTxns1.push(extend1, extend2, extend3, extend4, extend5);
                    // -------- step 7: send bundle --------
                    return [4 /*yield*/, sendBundle(bundledTxns1)];
                case 17:
                    // -------- step 7: send bundle --------
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.extendLUT = extendLUT;
function createLUT() {
    return __awaiter(this, void 0, void 0, function () {
        var jitoTipAmt, poolInfo, data, bundledTxns, createLUTixs, _a, create, lut, _b, _c, addressesMain, lookupTablesMain1, blockhash, messageMain1, createLUT, serializedMsg;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * web3_js_1.LAMPORTS_PER_SOL;
                    poolInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        data = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        poolInfo = JSON.parse(data);
                    }
                    bundledTxns = [];
                    createLUTixs = [];
                    _c = (_b = web3_js_1.AddressLookupTableProgram).createLookupTable;
                    _d = {
                        authority: config_1.payer.publicKey,
                        payer: config_1.payer.publicKey
                    };
                    return [4 /*yield*/, config_1.connection.getSlot("finalized")];
                case 1:
                    _a = _c.apply(_b, [(_d.recentSlot = _e.sent(),
                            _d)]), create = _a[0], lut = _a[1];
                    createLUTixs.push(create, web3_js_1.SystemProgram.transfer({
                        fromPubkey: config_1.payer.publicKey,
                        toPubkey: (0, config_2.getRandomTipAccount)(),
                        lamports: jitoTipAmt,
                    }));
                    addressesMain = [];
                    createLUTixs.forEach(function (ixn) {
                        ixn.keys.forEach(function (key) {
                            addressesMain.push(key.pubkey);
                        });
                    });
                    lookupTablesMain1 = LookupTableProvider_1.lookupTableProvider.computeIdealLookupTablesForAddresses(addressesMain);
                    return [4 /*yield*/, config_1.connection.getLatestBlockhash()];
                case 2:
                    blockhash = (_e.sent()).blockhash;
                    messageMain1 = new web3_js_1.TransactionMessage({
                        payerKey: config_1.payer.publicKey,
                        recentBlockhash: blockhash,
                        instructions: createLUTixs,
                    }).compileToV0Message(lookupTablesMain1);
                    createLUT = new web3_js_1.VersionedTransaction(messageMain1);
                    // Append new LUT info
                    poolInfo.addressLUT = lut.toString(); // Using 'addressLUT' as the field name
                    try {
                        serializedMsg = createLUT.serialize();
                        console.log('Txn size:', serializedMsg.length);
                        if (serializedMsg.length > 1232) {
                            console.log('tx too big');
                        }
                        createLUT.sign([config_1.payer]);
                    }
                    catch (e) {
                        console.log(e, 'error signing createLUT');
                        process.exit(0);
                    }
                    // Write updated content back to poolInfo.json
                    fs_1.default.writeFileSync(keyInfoPath, JSON.stringify(poolInfo, null, 2));
                    // Push to bundle
                    bundledTxns.push(createLUT);
                    // -------- step 3: SEND BUNDLE --------
                    return [4 /*yield*/, sendBundle(bundledTxns)];
                case 3:
                    // -------- step 3: SEND BUNDLE --------
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createLUT = createLUT;
function buildTxn(extendLUTixs, blockhash, lut) {
    return __awaiter(this, void 0, void 0, function () {
        var messageMain, txn, serializedMsg, serializedMsg;
        return __generator(this, function (_a) {
            messageMain = new web3_js_1.TransactionMessage({
                payerKey: config_1.payer.publicKey,
                recentBlockhash: blockhash,
                instructions: extendLUTixs,
            }).compileToV0Message([lut]);
            txn = new web3_js_1.VersionedTransaction(messageMain);
            try {
                serializedMsg = txn.serialize();
                console.log('Txn size:', serializedMsg.length);
                if (serializedMsg.length > 1232) {
                    console.log('tx too big');
                }
                txn.sign([config_1.payer]);
            }
            catch (e) {
                serializedMsg = txn.serialize();
                console.log('txn size:', serializedMsg.length);
                console.log(e, 'error signing extendLUT');
                process.exit(0);
            }
            return [2 /*return*/, txn];
        });
    });
}
function sendBundle(bundledTxns) {
    return __awaiter(this, void 0, void 0, function () {
        var bundleId, error_1, err;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, jito_1.searcherClient.sendBundle(new types_js_1.Bundle(bundledTxns, bundledTxns.length))];
                case 1:
                    bundleId = _b.sent();
                    console.log("Bundle ".concat(bundleId, " sent."));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    err = error_1;
                    console.error("Error sending bundle:", err.message);
                    if ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes('Bundle Dropped, no connected leader up soon')) {
                        console.error("Error sending bundle: Bundle Dropped, no connected leader up soon.");
                    }
                    else {
                        console.error("An unexpected error occurred:", err.message);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/*
async function createAndSignVersionedTxNOLUT(
    instructionsChunk: TransactionInstruction[],
    blockhash: Blockhash | string,
): Promise<VersionedTransaction> {
    const addressesMain: PublicKey[] = [];
    instructionsChunk.forEach((ixn) => {
        ixn.keys.forEach((key) => {
            addressesMain.push(key.pubkey);
        });
    });

    const lookupTablesMain1 =
        lookupTableProvider.computeIdealLookupTablesForAddresses(addressesMain);

    const message = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: instructionsChunk,
    }).compileToV0Message(lookupTablesMain1);

    const versionedTx = new VersionedTransaction(message);
    const serializedMsg = versionedTx.serialize();

    console.log("Txn size:", serializedMsg.length);
    if (serializedMsg.length > 1232) { console.log('tx too big'); }
    versionedTx.sign([wallet]);

    
    // Simulate each txn
    const simulationResult = await connection.simulateTransaction(versionedTx, { commitment: "processed" });

    if (simulationResult.value.err) {
    console.log("Simulation error:", simulationResult.value.err);
    } else {
    console.log("Simulation success. Logs:");
    simulationResult.value.logs?.forEach(log => console.log(log));
    }
    

    return versionedTx;
}
*/
