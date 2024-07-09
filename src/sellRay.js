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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellXPercentageRAY = void 0;
var config_1 = require("../config");
var web3_js_1 = require("@solana/web3.js");
var createKeys_1 = require("./createKeys");
var jito_1 = require("./clients/jito");
var types_js_1 = require("jito-ts/dist/sdk/block-engine/types.js");
var prompt_sync_1 = require("prompt-sync");
var spl = require("@solana/spl-token");
var path_1 = require("path");
var fs_1 = require("fs");
var anchor = require("@coral-xyz/anchor");
var crypto_1 = require("crypto");
var config_2 = require("./clients/config");
var bn_js_1 = require("bn.js");
var poolKeysReassigned_1 = require("./clients/poolKeysReassigned");
var prompt = (0, prompt_sync_1.default)();
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
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
function sellXPercentageRAY() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, bundledTxns, poolInfo, data, lut, lookupTableAccount, batch, marketID, supplyPercent, jitoTipAmt, keypairs, keys, sellTotalAmount, chunkedKeypairs, PayerTokenATA, blockhash, chunkIndex, chunk, instructionsForChunk, isFirstChunk, ataIx, _i, chunk_1, keypair, transferAmount, TokenATA, transferIx, message, versionedTx, serializedMsg_1, _a, chunk_2, keypair, payerNum, payerKey, sellPayerIxs, PayerwSolATA, sellIxs, sellMessage, sellTx, serializedMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    provider = new anchor.AnchorProvider(new anchor.web3.Connection(config_1.rpc), new anchor.Wallet(config_1.payer), { commitment: "confirmed" });
                    bundledTxns = [];
                    poolInfo = {};
                    if (fs_1.default.existsSync(keyInfoPath)) {
                        data = fs_1.default.readFileSync(keyInfoPath, 'utf-8');
                        poolInfo = JSON.parse(data);
                    }
                    lut = new web3_js_1.PublicKey(poolInfo.addressLUT.toString());
                    return [4 /*yield*/, config_1.connection.getAddressLookupTable(lut)];
                case 1:
                    lookupTableAccount = (_b.sent()).value;
                    if (lookupTableAccount == null) {
                        console.log("Lookup table account not found!");
                        process.exit(0);
                    }
                    batch = prompt('Batch of keypairs to sell (1/2): ');
                    marketID = new web3_js_1.PublicKey(prompt('Enter marketID of your migration: '));
                    supplyPercent = +prompt('Percentage to sell (Ex. 1 for 1%): ') / 100;
                    jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * web3_js_1.LAMPORTS_PER_SOL;
                    if (batch === '1') {
                        keypairs = (0, createKeys_1.loadKeypairs1)();
                    }
                    else if (batch === '2') {
                        keypairs = (0, createKeys_1.loadKeypairs2)();
                    }
                    else {
                        console.log('Invalid batch of keypairs.');
                        process.exit(0);
                    }
                    return [4 /*yield*/, (0, poolKeysReassigned_1.derivePoolKeys)(marketID)];
                case 2:
                    keys = _b.sent();
                    if (keys == null) {
                        console.log('Keys not found!');
                        process.exit(0);
                    }
                    sellTotalAmount = 0;
                    chunkedKeypairs = chunkArray(keypairs, 6);
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(keys.quoteMint, config_1.payer.publicKey)];
                case 3:
                    PayerTokenATA = _b.sent();
                    return [4 /*yield*/, config_1.connection.getLatestBlockhash()];
                case 4:
                    blockhash = (_b.sent()).blockhash;
                    chunkIndex = 0;
                    _b.label = 5;
                case 5:
                    if (!(chunkIndex < chunkedKeypairs.length)) return [3 /*break*/, 12];
                    chunk = chunkedKeypairs[chunkIndex];
                    instructionsForChunk = [];
                    isFirstChunk = chunkIndex === 0;
                    if (isFirstChunk) {
                        ataIx = spl.createAssociatedTokenAccountIdempotentInstruction(config_1.payer.publicKey, PayerTokenATA, config_1.payer.publicKey, keys.quoteMint);
                        instructionsForChunk.push(ataIx);
                    }
                    _i = 0, chunk_1 = chunk;
                    _b.label = 6;
                case 6:
                    if (!(_i < chunk_1.length)) return [3 /*break*/, 10];
                    keypair = chunk_1[_i];
                    return [4 /*yield*/, getSellBalance(keypair, keys.quoteMint, supplyPercent)];
                case 7:
                    transferAmount = _b.sent();
                    sellTotalAmount += transferAmount; // Keep track to sell at the end
                    console.log("Sending ".concat(transferAmount / 1e6, " from ").concat(keypair.publicKey.toString(), "."));
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(keys.quoteMint, keypair.publicKey)];
                case 8:
                    TokenATA = _b.sent();
                    transferIx = spl.createTransferInstruction(TokenATA, PayerTokenATA, keypair.publicKey, transferAmount);
                    instructionsForChunk.push(transferIx);
                    _b.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 6];
                case 10:
                    if (instructionsForChunk.length > 0) {
                        message = new web3_js_1.TransactionMessage({
                            payerKey: config_1.payer.publicKey,
                            recentBlockhash: blockhash,
                            instructions: instructionsForChunk,
                        }).compileToV0Message([lookupTableAccount]);
                        versionedTx = new web3_js_1.VersionedTransaction(message);
                        serializedMsg_1 = versionedTx.serialize();
                        console.log("Txn size:", serializedMsg_1.length);
                        if (serializedMsg_1.length > 1232) {
                            console.log('tx too big');
                        }
                        versionedTx.sign([config_1.payer]); // Sign with payer first
                        for (_a = 0, chunk_2 = chunk; _a < chunk_2.length; _a++) {
                            keypair = chunk_2[_a];
                            versionedTx.sign([keypair]); // Then sign with each keypair in the chunk
                        }
                        bundledTxns.push(versionedTx);
                    }
                    _b.label = 11;
                case 11:
                    chunkIndex++;
                    return [3 /*break*/, 5];
                case 12:
                    payerNum = (0, crypto_1.randomInt)(0, 24);
                    payerKey = keypairs[payerNum];
                    sellPayerIxs = [];
                    return [4 /*yield*/, spl.getAssociatedTokenAddress(spl.NATIVE_MINT, config_1.payer.publicKey)];
                case 13:
                    PayerwSolATA = _b.sent();
                    sellIxs = makeSwap(keys, PayerwSolATA, PayerTokenATA, true, config_1.payer, sellTotalAmount).sellIxs;
                    console.log("TOTAL: Selling ".concat(sellTotalAmount / 1e6, "."));
                    sellPayerIxs.push.apply(sellPayerIxs, __spreadArray(__spreadArray([spl.createAssociatedTokenAccountIdempotentInstruction(config_1.payer.publicKey, PayerwSolATA, config_1.payer.publicKey, spl.NATIVE_MINT)], sellIxs, false), [web3_js_1.SystemProgram.transfer({
                            fromPubkey: config_1.payer.publicKey,
                            toPubkey: (0, config_2.getRandomTipAccount)(),
                            lamports: BigInt(jitoTipAmt),
                        })], false));
                    sellMessage = new web3_js_1.TransactionMessage({
                        payerKey: payerKey.publicKey,
                        recentBlockhash: blockhash,
                        instructions: sellPayerIxs,
                    }).compileToV0Message([lookupTableAccount]);
                    sellTx = new web3_js_1.VersionedTransaction(sellMessage);
                    serializedMsg = sellTx.serialize();
                    console.log("Txn size:", serializedMsg.length);
                    if (serializedMsg.length > 1232) {
                        console.log('tx too big');
                    }
                    sellTx.sign([config_1.payer, payerKey]);
                    bundledTxns.push(sellTx);
                    return [4 /*yield*/, sendBundle(bundledTxns)];
                case 14:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.sellXPercentageRAY = sellXPercentageRAY;
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
