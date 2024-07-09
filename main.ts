import { createKeypairs } from "./src/createKeys";
import { buyBundle } from "./src/makeBuyers";
import { sender } from "./src/senderUI";
import { sellXPercentagePF } from './src/sellFunc';
import promptSync from 'prompt-sync';
import { sellXPercentageRAY } from "./src/sellRay";
import { sellXKeypairRAY } from "./src/sellInd";


const prompt = promptSync();

async function main() {
    let running = true;

    while (running) {
        console.log("\nMenu:");
        console.log("1. Create Keypairs");
        console.log("2. Pre Buy Checklist");
        console.log("3. Make Buyers Bundle-1");
        console.log("4. Make Buyers Bundle-2");
        console.log("5. Sell Individual Keypairs");
        console.log("6. Sell % of Supply on Pump.Fun");
        console.log("7. Sell % of Supply on Raydium");
        console.log("Type 'exit' to quit.");

        const answer = prompt("Choose an option or 'exit': "); // Use prompt-sync for user input

        switch (answer) {
            case '1':
                await createKeypairs();
                break;
            case '2':
                await sender();
                break;
            case '3':
                await buyBundle(1);
                break;
            case '4':
                await buyBundle(2);
                break;
            case '5':
                await sellXKeypairRAY();
                break;
            case '6':
                await sellXPercentagePF();
                break;
            case '7':
                await sellXPercentageRAY();
                break;
            case 'exit':
                running = false;
                break;
            default:
                console.log("Invalid option, please choose again.");
        }
    }

    console.log("Exiting...");
    process.exit(0);
}

main().catch(err => {
    console.error("Error:", err);
});
