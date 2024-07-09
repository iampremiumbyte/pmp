"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geyserClient = exports.searcherClients = exports.searcherClient = exports.privateKey = void 0;
var web3_js_1 = require("@solana/web3.js");
var config_1 = require("./config");
var jito_ts_1 = require("jito-ts");
var searcher_js_1 = require("jito-ts/dist/sdk/block-engine/searcher.js");
var fs = require("fs");
var BLOCK_ENGINE_URLS = config_1.config.get('block_engine_urls');
var AUTH_KEYPAIR_PATH = config_1.config.get('auth_keypair_path');
var GEYSER_URL = config_1.config.get('geyser_url');
var GEYSER_ACCESS_TOKEN = config_1.config.get('geyser_access_token');
var decodedKey = new Uint8Array(JSON.parse(fs.readFileSync(AUTH_KEYPAIR_PATH).toString()));
var keypair = web3_js_1.Keypair.fromSecretKey(decodedKey);
exports.privateKey = keypair;
var searcherClients = [];
exports.searcherClients = searcherClients;
for (var _i = 0, BLOCK_ENGINE_URLS_1 = BLOCK_ENGINE_URLS; _i < BLOCK_ENGINE_URLS_1.length; _i++) {
    var url = BLOCK_ENGINE_URLS_1[_i];
    var client = (0, searcher_js_1.searcherClient)(url, keypair, {
        'grpc.keepalive_timeout_ms': 4000,
    });
    searcherClients.push(client);
}
var geyserClient = (0, jito_ts_1.geyserClient)(GEYSER_URL, GEYSER_ACCESS_TOKEN, {
    'grpc.keepalive_timeout_ms': 4000,
});
exports.geyserClient = geyserClient;
// all bundles sent get automatically forwarded to the other regions.
// assuming the first block engine in the array is the closest one
var searcherClient = searcherClients[0];
exports.searcherClient = searcherClient;
