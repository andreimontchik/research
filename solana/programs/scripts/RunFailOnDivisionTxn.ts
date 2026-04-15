import { ComputeBudgetProgram } from "@solana/web3.js";
import { FailOnDivisionPayload, failOnDivisionPayloadSchema, loadKeyPair } from "./Common";
import { serialize } from "borsh";
import { Buffer } from "buffer";

const web3 = require("@solana/web3.js");

async function main() {

    const scriptName = process.argv[1].split('/').pop()

    console.log("Starting ", scriptName, " with ", process.argv[0]);

    if (process.argv.length !== 5) {
        console.error(`Invalid input arguments! Usage: ${scriptName} <Dividend> <Reminder> <NumberOfInstructions>`);
        process.exit(1);
    }

    const dividend: number = parseInt(process.argv[2], 10);
    console.log('Dividend:', dividend);
    const remainder: number = parseInt(process.argv[3], 10);
    console.log('Remainder:', remainder);
    const numOfInstructions: number = parseInt(process.argv[4], 10);
    console.log('NumberOfInstructions:', numOfInstructions);

    const CONNECTION_URL = "http://localhost:8899";

    const payerKeyPair = loadKeyPair("payer.json");
    console.log("Payer: ", payerKeyPair.publicKey);

    const programKeyPair = loadKeyPair("fail-on-division.json");
    console.log("Program: ", programKeyPair.publicKey);

    const connection = new web3.Connection(CONNECTION_URL);

    let keys = [{ pubkey: payerKeyPair.publicKey, isSigner: true, isWritable: true }];

    for (let i = 1; i <= dividend; i++) {

        const transaction = new web3.Transaction({
            feePayer: payerKeyPair.publicKey,
        });

        // Add fees
        const cuLimit = 5_000 * numOfInstructions;
        const cuLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
            units: cuLimit,
        });
        transaction.add(cuLimitInstruction);

        const cuPrice = 100_000_000; // 1000 lamports
        const cuPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: cuPrice,
        });
        transaction.add(cuPriceInstruction);

        // Add instructions
        for (let j = 0; j < numOfInstructions; j++) {

            const payload = new FailOnDivisionPayload({
                dividend,
                divisor: i + j,
                remainder,
            });
            const payloadBuffer = Buffer.from(serialize(failOnDivisionPayloadSchema, payload));
            const transactionInstruction = new web3.TransactionInstruction({
                keys: keys,
                programId: programKeyPair.publicKey,
                data: payloadBuffer,
            });
            transaction.add(transactionInstruction);
        }

        try {

            console.log(`${new Date(Date.now()).toLocaleString()}: Processing the transaction with divisor ${i} ...`);

            const simulationResult = await connection.simulateTransaction(
                transaction
            );
            console.log(`According to simulation, the transaction ${i} will consume ${simulationResult.value.unitsConsumed} out of ${cuLimit} CUs in fees.`);

            console.log(`${new Date(Date.now()).toLocaleString()}: Submitting the transaction ${i}`);
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
