import { loadKeyPair } from "./Common";

const web3 = require("@solana/web3.js");

async function main() {

    const CONNECTION_URL = "http://localhost:8899";

    const payerKeyPair = loadKeyPair("payer.json");
    console.log("Payer: ", payerKeyPair.publicKey);

    const programKeyPair = loadKeyPair("ping.json");
    console.log("Program: ", programKeyPair.publicKey);

    const connection = new web3.Connection(CONNECTION_URL);

    const transaction = new web3.Transaction({
        feePayer: payerKeyPair.publicKey,
    });

    transaction.add(
        new web3.TransactionInstruction({
            keys: [],
            programId: programKeyPair.publicKey,
        }),
    );

    console.log("Sending transaction...");
    const txHash = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [payerKeyPair],
    );
    console.log("Transaction Confirmed. Signature:", txHash);
}
main();