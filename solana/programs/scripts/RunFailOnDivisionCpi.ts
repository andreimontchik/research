import { ComputeBudgetProgram } from "@solana/web3.js";
import { FailOnDivisionPayload, failOnDivisionPayloadSchema, loadKeyPair } from "./Common";
import { serialize } from "borsh";
import { Buffer } from "buffer";

const web3 = require("@solana/web3.js");

async function main() {

    const scriptName = process.argv[1].split('/').pop()

    console.log("Starting ", scriptName, " with ", process.argv[0]);

    if (process.argv.length !== 4) {
        console.error(`Invalid input arguments! Usage: ${scriptName} <Dividend> <Reminder>`);
        process.exit(1);
    }

    const dividend: number = parseInt(process.argv[2], 10);
    console.log('Dividend:', dividend);
    const remainder: number = parseInt(process.argv[3], 10);
    console.log('Remainder:', remainder);

    const CONNECTION_URL = "http://localhost:8899";

    const payerKeyPair = loadKeyPair("payer.json");
    console.log("Payer: ", payerKeyPair.publicKey);

    const failOnDivisionKeyPair = loadKeyPair("fail-on-division.json");
    console.log("The FailOnDivision Program: ", failOnDivisionKeyPair.publicKey);

    const failOnDivisionCpiKeyPair = loadKeyPair("fail-on-division-cpi.json");
    console.log("The FailOnDivisionCpi Program: ", failOnDivisionCpiKeyPair.publicKey);

    let keys = [
        { pubkey: failOnDivisionKeyPair.publicKey, isSigner: false, isWritable: false },
    ];

    const connection = new web3.Connection(CONNECTION_URL);

    // Add fees
    const cuLimit = 10_000;
    const cuLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
        units: cuLimit,
    });

    const cuPrice = 100_000_000; // 1000 lamports
    const cuPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: cuPrice,
    });

    for (let i = 1; i <= dividend; i++) {

        const transaction = new web3.Transaction({
            feePayer: payerKeyPair.publicKey,
        });
        transaction.add(cuLimitInstruction);
        transaction.add(cuPriceInstruction);

        const payload = new FailOnDivisionPayload({
            dividend,
            divisor: i,
            remainder,

        });
        const payloadBuffer = Buffer.from(serialize(failOnDivisionPayloadSchema, payload));

        const instruction = new web3.TransactionInstruction({
            keys: keys,
            programId: failOnDivisionCpiKeyPair.publicKey,
            data: payloadBuffer,
        });
        transaction.add(instruction);

        console.log(`${new Date(Date.now()).toLocaleString()}: Submitting the transaction ${i}`);
        try {
            const txHash = await web3.sendAndConfirmTransaction(
                connection,
                transaction,
                [payerKeyPair],
            );
            console.log(`${new Date(Date.now()).toLocaleString()}: Transaction ${i} is confirmed. Signature: ${txHash}`);
        } catch (error) {
            console.error(`${new Date(Date.now()).toLocaleString()}: Transaction ${i} is failed. Error: ${error.message}`);
        }
    }

}
main();