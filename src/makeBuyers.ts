import { connection, PUMP_PROGRAM, feeRecipient, eventAuthority, global, MPL_TOKEN_METADATA_PROGRAM_ID, mintAuthority, rpc, payer } from "../config";
import { PublicKey, VersionedTransaction,  TransactionInstruction, SYSVAR_RENT_PUBKEY, TransactionMessage, SystemProgram, Keypair, LAMPORTS_PER_SOL, AddressLookupTableAccount } from '@solana/web3.js';
import { loadKeypairs1, loadKeypairs2 } from './createKeys';
import { searcherClient } from "./clients/jito";
import { Bundle as JitoBundle } from 'jito-ts/dist/sdk/block-engine/types.js';
import promptSync from 'prompt-sync';
import * as spl from '@solana/spl-token';
import bs58 from 'bs58';
import path from 'path';
import fs from 'fs';
import { Program } from "@coral-xyz/anchor";
import { getRandomTipAccount } from "./clients/config";
import BN from 'bn.js';
import axios from 'axios';
import * as anchor from '@coral-xyz/anchor';


const prompt = promptSync();
const keyInfoPath = path.join(__dirname, 'keyInfo.json');
    

export async function buyBundle(batch: number) {
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(rpc), 
        new anchor.Wallet(payer), 
        {commitment: "confirmed"}
    );

    
    // Initialize pumpfun anchor
    const IDL_PumpFun = JSON.parse(
        fs.readFileSync('./pumpfun-IDL.json', 'utf-8'),
    ) as anchor.Idl;

    const program = new anchor.Program(IDL_PumpFun, PUMP_PROGRAM, provider);
    

    // Initialize custom prog
    const custom_IDL = JSON.parse(
        fs.readFileSync('./custom-IDL.json', 'utf-8'),
    ) as anchor.Idl;

    const CUSTOM_PROGRAM_ID = "5w4duVGX1zCdH9JwuN7r674SMeG9RMyhYAqYY3iEyw1P";

    const program_custom = new anchor.Program(custom_IDL, CUSTOM_PROGRAM_ID, provider);


    // Start buy bundle
    const bundledTxns: VersionedTransaction[] = [];

    let keypairs;
    if (batch === 1) {
        keypairs = loadKeypairs1();
    } else if (batch === 2) {
        keypairs = loadKeypairs2();
    } else {
        console.log('Failed to load keypairs');
        process.exit(0);
    }

    let keyInfo: { [key: string]: any } = {};
    if (fs.existsSync(keyInfoPath)) {
        const existingData = fs.readFileSync(keyInfoPath, 'utf-8');
        keyInfo = JSON.parse(existingData);
    }

    const lut = new PublicKey(keyInfo.addressLUT.toString());

    const lookupTableAccount = (
        await connection.getAddressLookupTable(lut)
    ).value;

    if (lookupTableAccount == null) {
        console.log("Lookup table account not found!");
        process.exit(0);
    }

    // -------- step 1: ask nessesary questions for pool build --------
    const ca = new PublicKey(prompt("Address of your token: "));
    const jitoTipAmt = +prompt('Jito tip in Sol (Ex. 0.01): ') * LAMPORTS_PER_SOL;


    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), ca.toBytes()],
        program.programId,
    );
    let [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
        bondingCurve.toBytes(),
        spl.TOKEN_PROGRAM_ID.toBytes(),
        ca.toBytes(),
    ],
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const { blockhash } = await connection.getLatestBlockhash();
    
    const txMainSwaps: VersionedTransaction[] = await createWalletSwaps(
        blockhash,
        keypairs,
        lookupTableAccount,
        bondingCurve,
        associatedBondingCurve,
        ca,
        program_custom,
        jitoTipAmt
    )
    bundledTxns.push(...txMainSwaps);
        
    // -------- step 4: send bundle --------
        /*
        // Simulate each transaction
        for (const tx of bundledTxns) {
            try {
                const simulationResult = await connection.simulateTransaction(tx, { commitment: "processed" });
                console.log(simulationResult);

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

    await sendBundle(bundledTxns);
}




async function createWalletSwaps(
  blockhash: string,
  keypairs: Keypair[],
  lut: AddressLookupTableAccount,
  bondingCurve: PublicKey,
  associatedBondingCurve: PublicKey,
  mint: PublicKey,
  program: Program,
  jitoTipAmt: number
): Promise<VersionedTransaction[]> {
  const txsSigned: VersionedTransaction[] = [];
  const chunkedKeypairs = chunkArray(keypairs, 5);

  // Load keyInfo data from JSON file
  let keyInfo: { [key: string]: { solAmount: number, tokenAmount: string, percentSupply: number } } = {};
  if (fs.existsSync(keyInfoPath)) {
    const existingData = fs.readFileSync(keyInfoPath, 'utf-8');
    keyInfo = JSON.parse(existingData);
  }

  // Iterate over each chunk of keypairs
  for (let chunkIndex = 0; chunkIndex < chunkedKeypairs.length; chunkIndex++) {
    const chunk = chunkedKeypairs[chunkIndex];
    const instructionsForChunk: TransactionInstruction[] = [];

    // Iterate over each keypair in the chunk to create swap instructions
    for (let i = 0; i < chunk.length; i++) {
      const keypair = chunk[i];
      console.log(`Processing keypair ${i + 1}/${chunk.length}:`, keypair.publicKey.toString());

      const ataAddress = await spl.getAssociatedTokenAddress(
        mint,
        keypair.publicKey,
      );

      // Extract tokenAmount from keyInfo for this keypair
      const keypairInfo = keyInfo[keypair.publicKey.toString()];
      if (!keypairInfo) {
        console.log(`No key info found for keypair: ${keypair.publicKey.toString()}`);
        continue;
      }

      const sol_amount = new BN(keypairInfo.solAmount * LAMPORTS_PER_SOL);
      const max_sol_cost = new BN(100000 * LAMPORTS_PER_SOL);

      // Create the transaction for pumpfun_buy
        const buyIx = await program.methods
        .pumpfunBuy(sol_amount, max_sol_cost)
        .accounts({
            global,
            feeRecipient,
            mint,
            bondingCurve,
            associatedBondingCurve,
            associatedUser: ataAddress,
            user: keypair.publicKey,
            fromAccount: payer.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            eventAuthority,
            program: PUMP_PROGRAM,
        })
        .instruction();

      instructionsForChunk.push(buyIx);
    }

    if (chunkIndex === chunkedKeypairs.length - 1) {
        instructionsForChunk.push(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: getRandomTipAccount(),
                lamports: BigInt(jitoTipAmt),
            })
        );
    }
    

    const message = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions: instructionsForChunk,
    }).compileToV0Message([lut]);

    const versionedTx = new VersionedTransaction(message);

    const serializedMsg = versionedTx.serialize();
    console.log("Txn size:", serializedMsg.length);
    if (serializedMsg.length > 1232) {
      console.log('tx too big');
    }

    // Sign with the wallet for tip on the last instruction
    for (const kp of chunk) {
      if (kp.publicKey.toString() in keyInfo) {
        versionedTx.sign([kp]);
      }
    }

    versionedTx.sign([payer]);

    txsSigned.push(versionedTx);
  }

  return txsSigned;
}


function chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
        array.slice(i * size, i * size + size)
    );
}

export async function sendBundle(bundledTxns: VersionedTransaction[]) {
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

