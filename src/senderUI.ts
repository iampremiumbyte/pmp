import { Keypair, PublicKey, SystemProgram, TransactionInstruction, VersionedTransaction, LAMPORTS_PER_SOL, TransactionMessage, Blockhash } from '@solana/web3.js';
import { loadKeypairs1, loadKeypairs2 } from './createKeys';
import promptSync from 'prompt-sync';
import { createLUT, extendLUT } from './createLUT';
import fs from 'fs';
import path from 'path';

const prompt = promptSync();
const keyInfoPath = path.join(__dirname, 'keyInfo.json');

interface Buy {
    pubkey: PublicKey;
    solAmount: Number;
}

async function simulateAndWriteBuys2() {
    const keypairs = loadKeypairs2();
    let totalBuyAmt = 0;
    const buys: { pubkey: PublicKey, solAmount: Number }[] = [];
  
    for (let it = 0; it <= 23; it++) {
      const keypair = keypairs[it];

      const solInput = +prompt(`Enter the amount of SOL for wallet ${it + 25}: `);
      totalBuyAmt = totalBuyAmt + solInput

      const solAmount = solInput * LAMPORTS_PER_SOL;
  
      if (isNaN(solAmount) || solAmount <= 0 || solAmount === null) {
        console.log(`Invalid input for wallet ${it}, skipping.`);
        continue;
      }

      buys.push({ pubkey: keypair.publicKey, solAmount: Number(solInput) });
    }
  
    console.log('Sol Spent:', totalBuyAmt.toFixed(3));
    console.log(); // \n

    const confirm = prompt('Do you want to use these buys? (yes/no): ').toLowerCase();
    if (confirm === 'yes') {
      writeBuysToFile(buys);
    } else {
      console.log('Simulation aborted. Restarting...');
      simulateAndWriteBuys1(); // Restart the simulation
    }
}

async function simulateAndWriteBuys1() {
    const keypairs = loadKeypairs1();
    let totalBuyAmt = 0;
    const buys: { pubkey: PublicKey, solAmount: Number }[] = [];
  
    for (let it = 0; it <= 23; it++) {
      const keypair = keypairs[it];

      const solInput = +prompt(`Enter the amount of SOL for wallet ${it + 1}: `);
      totalBuyAmt = totalBuyAmt + solInput

      const solAmount = solInput * LAMPORTS_PER_SOL;
  
      if (isNaN(solAmount) || solAmount <= 0 || solAmount === null) {
        console.log(`Invalid input for wallet ${it}, skipping.`);
        continue;
      }

      buys.push({ pubkey: keypair.publicKey, solAmount: Number(solInput) });
    }
  
    console.log('Sol Spent:', totalBuyAmt.toFixed(3));
    console.log(); // \n

    const confirm = prompt('Do you want to use these buys? (yes/no): ').toLowerCase();
    if (confirm === 'yes') {
      writeBuysToFile(buys);
    } else {
      console.log('Simulation aborted. Restarting...');
      simulateAndWriteBuys1(); // Restart the simulation
    }
}
  

function writeBuysToFile(buys: Buy[]) {
    let existingData: any = {};
  
    if (fs.existsSync(keyInfoPath)) {
      existingData = JSON.parse(fs.readFileSync(keyInfoPath, 'utf-8'));
    }
  
    // Convert buys array to an object keyed by public key
    const buysObj = buys.reduce((acc, buy) => {
      acc[buy.pubkey.toString()] = {
        solAmount: buy.solAmount.toString(),
      };
      return acc;
    }, existingData); // Initialize with existing data
  
    // Write updated data to file
    fs.writeFileSync(keyInfoPath, JSON.stringify(buysObj, null, 2), 'utf8');
    console.log('Buys have been successfully saved to keyinfo.json');
}


export async function sender() {
    let running = true;

    while (running) {
        console.log("\nBuyer UI:");
        console.log("1. Create LUTs");
        console.log("2. Extend LUT Bundle");
        console.log("3. Simulate Buys Keypairs-1");
        console.log("4. Simulate Buys Keypairs-2");
        
        const answer = prompt("Choose an option or 'exit': "); // Use prompt-sync for user input

        switch (answer) {
            case '1':
                await createLUT();
                break;
            case '2':
                await extendLUT();
                break;
            case '3':
                await simulateAndWriteBuys1();
                break;
            case '4':
                await simulateAndWriteBuys2();
                break;
            case 'exit':
                running = false;
                break;
            default:
                console.log("Invalid option, please choose again.");
        }
    }

    console.log("Exiting...");
}


