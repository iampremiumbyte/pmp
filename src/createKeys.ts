import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import promptSync from 'prompt-sync';
import path from 'path';
import bs58 from 'bs58';

const prompt = promptSync();

const keypairs1Dir = path.join(__dirname, 'keypairs-1');
const keypairs2Dir = path.join(__dirname, 'keypairs-2');
const keyInfoPath = path.join(__dirname, 'keyInfo.json');

interface IPoolInfo {
  [key: string]: any;
  numOfWallets?: number;
}

// Ensure the keypairs directories exist
if (!fs.existsSync(keypairs1Dir)) {
  fs.mkdirSync(keypairs1Dir, { recursive: true });
}

if (!fs.existsSync(keypairs2Dir)) {
  fs.mkdirSync(keypairs2Dir, { recursive: true });
}

function generateWallets(numOfWallets: number): Keypair[] {
  let wallets: Keypair[] = [];
  for (let i = 0; i < numOfWallets; i++) {
    const wallet = Keypair.generate();
    wallets.push(wallet);
  }
  return wallets;
}

function saveKeypairToFile(keypair: Keypair, index: number, dir: string) {
  const keypairPath = path.join(dir, `keypair${index + 1}.json`);
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
}

function readKeypairs(dir: string): Keypair[] {
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const filePath = path.join(dir, file);
    const secretKey = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  });
}

function updatePoolInfo(wallets: Keypair[], dir: string) {
  let poolInfo: IPoolInfo = {};

  if (fs.existsSync(keyInfoPath)) {
    const data = fs.readFileSync(keyInfoPath, 'utf8');
    poolInfo = JSON.parse(data);
  }

  poolInfo.numOfWallets = wallets.length;
  wallets.forEach((wallet, index) => {
    poolInfo[`pubkey${index + 1}`] = wallet.publicKey.toString();
  });

  fs.writeFileSync(keyInfoPath, JSON.stringify(poolInfo, null, 2));
}

export async function createKeypairs() {
  console.log('WARNING: If you create new ones, ensure you don\'t have SOL, OR ELSE IT WILL BE GONE.');
  const action = prompt('Do you want to (c)reate new wallets or (u)se existing ones? (c/u): ');
  let wallets1: Keypair[] = [];
  let wallets2: Keypair[] = [];

  if (action === 'c') {
    const numOfWallets = 24;
    if (isNaN(numOfWallets) || numOfWallets <= 0) {
      console.log('Invalid number. Please enter a positive integer.');
      return;
    }

    wallets1 = generateWallets(numOfWallets);
    wallets1.forEach((wallet, index) => {
      saveKeypairToFile(wallet, index, keypairs1Dir);
      console.log(`Wallet1 ${index + 1} Public Key: ${wallet.publicKey.toString()}`);
    });

    wallets2 = generateWallets(numOfWallets);
    wallets2.forEach((wallet, index) => {
      saveKeypairToFile(wallet, index, keypairs2Dir);
      console.log(`Wallet2 ${index + 1} Public Key: ${wallet.publicKey.toString()}`);
    });
  } else if (action === 'u') {
    wallets1 = readKeypairs(keypairs1Dir);
    wallets1.forEach((wallet, index) => {
      console.log(`Read Wallet-1 ${index + 1} Public Key: ${wallet.publicKey.toString()}`);
      console.log(`Read Wallet-1 ${index + 1} Private Key: ${bs58.encode(wallet.secretKey)}\n`);
    });

    wallets2 = readKeypairs(keypairs2Dir);
    wallets2.forEach((wallet, index) => {
      console.log(`Read Wallet-2 ${index + 1} Public Key: ${wallet.publicKey.toString()}`);
      console.log(`Read Wallet-2 ${index + 1} Private Key: ${bs58.encode(wallet.secretKey)}\n`);
    });
  } else {
    console.log('Invalid option. Please enter "c" for create or "u" for use existing.');
    return;
  }

  updatePoolInfo(wallets1, keypairs1Dir);
  updatePoolInfo(wallets2, keypairs2Dir);
  console.log(`${wallets1.length + wallets2.length} wallets have been processed.`);
}

export function loadKeypairs1(): Keypair[] {
  const keypairRegex = /^keypair\d+\.json$/;

  return fs.readdirSync(keypairs1Dir)
    .filter(file => keypairRegex.test(file))
    .map(file => {
      const filePath = path.join(keypairs1Dir, file);
      const secretKeyString = fs.readFileSync(filePath, { encoding: 'utf8' });
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      return Keypair.fromSecretKey(secretKey);
    });
}

export function loadKeypairs2(): Keypair[] {
  const keypairRegex = /^keypair\d+\.json$/;

  return fs.readdirSync(keypairs2Dir)
    .filter(file => keypairRegex.test(file))
    .map(file => {
      const filePath = path.join(keypairs2Dir, file);
      const secretKeyString = fs.readFileSync(filePath, { encoding: 'utf8' });
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      return Keypair.fromSecretKey(secretKey);
    });
}
