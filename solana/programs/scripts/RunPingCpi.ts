import { loadKeyPair } from "./Common";

const web3 = require("@solana/web3.js");

async function main() {

    const CONNECTION_URL = "http://localhost:8899";

    const payerKeyPair = loadKeyPair("payer.json");
    console.log("The Payer: ", payerKeyPair.publicKey);

    const pingKeyPair = loadKeyPair("ping.json");
    console.log("The Ping Program: ", pingKeyPair.publicKey);

    const pingCpiKeyPair = loadKeyPair("ping-cpi.json");
    console.log("The Ping Cpi Program: ", pingCpiKeyPair.publicKey);

    const connection = new web3.Connection(CONNECTION_URL);

    const instruction = new web3.Transaction({
        feePayer: payerKeyPair.publicKey,
    });

    let keys = [
        { pubkey: pingKeyPair.publicKey, isSigner: false, isWritable: false },
    ];

    instruction.add(
        new web3.TransactionInstruction({
            keys: keys,
            programId: pingCpiKeyPair.publicKey,
        }),
    );

    console.log("Sending transaction...");
    const txHash = await web3.sendAndConfirmTransaction(
        connection,
        instruction,
        [payerKeyPair],
    );
    console.log("Transaction Confirmed. Signature:", txHash);
}
main();