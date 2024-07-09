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
exports.sender = void 0;
var web3_js_1 = require("@solana/web3.js");
var createKeys_1 = require("./createKeys");
var prompt_sync_1 = require("prompt-sync");
var createLUT_1 = require("./createLUT");
var fs_1 = require("fs");
var path_1 = require("path");
var prompt = (0, prompt_sync_1.default)();
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
function simulateAndWriteBuys2() {
    return __awaiter(this, void 0, void 0, function () {
        var keypairs, totalBuyAmt, buys, it, keypair, solInput, solAmount, confirm;
        return __generator(this, function (_a) {
            keypairs = (0, createKeys_1.loadKeypairs2)();
            totalBuyAmt = 0;
            buys = [];
            for (it = 0; it <= 23; it++) {
                keypair = keypairs[it];
                solInput = +prompt("Enter the amount of SOL for wallet ".concat(it + 25, ": "));
                totalBuyAmt = totalBuyAmt + solInput;
                solAmount = solInput * web3_js_1.LAMPORTS_PER_SOL;
                if (isNaN(solAmount) || solAmount <= 0 || solAmount === null) {
                    console.log("Invalid input for wallet ".concat(it, ", skipping."));
                    continue;
                }
                buys.push({ pubkey: keypair.publicKey, solAmount: Number(solInput) });
            }
            console.log('Sol Spent:', totalBuyAmt.toFixed(3));
            console.log(); // \n
            confirm = prompt('Do you want to use these buys? (yes/no): ').toLowerCase();
            if (confirm === 'yes') {
                writeBuysToFile(buys);
            }
            else {
                console.log('Simulation aborted. Restarting...');
                simulateAndWriteBuys1(); // Restart the simulation
            }
            return [2 /*return*/];
        });
    });
}
function simulateAndWriteBuys1() {
    return __awaiter(this, void 0, void 0, function () {
        var keypairs, totalBuyAmt, buys, it, keypair, solInput, solAmount, confirm;
        return __generator(this, function (_a) {
            keypairs = (0, createKeys_1.loadKeypairs1)();
            totalBuyAmt = 0;
            buys = [];
            for (it = 0; it <= 23; it++) {
                keypair = keypairs[it];
                solInput = +prompt("Enter the amount of SOL for wallet ".concat(it + 1, ": "));
                totalBuyAmt = totalBuyAmt + solInput;
                solAmount = solInput * web3_js_1.LAMPORTS_PER_SOL;
                if (isNaN(solAmount) || solAmount <= 0 || solAmount === null) {
                    console.log("Invalid input for wallet ".concat(it, ", skipping."));
                    continue;
                }
                buys.push({ pubkey: keypair.publicKey, solAmount: Number(solInput) });
            }
            console.log('Sol Spent:', totalBuyAmt.toFixed(3));
            console.log(); // \n
            confirm = prompt('Do you want to use these buys? (yes/no): ').toLowerCase();
            if (confirm === 'yes') {
                writeBuysToFile(buys);
            }
            else {
                console.log('Simulation aborted. Restarting...');
                simulateAndWriteBuys1(); // Restart the simulation
            }
            return [2 /*return*/];
        });
    });
}
function writeBuysToFile(buys) {
    var existingData = {};
    if (fs_1.default.existsSync(keyInfoPath)) {
        existingData = JSON.parse(fs_1.default.readFileSync(keyInfoPath, 'utf-8'));
    }
    // Convert buys array to an object keyed by public key
    var buysObj = buys.reduce(function (acc, buy) {
        acc[buy.pubkey.toString()] = {
            solAmount: buy.solAmount.toString(),
        };
        return acc;
    }, existingData); // Initialize with existing data
    // Write updated data to file
    fs_1.default.writeFileSync(keyInfoPath, JSON.stringify(buysObj, null, 2), 'utf8');
    console.log('Buys have been successfully saved to keyinfo.json');
}
function sender() {
    return __awaiter(this, void 0, void 0, function () {
        var running, answer, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    running = true;
                    _b.label = 1;
                case 1:
                    if (!running) return [3 /*break*/, 13];
                    console.log("\nBuyer UI:");
                    console.log("1. Create LUTs");
                    console.log("2. Extend LUT Bundle");
                    console.log("3. Simulate Buys Keypairs-1");
                    console.log("4. Simulate Buys Keypairs-2");
                    answer = prompt("Choose an option or 'exit': ");
                    _a = answer;
                    switch (_a) {
                        case '1': return [3 /*break*/, 2];
                        case '2': return [3 /*break*/, 4];
                        case '3': return [3 /*break*/, 6];
                        case '4': return [3 /*break*/, 8];
                        case 'exit': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 11];
                case 2: return [4 /*yield*/, (0, createLUT_1.createLUT)()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 4: return [4 /*yield*/, (0, createLUT_1.extendLUT)()];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 6: return [4 /*yield*/, simulateAndWriteBuys1()];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 8: return [4 /*yield*/, simulateAndWriteBuys2()];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 10:
                    running = false;
                    return [3 /*break*/, 12];
                case 11:
                    console.log("Invalid option, please choose again.");
                    _b.label = 12;
                case 12: return [3 /*break*/, 1];
                case 13:
                    console.log("Exiting...");
                    return [2 /*return*/];
            }
        });
    });
}
exports.sender = sender;
