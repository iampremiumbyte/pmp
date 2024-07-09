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
exports.loadKeypairs2 = exports.loadKeypairs1 = exports.createKeypairs = void 0;
var web3_js_1 = require("@solana/web3.js");
var fs = require("fs");
var prompt_sync_1 = require("prompt-sync");
var path_1 = require("path");
var bs58_1 = require("bs58");
var prompt = (0, prompt_sync_1.default)();
var keypairs1Dir = path_1.default.join(__dirname, 'keypairs-1');
var keypairs2Dir = path_1.default.join(__dirname, 'keypairs-2');
var keyInfoPath = path_1.default.join(__dirname, 'keyInfo.json');
// Ensure the keypairs directories exist
if (!fs.existsSync(keypairs1Dir)) {
    fs.mkdirSync(keypairs1Dir, { recursive: true });
}
if (!fs.existsSync(keypairs2Dir)) {
    fs.mkdirSync(keypairs2Dir, { recursive: true });
}
function generateWallets(numOfWallets) {
    var wallets = [];
    for (var i = 0; i < numOfWallets; i++) {
        var wallet = web3_js_1.Keypair.generate();
        wallets.push(wallet);
    }
    return wallets;
}
function saveKeypairToFile(keypair, index, dir) {
    var keypairPath = path_1.default.join(dir, "keypair".concat(index + 1, ".json"));
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
}
function readKeypairs(dir) {
    var files = fs.readdirSync(dir);
    return files.map(function (file) {
        var filePath = path_1.default.join(dir, file);
        var secretKey = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey));
    });
}
function updatePoolInfo(wallets, dir) {
    var poolInfo = {};
    if (fs.existsSync(keyInfoPath)) {
        var data = fs.readFileSync(keyInfoPath, 'utf8');
        poolInfo = JSON.parse(data);
    }
    poolInfo.numOfWallets = wallets.length;
    wallets.forEach(function (wallet, index) {
        poolInfo["pubkey".concat(index + 1)] = wallet.publicKey.toString();
    });
    fs.writeFileSync(keyInfoPath, JSON.stringify(poolInfo, null, 2));
}
function createKeypairs() {
    return __awaiter(this, void 0, void 0, function () {
        var action, wallets1, wallets2, numOfWallets;
        return __generator(this, function (_a) {
            console.log('WARNING: If you create new ones, ensure you don\'t have SOL, OR ELSE IT WILL BE GONE.');
            action = prompt('Do you want to (c)reate new wallets or (u)se existing ones? (c/u): ');
            wallets1 = [];
            wallets2 = [];
            if (action === 'c') {
                numOfWallets = 24;
                if (isNaN(numOfWallets) || numOfWallets <= 0) {
                    console.log('Invalid number. Please enter a positive integer.');
                    return [2 /*return*/];
                }
                wallets1 = generateWallets(numOfWallets);
                wallets1.forEach(function (wallet, index) {
                    saveKeypairToFile(wallet, index, keypairs1Dir);
                    console.log("Wallet1 ".concat(index + 1, " Public Key: ").concat(wallet.publicKey.toString()));
                });
                wallets2 = generateWallets(numOfWallets);
                wallets2.forEach(function (wallet, index) {
                    saveKeypairToFile(wallet, index, keypairs2Dir);
                    console.log("Wallet2 ".concat(index + 1, " Public Key: ").concat(wallet.publicKey.toString()));
                });
            }
            else if (action === 'u') {
                wallets1 = readKeypairs(keypairs1Dir);
                wallets1.forEach(function (wallet, index) {
                    console.log("Read Wallet-1 ".concat(index + 1, " Public Key: ").concat(wallet.publicKey.toString()));
                    console.log("Read Wallet-1 ".concat(index + 1, " Private Key: ").concat(bs58_1.default.encode(wallet.secretKey), "\n"));
                });
                wallets2 = readKeypairs(keypairs2Dir);
                wallets2.forEach(function (wallet, index) {
                    console.log("Read Wallet-2 ".concat(index + 1, " Public Key: ").concat(wallet.publicKey.toString()));
                    console.log("Read Wallet-2 ".concat(index + 1, " Private Key: ").concat(bs58_1.default.encode(wallet.secretKey), "\n"));
                });
            }
            else {
                console.log('Invalid option. Please enter "c" for create or "u" for use existing.');
                return [2 /*return*/];
            }
            updatePoolInfo(wallets1, keypairs1Dir);
            updatePoolInfo(wallets2, keypairs2Dir);
            console.log("".concat(wallets1.length + wallets2.length, " wallets have been processed."));
            return [2 /*return*/];
        });
    });
}
exports.createKeypairs = createKeypairs;
function loadKeypairs1() {
    var keypairRegex = /^keypair\d+\.json$/;
    return fs.readdirSync(keypairs1Dir)
        .filter(function (file) { return keypairRegex.test(file); })
        .map(function (file) {
        var filePath = path_1.default.join(keypairs1Dir, file);
        var secretKeyString = fs.readFileSync(filePath, { encoding: 'utf8' });
        var secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return web3_js_1.Keypair.fromSecretKey(secretKey);
    });
}
exports.loadKeypairs1 = loadKeypairs1;
function loadKeypairs2() {
    var keypairRegex = /^keypair\d+\.json$/;
    return fs.readdirSync(keypairs2Dir)
        .filter(function (file) { return keypairRegex.test(file); })
        .map(function (file) {
        var filePath = path_1.default.join(keypairs2Dir, file);
        var secretKeyString = fs.readFileSync(filePath, { encoding: 'utf8' });
        var secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return web3_js_1.Keypair.fromSecretKey(secretKey);
    });
}
exports.loadKeypairs2 = loadKeypairs2;
