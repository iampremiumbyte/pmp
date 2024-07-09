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
exports.sendBundle = exports.buyBundle = void 0;
var config_1 = require("../config");
var web3_js_1 = require("@solana/web3.js");
var createKeys_1 = require("./createKeys");
var jito_1 = require("./clients/jito");
var types_js_1 = require("jito-ts/dist/sdk/block-engine/types.js");
var prompt_sync_1 = require("prompt-sync");
var spl = require("@solana/spl-token");
var path_1 = require("path");
var fs_1 = require("fs");
var config_2 = require("./clients/config");
var bn_js_1 = require("bn.js");
var anchor = require("@coral-xyz/anchor");
var prompt = (0, prompt_sync_1.default)();
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
function buyBundle(batch) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, IDL_PumpFun, program, custom_IDL, CUSTOM_PROGRAM_ID, program_custom, bundledTxns, keypairs, keyInfo, existingData, lut, lookupTableAccount, ca, jitoTipAmt, bondingCurve, associatedBondingCurve, blockhash, txMainSwaps;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    provider = new anchor.AnchorProvider(new anchor.web3.Connection(config_1.rpc), new anchor.Wallet(config_1.payer), { commitment: "confirmed" });
                    IDL_PumpFun = JSON.parse(fs_1.default.readFileSync('./pumpfun-IDL.json', 'utf-8'));
                    program = new anchor.Program(IDL_PumpFun, config_1.PUMP_PROGRAM, provider);
                    custom_IDL = JSON.parse(fs_1.default.readFileSync('./custom-IDL.json', 'utf-8'));
                    CUSTOM_PROGRAM_ID = "5w4duVGX1zCdH9JwuN7r674SMeG9RMyhYAqYY3iEyw1P";
                    program_custom = new anchor.Program(custom_IDL, CUSTOM_PROGRAM_ID, provider);
                    bundledTxns = [];
                    if (batch === 1) {
                        keypairs = (0, createKeys_1.loadKeypairs1)();
                    }
                    else if (batch === 2) {
                        keypairs = (0, createKeys_1.loadKeypairs2)();
                    }
                    else {
                        console.log('Failed to load keypairs');
                        process.exit(0);
                    }
                    keyInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        existingData = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        keyInfo = JSON.parse(existingData);
                    }
                    lut = new web3_js_1.PublicKey(keyInfo.addressLUT.toString());
                    return [4 /*yield*/, config_1.connection.getAddressLookupTable(lut)];
                case 1:
                    lookupTableAccount = (_a.sent()).value;
                    if (lookupTableAccount == null) {
                        console.log("Lookup table account not found!");
                        process.exit(0);
                    }
                    ca = new web3_js_1.PublicKey(prompt("Address of your token: "));
                    jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * web3_js_1.LAMPORTS_PER_SOL;
                    bondingCurve = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), ca.toBytes()], program.programId)[0];
                    associatedBondingCurve = web3_js_1.PublicKey.findProgramAddressSync([
                        bondingCurve.toBytes(),
                        spl.TOKEN_PROGRAM_ID.toBytes(),
                        ca.toBytes(),
                    ], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0];
                    return [4 /*yield*/, config_1.connection.getLatestBlockhash()];
                case 2:
                    blockhash = (_a.sent()).blockhash;
                    return [4 /*yield*/, createWalletSwaps(blockhash, keypairs, lookupTableAccount, bondingCurve, associatedBondingCurve, ca, program_custom, jitoTipAmt)];
                case 3:
                    txMainSwaps = _a.sent();
                    bundledTxns.push.apply(bundledTxns, txMainSwaps);
                    // -------- step 4: send bundle --------
                    /*
                    // Simulate each transaction
                    for (const tx of bundledTxns) {
                        try {
                            const simulationResult = await connection.simulateTransaction(tx, { commitment: "processed" });
                            console.log(simulationResult);
            
                            if (simulationResult.value.err) {
                                console.error("Simulation error for transaction:", simulationResult.value.err);
                            } else {
                                console.log("Simulation success for transaction. Logs:");
                                simulationResult.value.logs?.forEach(log => console.log(log));
                            }
                        } catch (error) {
                            console.error("Error during simulation:", error);
                        }
                    }
                    */
                    return [4 /*yield*/, sendBundle(bundledTxns)];
                case 4:
                    // -------- step 4: send bundle --------
                    /*
                    // Simulate each transaction
                    for (const tx of bundledTxns) {
                        try {
                            const simulationResult = await connection.simulateTransaction(tx, { commitment: "processed" });
                            console.log(simulationResult);
            
                            if (simulationResult.value.err) {
                                console.error("Simulation error for transaction:", simulationResult.value.err);
                            } else {
                                console.log("Simulation success for transaction. Logs:");
                                simulationResult.value.logs?.forEach(log => console.log(log));
                            }
                        } catch (error) {
                            console.error("Error during simulation:", error);
                        }
                    }
                    */
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.buyBundle = buyBundle;
function createWalletSwaps(blockhash, keypairs, lut, bondingCurve, associatedBondingCurve, mint, program, jitoTipAmt) {
    return __awaiter(this, void 0, void 0, function () {
        var txsSigned, chunkedKeypairs, keyInfo, existingData, chunkIndex, chunk, instructionsForChunk, i, keypair, ataAddress, keypairInfo, sol_amount, max_sol_cost, buyIx, message, versionedTx, serializedMsg, _i, chunk_1, kp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    txsSigned = [];
                    chunkedKeypairs = chunkArray(keypairs, 5);
                    keyInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        existingData = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        keyInfo = JSON.parse(existingData);
                    }
                    chunkIndex = 0;
                    _a.label = 1;
                case 1:
                    if (!(chunkIndex < chunkedKeypairs.length)) return [3 /*break*/, 8];
                    chunk = chunkedKeypairs[chunkIndex];
                    instructionsForChunk = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < chunk.length)) return [3 /*break*/, 6];
                    keypair = chunk[i];
                    console.log("Processing keypair ".concat(i + 1, "/").concat(chunk.length, ":"), keypair.publicKey.toString());
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(mint, keypair.publicKey)];
                case 3:
                    ataAddress = _a.sent();
                    keypairInfo = keyInfo[keypair.publicKey.toString()];
                    if (!keypairInfo) {
                        console.log("No key info found for keypair: ".concat(keypair.publicKey.toString()));
                        return [3 /*break*/, 5];
                    }
                    sol_amount = new bn_js_1.default(keypairInfo.solAmount * web3_js_1.LAMPORTS_PER_SOL);
                    max_sol_cost = new bn_js_1.default(100000 * web3_js_1.LAMPORTS_PER_SOL);
                    return [4 /*yield*/, program.methods
                            .pumpfunBuy(sol_amount, max_sol_cost)
                            .accounts({
                            global: config_1.global,
                            feeRecipient: config_1.feeRecipient,
                            mint: mint,
                            bondingCurve: bondingCurve,
                            associatedBondingCurve: associatedBondingCurve,
                            associatedUser: ataAddress,
                            user: keypair.publicKey,
                            fromAccount: config_1.payer.publicKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            eventAuthority: config_1.eventAuthority,
                            program: config_1.PUMP_PROGRAM,
                        })
                            .instruction()];
                case 4:
                    buyIx = _a.sent();
                    instructionsForChunk.push(buyIx);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    if (chunkIndex === chunkedKeypairs.length - 1) {
                        instructionsForChunk.push(web3_js_1.SystemProgram.transfer({
                            fromPubkey: config_1.payer.publicKey,
                            toPubkey: (0, config_2.getRandomTipAccount)(),
                            lamports: BigInt(jitoTipAmt),
                        }));
                    }
                    message = new web3_js_1.TransactionMessage({
                        payerKey: config_1.payer.publicKey,
                        recentBlockhash: blockhash,
                        instructions: instructionsForChunk,
                    }).compileToV0Message([lut]);
                    versionedTx = new web3_js_1.VersionedTransaction(message);
                    serializedMsg = versionedTx.serialize();
                    console.log("Txn size:", serializedMsg.length);
                    if (serializedMsg.length > 1232) {
                        console.log('tx too big');
                    }
                    // Sign with the wallet for tip on the last instruction
                    for (_i = 0, chunk_1 = chunk; _i < chunk_1.length; _i++) {
                        kp = chunk_1[_i];
                        if (kp.publicKey.toString() in keyInfo) {
                            versionedTx.sign([kp]);
                        }
                    }
                    versionedTx.sign([config_1.payer]);
                    txsSigned.push(versionedTx);
                    _a.label = 7;
                case 7:
                    chunkIndex++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, txsSigned];
            }
        });
    });
}
function chunkArray(array, size) {
    return Array.from({ length: Math.ceil(array.length / size) }, function (v, i) {
        return array.slice(i * size, i * size + size);
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
exports.sendBundle = sendBundle;
