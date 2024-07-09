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
exports.lookupTableProvider = void 0;
var web3_js_1 = require("@solana/web3.js");
var config_1 = require("../../config");
/**
 * this class solves 2 problems:
 * 1. cache and geyser subscribe to lookup tables for fast retreival
 * 2. compute the ideal lookup tables for a set of addresses
 *
 * the second problem/solution is needed because jito bundles can not include a a txn that uses a lookup table
 * that has been modified in the same bundle. so this class caches all lookups and then computes the ideal lookup tables
 * for a set of addresses used by the arb txn so that the arb txn size is reduced below the maximum.
 */
var LookupTableProvider = /** @class */ (function () {
    function LookupTableProvider() {
        this.lookupTables = new Map();
        this.lookupTablesForAddress = new Map();
        this.addressesForLookupTable = new Map();
    }
    LookupTableProvider.prototype.updateCache = function (lutAddress, lutAccount) {
        this.lookupTables.set(lutAddress.toBase58(), lutAccount);
        this.addressesForLookupTable.set(lutAddress.toBase58(), new Set());
        for (var _i = 0, _a = lutAccount.state.addresses; _i < _a.length; _i++) {
            var address = _a[_i];
            var addressStr = address.toBase58();
            this.addressesForLookupTable.get(lutAddress.toBase58()).add(addressStr);
            if (!this.lookupTablesForAddress.has(addressStr)) {
                this.lookupTablesForAddress.set(addressStr, new Set());
            }
            this.lookupTablesForAddress.get(addressStr).add(lutAddress.toBase58());
        }
    };
    LookupTableProvider.prototype.processLookupTableUpdate = function (lutAddress, data) {
        var lutAccount = new web3_js_1.AddressLookupTableAccount({
            key: lutAddress,
            state: web3_js_1.AddressLookupTableAccount.deserialize(data.data),
        });
        this.updateCache(lutAddress, lutAccount);
        return;
    };
    LookupTableProvider.prototype.getLookupTable = function (lutAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var lutAddressStr, lut;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lutAddressStr = lutAddress.toBase58();
                        if (this.lookupTables.has(lutAddressStr)) {
                            return [2 /*return*/, this.lookupTables.get(lutAddressStr)];
                        }
                        return [4 /*yield*/, config_1.connection.getAddressLookupTable(lutAddress)];
                    case 1:
                        lut = _a.sent();
                        if (lut.value === null) {
                            return [2 /*return*/, null];
                        }
                        this.updateCache(lutAddress, lut.value);
                        return [2 /*return*/, lut.value];
                }
            });
        });
    };
    LookupTableProvider.prototype.computeIdealLookupTablesForAddresses = function (addresses) {
        var MIN_ADDRESSES_TO_INCLUDE_TABLE = 2;
        var MAX_TABLE_COUNT = 3;
        var addressSet = new Set();
        var tableIntersections = new Map();
        var selectedTables = [];
        var remainingAddresses = new Set();
        var numAddressesTakenCareOf = 0;
        for (var _i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
            var address = addresses_1[_i];
            var addressStr = address.toBase58();
            if (addressSet.has(addressStr))
                continue;
            addressSet.add(addressStr);
            var tablesForAddress = this.lookupTablesForAddress.get(addressStr) || new Set();
            if (tablesForAddress.size === 0)
                continue;
            remainingAddresses.add(addressStr);
            for (var _a = 0, tablesForAddress_1 = tablesForAddress; _a < tablesForAddress_1.length; _a++) {
                var table = tablesForAddress_1[_a];
                var intersectionCount = tableIntersections.get(table) || 0;
                tableIntersections.set(table, intersectionCount + 1);
            }
        }
        var sortedIntersectionArray = Array.from(tableIntersections.entries()).sort(function (a, b) { return b[1] - a[1]; });
        var _loop_1 = function (lutKey, intersectionSize) {
            if (intersectionSize < MIN_ADDRESSES_TO_INCLUDE_TABLE)
                return "break";
            if (selectedTables.length >= MAX_TABLE_COUNT)
                return "break";
            if (remainingAddresses.size <= 1)
                return "break";
            var lutAddresses = this_1.addressesForLookupTable.get(lutKey);
            var addressMatches = new Set(__spreadArray([], remainingAddresses, true).filter(function (x) { return lutAddresses.has(x); }));
            if (addressMatches.size >= MIN_ADDRESSES_TO_INCLUDE_TABLE) {
                selectedTables.push(this_1.lookupTables.get(lutKey));
                for (var _d = 0, addressMatches_1 = addressMatches; _d < addressMatches_1.length; _d++) {
                    var address = addressMatches_1[_d];
                    remainingAddresses.delete(address);
                    numAddressesTakenCareOf++;
                }
            }
        };
        var this_1 = this;
        for (var _b = 0, sortedIntersectionArray_1 = sortedIntersectionArray; _b < sortedIntersectionArray_1.length; _b++) {
            var _c = sortedIntersectionArray_1[_b], lutKey = _c[0], intersectionSize = _c[1];
            var state_1 = _loop_1(lutKey, intersectionSize);
            if (state_1 === "break")
                break;
        }
        return selectedTables;
    };
    return LookupTableProvider;
}());
var lookupTableProvider = new LookupTableProvider();
exports.lookupTableProvider = lookupTableProvider;
lookupTableProvider.getLookupTable(
// custom lookup tables
new web3_js_1.PublicKey('Gr8rXuDwE2Vd2F5tifkPyMaUR67636YgrZEjkJf9RR9V'));
