import { connection, payer, RayLiqPoolv4 } from "../config";
import { PublicKey, VersionedTransaction, TransactionMessage, SystemProgram, Keypair, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { loadKeypairs1, loadKeypairs2 } from './createKeys';
import { searcherClient } from "./clients/jito";
import { Bundle as JitoBundle } from 'jito-ts/dist/sdk/block-engine/types.js';
import promptSync from 'prompt-sync';
import * as spl from '@solana/spl-token';
import path from 'path';
import fs from 'fs';
import { getRandomTipAccount } from "./clients/config";
import BN from 'bn.js';
import { derivePoolKeys, IPoolKeys } from "./clients/poolKeysReassigned";

const prompt = promptSync();
const keyInfoPath = path.join(__dirname, 'keyInfo.json');


async function sendBundle(bundledTxns: VersionedTransaction[]) {
    /*
    // Simulate each transaction
    for (const tx of bundledTxns) {
        try {
            const simulationResult = await connection.simulateTransaction(tx, { commitment: "processed" });

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
    
    try {
        const bundleId = await searcherClient.sendBundle(new JitoBundle(bundledTxns, bundledTxns.length));
        console.log(`Bundle ${bundleId} sent.`);

        /*
        // Assuming onBundleResult returns a Promise<BundleResult>
        const result = await new Promise((resolve, reject) => {
            searcherClient.onBundleResult(
            (result) => {
                console.log('Received bundle result:', result);
                resolve(result); // Resolve the promise with the result
            },
            (e: Error) => {
                console.error('Error receiving bundle result:', e);
                reject(e); // Reject the promise if there's an error
            }
            );
        });
    
        console.log('Result:', result);
        */
    } catch (error) {
        const err = error as any;
        console.error("Error sending bundle:", err.message);
    
        if (err?.message?.includes('Bundle Dropped, no connected leader up soon')) {
            console.error("Error sending bundle: Bundle Dropped, no connected leader up soon.");
        } else {
            console.error("An unexpected error occurred:", err.message);
        }
    }
}


export async function sellXKeypairRAY() {
    // Start selling
    const bundledTxns: VersionedTransaction[] = [];

    let poolInfo: { [key: string]: any } = {};
    if (fs.existsSync(keyInfoPath)) {
        const data = fs.readFileSync(keyInfoPath, 'utf-8');
        poolInfo = JSON.parse(data);
    }

    const lut = new PublicKey(poolInfo.addressLUT.toString());

    const lookupTableAccount = (
        await connection.getAddressLookupTable(lut)
    ).value;

    if (lookupTableAccount == null) {
        console.log("Lookup table account not found!");
        process.exit(0);
    }
    
    let batch = +prompt('Select Keypair to sell (1-48): ') - 1;
    const marketID = new PublicKey(prompt('Enter marketID of your migration: '));
    const supplyPercent = +prompt('Percentage to sell (Ex. 1 for 1%): ') / 100;
    const jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * LAMPORTS_PER_SOL;

    let keypair;
    if (batch < 24) {
        keypair = loadKeypairs1()[batch];
    } else if (batch >= 24) {
        batch = batch - 24;
        keypair = loadKeypairs2()[batch];
    } else {
        console.log('Invalid keypair.');
        process.exit(0);
    }

    const keys = await derivePoolKeys(marketID); // Ensure this function is correctly defined to derive necessary keys

    if (keys == null) {
        console.log('Keys not found!');
        process.exit(0);
    }

    const { blockhash } = await connection.getLatestBlockhash();

    // create ata and tip
    const ixs1 = [];

    const KeypairwSolATA = await spl.getAssociatedTokenAddress(spl.NATIVE_MINT, keypair.publicKey);

    const wsolATA = spl.createAssociatedTokenAccountIdempotentInstruction(
        payer.publicKey,
        KeypairwSolATA,
        keypair.publicKey,
        spl.NATIVE_MINT
    );

    ixs1.push(
        wsolATA,
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: BigInt(jitoTipAmt),
        }),
    );
      
    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: ixs1,
    }).compileToV0Message([lookupTableAccount]);
      
    const fundtxn = new VersionedTransaction(message);
      
    const serializedMsg = fundtxn.serialize();
    console.log("Txn size:", serializedMsg.length);
    if (serializedMsg.length > 1232) {
        console.log('tx too big');
    }
      
    fundtxn.sign([payer]); // Sign with payer first

    bundledTxns.push(fundtxn);


    // sell on wallet
    const sellAmt = await getSellBalance(keypair, keys.quoteMint, supplyPercent);

    if (sellAmt > 0) {
        console.log('Selling', (sellAmt / 10**6).toFixed(6), ' tokens from keypair', batch);
    } else {
        console.log('0 Tokens to sell on keypair', batch);
        console.log('Returning...');
        return;
    }

    const KeypairTokenATA = await spl.getAssociatedTokenAddress(keys.quoteMint, keypair.publicKey);

    const { sellIxs } = makeSwap(keys, KeypairwSolATA, KeypairTokenATA, true, keypair, sellAmt);

    const message2 = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash,
        instructions: sellIxs,
    }).compileToV0Message([lookupTableAccount]);
      
    const selltxn = new VersionedTransaction(message2);
      
    const serializedMsg2 = selltxn.serialize();
    console.log("Txn size:", serializedMsg2.length);
    if (serializedMsg2.length > 1232) {
        console.log('tx too big');
    }
      
    selltxn.sign([keypair]); // Sign with payer first

    bundledTxns.push(selltxn);


    // close wsol acct to config wallet
    const closeWSOL = spl.createCloseAccountInstruction(
        KeypairwSolATA, // WSOL account to close
        payer.publicKey, // Destination for remaining SOL
        keypair.publicKey, // Owner of the WSOL account, may need to be the wallet if it's the owner
    )

    const message3 = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash,
        instructions: [closeWSOL],
    }).compileToV0Message([lookupTableAccount]);
      
    const closetxn = new VersionedTransaction(message3);
      
    const serializedMsg3 = closetxn.serialize();
    console.log("Txn size:", serializedMsg3.length);
    if (serializedMsg3.length > 1232) {
        console.log('tx too big');
    }
      
    closetxn.sign([keypair]); // Sign with payer first

    bundledTxns.push(closetxn);
      
    // Send bundleee
    await sendBundle(bundledTxns);

    return;
}

