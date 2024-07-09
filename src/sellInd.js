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
exports.sellXKeypairRAY = void 0;
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
var poolKeysReassigned_1 = require("./clients/poolKeysReassigned");
var prompt = (0, prompt_sync_1.default)();
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
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
function sellXKeypairRAY() {
    return __awaiter(this, void 0, void 0, function () {
        var bundledTxns, poolInfo, data, lut, lookupTableAccount, batch, marketID, supplyPercent, jitoTipAmt, keypair, keys, blockhash, ixs1, KeypairwSolATA, wsolATA, message, fundtxn, serializedMsg, sellAmt, KeypairTokenATA, sellIxs, message2, selltxn, serializedMsg2, closeWSOL, message3, closetxn, serializedMsg3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bundledTxns = [];
                    poolInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        data = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        poolInfo = JSON.parse(data);
                    }
                    lut = new web3_js_1.PublicKey(poolInfo.addressLUT.toString());
                    return [4 /*yield*/, config_1.connection.getAddressLookupTable(lut)];
                case 1:
                    lookupTableAccount = (_a.sent()).value;
                    if (lookupTableAccount == null) {
                        console.log("Lookup table account not found!");
                        process.exit(0);
                    }
                    batch = +prompt('Select Keypair to sell (1-48): ') - 1;
                    marketID = new web3_js_1.PublicKey(prompt('Enter marketID of your migration: '));
                    supplyPercent = +prompt('Percentage to sell (Ex. 1 for 1%): ') / 100;
                    jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * web3_js_1.LAMPORTS_PER_SOL;
                    if (batch < 24) {
                        keypair = (0, createKeys_1.loadKeypairs1)()[batch];
                    }
                    else if (batch >= 24) {
                        batch = batch - 24;
                        keypair = (0, createKeys_1.loadKeypairs2)()[batch];
                    }
                    else {
                        console.log('Invalid keypair.');
                        process.exit(0);
                    }
                    return [4 /*yield*/, (0, poolKeysReassigned_1.derivePoolKeys)(marketID)];
                case 2:
                    keys = _a.sent();
                    if (keys == null) {
                        console.log('Keys not found!');
                        process.exit(0);
                    }
                    return [4 /*yield*/, config_1.connection.getLatestBlockhash()];
                case 3:
                    blockhash = (_a.sent()).blockhash;
                    ixs1 = [];
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(spl.NATIVE_MINT, keypair.publicKey)];
                case 4:
                    KeypairwSolATA = _a.sent();
                    wsolATA = spl.createAssociatedTokenAccountIdempotentInstruction(config_1.payer.publicKey, KeypairwSolATA, keypair.publicKey, spl.NATIVE_MINT);
                    ixs1.push(wsolATA, web3_js_1.SystemProgram.transfer({
                        fromPubkey: config_1.payer.publicKey,
                        toPubkey: (0, config_2.getRandomTipAccount)(),
                        lamports: BigInt(jitoTipAmt),
                    }));
                    message = new web3_js_1.TransactionMessage({
                        payerKey: config_1.payer.publicKey,
                        recentBlockhash: blockhash,
                        instructions: ixs1,
                    }).compileToV0Message([lookupTableAccount]);
                    fundtxn = new web3_js_1.VersionedTransaction(message);
                    serializedMsg = fundtxn.serialize();
                    console.log("Txn size:", serializedMsg.length);
                    if (serializedMsg.length > 1232) {
                        console.log('tx too big');
                    }
                    fundtxn.sign([config_1.payer]); // Sign with payer first
                    bundledTxns.push(fundtxn);
                    return [4 /*yield*/, getSellBalance(keypair, keys.quoteMint, supplyPercent)];
                case 5:
                    sellAmt = _a.sent();
                    if (sellAmt > 0) {
                        console.log('Selling', (sellAmt / Math.pow(10, 6)).toFixed(6), ' tokens from keypair', batch);
                    }
                    else {
                        console.log('0 Tokens to sell on keypair', batch);
                        console.log('Returning...');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(keys.quoteMint, keypair.publicKey)];
                case 6:
                    KeypairTokenATA = _a.sent();
                    sellIxs = makeSwap(keys, KeypairwSolATA, KeypairTokenATA, true, keypair, sellAmt).sellIxs;
                    message2 = new web3_js_1.TransactionMessage({
                        payerKey: keypair.publicKey,
                        recentBlockhash: blockhash,
                        instructions: sellIxs,
                    }).compileToV0Message([lookupTableAccount]);
                    selltxn = new web3_js_1.VersionedTransaction(message2);
                    serializedMsg2 = selltxn.serialize();
                    console.log("Txn size:", serializedMsg2.length);
                    if (serializedMsg2.length > 1232) {
                        console.log('tx too big');
                    }
                    selltxn.sign([keypair]); // Sign with payer first
                    bundledTxns.push(selltxn);
                    closeWSOL = spl.createCloseAccountInstruction(KeypairwSolATA, // WSOL account to close
                    config_1.payer.publicKey, // Destination for remaining SOL
                    keypair.publicKey);
                    message3 = new web3_js_1.TransactionMessage({
                        payerKey: keypair.publicKey,
                        recentBlockhash: blockhash,
                        instructions: [closeWSOL],
                    }).compileToV0Message([lookupTableAccount]);
                    closetxn = new web3_js_1.VersionedTransaction(message3);
                    serializedMsg3 = closetxn.serialize();
                    console.log("Txn size:", serializedMsg3.length);
                    if (serializedMsg3.length > 1232) {
                        console.log('tx too big');
                    }
                    closetxn.sign([keypair]); // Sign with payer first
                    bundledTxns.push(closetxn);
                    // Send bundleee
                    return [4 /*yield*/, sendBundle(bundledTxns)];
                case 7:
                    // Send bundleee
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.sellXKeypairRAY = sellXKeypairRAY;
function getSellBalance(keypair, mint, supplyPercent) {
    return __awaiter(this, void 0, void 0, function () {
        var amount, tokenAccountPubKey, balance, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tokenAccountPubKey = spl.getAssociatedTokenAddressSync(mint, keypair.publicKey);
                    return [4 /*yield*/, config_1.connection.getTokenAccountBalance(tokenAccountPubKey)];
                case 1:
                    balance = _a.sent();
                    amount = Math.floor(Number(balance.value.amount) * supplyPercent);
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    amount = 0;
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, amount];
            }
        });
    });
}
;
function makeSwap(poolKeys, wSolATA, TokenATA, reverse, keypair, amountIn, minAmountOut) {
    if (minAmountOut === void 0) { minAmountOut = 0; }
    var account1 = spl.TOKEN_PROGRAM_ID; // token program
    var account2 = poolKeys.id; // amm id  writable
    var account3 = poolKeys.authority; // amm authority
    var account4 = poolKeys.openOrders; // amm open orders  writable
    var account5 = poolKeys.targetOrders; // amm target orders  writable
    var account6 = poolKeys.baseVault; // pool coin token account  writable  AKA baseVault
    var account7 = poolKeys.quoteVault; // pool pc token account  writable   AKA quoteVault
    var account8 = poolKeys.marketProgramId; // serum program id
    var account9 = poolKeys.marketId; //   serum market  writable
    var account10 = poolKeys.marketBids; // serum bids  writable
    var account11 = poolKeys.marketAsks; // serum asks  writable
    var account12 = poolKeys.marketEventQueue; // serum event queue  writable
    var account13 = poolKeys.marketBaseVault; // serum coin vault  writable     AKA marketBaseVault
    var account14 = poolKeys.marketQuoteVault; //   serum pc vault  writable    AKA marketQuoteVault
    var account15 = poolKeys.marketAuthority; // serum vault signer       AKA marketAuthority
    var inAmount = amountIn;
    var minAmount = minAmountOut;
    var account16 = wSolATA; // user source token account  writable
    var account17 = TokenATA; // user dest token account   writable
    var account18 = keypair.publicKey; // user owner (signer)  writable
    if (reverse === true) {
        account16 = TokenATA;
        account17 = wSolATA;
    }
    var args = {
        amountIn: new bn_js_1.default(inAmount.toString()),
        minimumAmountOut: new bn_js_1.default(minAmount)
    };
    var buffer = Buffer.alloc(16);
    args.amountIn.toArrayLike(Buffer, 'le', 8).copy(buffer, 0);
    args.minimumAmountOut.toArrayLike(Buffer, 'le', 8).copy(buffer, 8);
    var prefix = Buffer.from([0x09]);
    var instructionData = Buffer.concat([prefix, buffer]);
    var accountMetas = [
        { pubkey: account1, isSigner: false, isWritable: false },
        { pubkey: account2, isSigner: false, isWritable: true },
        { pubkey: account3, isSigner: false, isWritable: false },
        { pubkey: account4, isSigner: false, isWritable: true },
        { pubkey: account5, isSigner: false, isWritable: true },
        { pubkey: account6, isSigner: false, isWritable: true },
        { pubkey: account7, isSigner: false, isWritable: true },
        { pubkey: account8, isSigner: false, isWritable: false },
        { pubkey: account9, isSigner: false, isWritable: true },
        { pubkey: account10, isSigner: false, isWritable: true },
        { pubkey: account11, isSigner: false, isWritable: true },
        { pubkey: account12, isSigner: false, isWritable: true },
        { pubkey: account13, isSigner: false, isWritable: true },
        { pubkey: account14, isSigner: false, isWritable: true },
        { pubkey: account15, isSigner: false, isWritable: false },
        { pubkey: account16, isSigner: false, isWritable: true },
        { pubkey: account17, isSigner: false, isWritable: true },
        { pubkey: account18, isSigner: true, isWritable: true }
    ];
    var swap = new web3_js_1.TransactionInstruction({
        keys: accountMetas,
        programId: config_1.RayLiqPoolv4,
        data: instructionData
    });
    var buyIxs = [];
    var sellIxs = [];
    if (reverse === false) {
        buyIxs.push(swap);
    }
    if (reverse === true) {
        sellIxs.push(swap);
    }
    return { buyIxs: buyIxs, sellIxs: sellIxs };
}
