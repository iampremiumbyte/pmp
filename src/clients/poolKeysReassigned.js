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
exports.SPL_ACCOUNT_LAYOUT = exports.SPL_MINT_LAYOUT = exports.PoolKeysCorrector = exports.derivePoolKeys = void 0;
var spl = require("@solana/spl-token");
var openbook_1 = require("@openbook-dex/openbook");
var web3_js_1 = require("@solana/web3.js");
var buffer_layout_1 = require("@solana/buffer-layout");
var buffer_layout_utils_1 = require("@solana/buffer-layout-utils");
var config_1 = require("../../config");
var openbookProgram = new web3_js_1.PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
function getMarketInfo(marketId) {
    return __awaiter(this, void 0, void 0, function () {
        var reqs, marketInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reqs = 0;
                    return [4 /*yield*/, config_1.connection.getAccountInfo(marketId)];
                case 1:
                    marketInfo = _a.sent();
                    reqs++;
                    _a.label = 2;
                case 2:
                    if (!!marketInfo) return [3 /*break*/, 4];
                    return [4 /*yield*/, config_1.connection.getAccountInfo(marketId)];
                case 3:
                    marketInfo = _a.sent();
                    reqs++;
                    if (marketInfo) {
                        return [3 /*break*/, 4];
                    }
                    else if (reqs > 20) {
                        console.log("Could not get market info..");
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, marketInfo];
            }
        });
    });
}
function getDecodedData(marketInfo) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, openbook_1.Market.getLayout(openbookProgram).decode(marketInfo.data)];
        });
    });
}
function getMintData(mint) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, config_1.connection.getAccountInfo(mint)];
        });
    });
}
function getDecimals(mintData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!mintData)
                throw new Error('No mint data!');
            return [2 /*return*/, exports.SPL_MINT_LAYOUT.decode(mintData.data).decimals];
        });
    });
}
function getOwnerAta(mint, publicKey) {
    return __awaiter(this, void 0, void 0, function () {
        var foundAta;
        return __generator(this, function (_a) {
            foundAta = web3_js_1.PublicKey.findProgramAddressSync([publicKey.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0];
            return [2 /*return*/, foundAta];
        });
    });
}
function getVaultSigner(marketId, marketDeco) {
    var seeds = [marketId.toBuffer()];
    var seedsWithNonce = seeds.concat(Buffer.from([Number(marketDeco.vaultSignerNonce.toString())]), Buffer.alloc(7));
    return web3_js_1.PublicKey.createProgramAddressSync(seedsWithNonce, openbookProgram);
}
function derivePoolKeys(marketId) {
    return __awaiter(this, void 0, void 0, function () {
        var marketInfo, marketDeco, baseMint, baseMintData, baseDecimals, ownerBaseAta, quoteMint, quoteMintData, quoteDecimals, ownerQuoteAta, authority, marketAuthority, poolKeys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMarketInfo(marketId)];
                case 1:
                    marketInfo = _a.sent();
                    if (!marketInfo)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, getDecodedData(marketInfo)];
                case 2:
                    marketDeco = _a.sent();
                    baseMint = marketDeco.baseMint;
                    return [4 /*yield*/, getMintData(baseMint)];
                case 3:
                    baseMintData = _a.sent();
                    return [4 /*yield*/, getDecimals(baseMintData)];
                case 4:
                    baseDecimals = _a.sent();
                    return [4 /*yield*/, getOwnerAta(baseMint, config_1.payer.publicKey)];
                case 5:
                    ownerBaseAta = _a.sent();
                    quoteMint = marketDeco.quoteMint;
                    return [4 /*yield*/, getMintData(quoteMint)];
                case 6:
                    quoteMintData = _a.sent();
                    return [4 /*yield*/, getDecimals(quoteMintData)];
                case 7:
                    quoteDecimals = _a.sent();
                    return [4 /*yield*/, getOwnerAta(quoteMint, config_1.payer.publicKey)];
                case 8:
                    ownerQuoteAta = _a.sent();
                    authority = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from([97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121])], config_1.RayLiqPoolv4)[0];
                    marketAuthority = getVaultSigner(marketId, marketDeco);
                    poolKeys = {
                        keg: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                        version: 4,
                        marketVersion: 3,
                        programId: config_1.RayLiqPoolv4,
                        baseMint: baseMint,
                        quoteMint: quoteMint,
                        ownerBaseAta: ownerBaseAta,
                        ownerQuoteAta: ownerQuoteAta,
                        baseDecimals: baseDecimals,
                        quoteDecimals: quoteDecimals,
                        lpDecimals: baseDecimals,
                        authority: authority,
                        marketAuthority: marketAuthority,
                        marketProgramId: openbookProgram,
                        marketId: marketId,
                        marketBids: marketDeco.bids,
                        marketAsks: marketDeco.asks,
                        marketQuoteVault: marketDeco.quoteVault,
                        marketBaseVault: marketDeco.baseVault,
                        marketEventQueue: marketDeco.eventQueue,
                        id: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('amm_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        baseVault: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('coin_vault_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        coinVault: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('pc_vault_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        lpMint: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('lp_mint_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        lpVault: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('temp_lp_token_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        targetOrders: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('target_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        withdrawQueue: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('withdraw_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        openOrders: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('open_order_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        quoteVault: web3_js_1.PublicKey.findProgramAddressSync([config_1.RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from('pc_vault_associated_seed', 'utf-8')], config_1.RayLiqPoolv4)[0],
                        lookupTableAccount: new web3_js_1.PublicKey('11111111111111111111111111111111')
                    };
                    return [2 /*return*/, poolKeys];
            }
        });
    });
}
exports.derivePoolKeys = derivePoolKeys;
function PoolKeysCorrector(poolkeys) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            return [2 /*return*/, {
                    id: poolkeys.id.toString(),
                    baseMint: poolkeys.baseMint.toString(),
                    quoteMint: poolkeys.quoteMint.toString(),
                    lpMint: poolkeys.lpMint.toString(),
                    baseDecimals: poolkeys.baseDecimals,
                    quoteDecimals: poolkeys.quoteDecimals,
                    lpDecimals: poolkeys.lpDecimals,
                    version: 4,
                    programId: ((_a = poolkeys.programId) === null || _a === void 0 ? void 0 : _a.toString()) || config_1.RayLiqPoolv4.toString(),
                    authority: poolkeys.authority.toString(),
                    openOrders: poolkeys.openOrders.toString(),
                    targetOrders: poolkeys.targetOrders.toString(),
                    baseVault: poolkeys.baseVault.toString(),
                    quoteVault: poolkeys.quoteVault.toString(),
                    withdrawQueue: ((_b = poolkeys.withdrawQueue) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                    lpVault: ((_c = poolkeys.lpVault) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                    marketVersion: 3,
                    marketProgramId: poolkeys.marketProgramId.toString(),
                    marketId: poolkeys.marketId.toString(),
                    marketAuthority: poolkeys.marketAuthority.toString(),
                    marketBaseVault: poolkeys.baseVault.toString(),
                    marketQuoteVault: poolkeys.quoteVault.toString(),
                    marketBids: poolkeys.marketBids.toString(),
                    marketAsks: poolkeys.marketAsks.toString(),
                    marketEventQueue: poolkeys.marketEventQueue.toString(),
                    lookupTableAccount: web3_js_1.PublicKey.default.toString()
                }];
        });
    });
}
exports.PoolKeysCorrector = PoolKeysCorrector;
exports.SPL_MINT_LAYOUT = (0, buffer_layout_1.struct)([
    (0, buffer_layout_1.u32)('mintAuthorityOption'),
    (0, buffer_layout_utils_1.publicKey)('mintAuthority'),
    (0, buffer_layout_utils_1.u64)('supply'),
    (0, buffer_layout_1.u8)('decimals'),
    (0, buffer_layout_1.u8)('isInitialized'),
    (0, buffer_layout_1.u32)('freezeAuthorityOption'),
    (0, buffer_layout_utils_1.publicKey)('freezeAuthority')
]);
exports.SPL_ACCOUNT_LAYOUT = (0, buffer_layout_1.struct)([
    (0, buffer_layout_utils_1.publicKey)('mint'),
    (0, buffer_layout_utils_1.publicKey)('owner'),
    (0, buffer_layout_utils_1.u64)('amount'),
    (0, buffer_layout_1.u32)('delegateOption'),
    (0, buffer_layout_utils_1.publicKey)('delegate'),
    (0, buffer_layout_1.u8)('state'),
    (0, buffer_layout_1.u32)('isNativeOption'),
    (0, buffer_layout_utils_1.u64)('isNative'),
    (0, buffer_layout_utils_1.u64)('delegatedAmount'),
    (0, buffer_layout_1.u32)('closeAuthorityOption'),
    (0, buffer_layout_utils_1.publicKey)('closeAuthority')
]);