async function getSellBalance(keypair: Keypair, mint: PublicKey, supplyPercent: number) {
    let amount;
    try {
      const tokenAccountPubKey = spl.getAssociatedTokenAddressSync(
        mint,
        keypair.publicKey,
      );
      const balance = await connection.getTokenAccountBalance(tokenAccountPubKey);
      amount = Math.floor(Number(balance.value.amount) * supplyPercent);
    } catch (e) {
      amount = 0;
    }
  
    return amount;
  };

  function makeSwap(
    poolKeys: IPoolKeys, 
    wSolATA: PublicKey,
    TokenATA: PublicKey,
    reverse: boolean,
    keypair: Keypair,
    amountIn: number | bigint, 
    minAmountOut = 0,
  ) { 
    const account1 = spl.TOKEN_PROGRAM_ID // token program
    const account2 = poolKeys.id; // amm id  writable
    const account3 = poolKeys.authority; // amm authority
    const account4 = poolKeys.openOrders; // amm open orders  writable
    const account5 = poolKeys.targetOrders; // amm target orders  writable
    const account6 = poolKeys.baseVault; // pool coin token account  writable  AKA baseVault
    const account7 = poolKeys.quoteVault; // pool pc token account  writable   AKA quoteVault
    const account8 = poolKeys.marketProgramId; // serum program id
    const account9 = poolKeys.marketId; //   serum market  writable
    const account10 = poolKeys.marketBids; // serum bids  writable
    const account11 = poolKeys.marketAsks; // serum asks  writable
    const account12 = poolKeys.marketEventQueue; // serum event queue  writable
    const account13 = poolKeys.marketBaseVault; // serum coin vault  writable     AKA marketBaseVault
    const account14 = poolKeys.marketQuoteVault; //   serum pc vault  writable    AKA marketQuoteVault
    const account15 = poolKeys.marketAuthority; // serum vault signer       AKA marketAuthority
    const inAmount = amountIn;
    const minAmount = minAmountOut;
    let account16 = wSolATA; // user source token account  writable
    let account17 = TokenATA; // user dest token account   writable
    const account18 = keypair.publicKey; // user owner (signer)  writable
  
    if (reverse === true) {
        account16 = TokenATA;
        account17 = wSolATA;
    }
  
    const args = {
      amountIn: new BN(inAmount.toString()),
      minimumAmountOut: new BN(minAmount)
    };
  
    const buffer = Buffer.alloc(16);
    args.amountIn.toArrayLike(Buffer, 'le', 8).copy(buffer, 0);
    args.minimumAmountOut.toArrayLike(Buffer, 'le', 8).copy(buffer, 8);
    const prefix = Buffer.from([0x09]);
    const instructionData = Buffer.concat([prefix, buffer]);
    const accountMetas = [
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
  
    const swap = new TransactionInstruction({
      keys: accountMetas,
      programId: RayLiqPoolv4,
      data: instructionData
    });

  let buyIxs: TransactionInstruction[] = [];
  let sellIxs: TransactionInstruction[] = [];
  
  if (reverse === false) {
    buyIxs.push(swap);
  }
  
  if (reverse === true) {
    sellIxs.push(swap);
  }
  
  return { buyIxs, sellIxs } ;
}
