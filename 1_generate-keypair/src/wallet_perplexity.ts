import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import bs58 from "bs58";
import inquirer from "inquirer";

// Initialize connection to the Solana devnet
const connection = new Connection("https://api.devnet.solana.com");

// Function to convert base58 private key to Keypair
function base58ToKeypair(base58PrivateKey: string): Keypair {
  const privateKeyBuffer = bs58.decode(base58PrivateKey);
  return Keypair.fromSecretKey(privateKeyBuffer);
}

// Function to convert Keypair to base58 private key
function keypairToBase58(keypair: Keypair): string {
  return bs58.encode(keypair.secretKey);
}

// Function to create a new Keypair
function createNewKeypair(): Keypair {
  return Keypair.generate();
}

// Function to request an airdrop
async function requestAirdrop(publicKey: PublicKey): Promise<void> {
  const airdropSignature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSignature);
  console.log(`Airdrop successful! ${LAMPORTS_PER_SOL} lamports sent to ${publicKey.toBase58()}`);
}

// Function to send SOL to another public key
async function sendSol(fromKeypair: Keypair, toPublicKey: PublicKey, amount: number): Promise<void> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
  console.log(`Transaction successful with signature: ${signature}`);
}

// Main function to handle user input
async function main() {
  const question = [
    {
      type: "list",
      name: "option",
      message: "Choose an option:",
      choices: [
        { name: "Base58 to Keypair", value: "1" },
        { name: "Keypair to Base58", value: "2" },
        { name: "Create New Keypair", value: "3" },
        { name: "Request Airdrop", value: "4" },
        { name: "Send SOL", value: "5" },
      ],
    },
  ];

  // @ts-ignore
  const { option } = await inquirer.prompt(question);

  if (option === "1") {
    const questionA = [
      {
        type: "input",
        name: "base58PrivateKey",
        message: "Enter the Base58 private key:",
      },
    ];
    // @ts-ignore
    const { base58PrivateKey } = await inquirer.prompt(questionA);

    try {
      const keypair = base58ToKeypair(base58PrivateKey);
      console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
      const secretKeyArray = Array.from(keypair.secretKey);
      const formattedSecretKey = JSON.stringify(secretKeyArray).replace(/,/g, ", ");
      console.log(`Private Key (Array Format): ${formattedSecretKey}`);
    } catch (error) {
      // @ts-ignore
      console.error("Error: " + error.message);
    }
  } else if (option === "2") {
    const questionB = [
      {
        type: "input",
        name: "secretKeyInput",
        message: "Enter the Keypair secret key as a comma-separated list (e.g., 111, 222, ...):",
      },
    ];
    // @ts-ignore
    const { secretKeyInput } = await inquirer.prompt(questionB);
    const cleanedSecretKeyInput = secretKeyInput.replace(/[\[\]]/g, "");
    const secretKeyArray = cleanedSecretKeyInput.split(",").map((num: string) => parseInt(num.trim(), 10));

    try {
      const keypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      const base58PrivateKey = keypairToBase58(keypair);
      console.log(`Base58 Private Key: ${base58PrivateKey}`);
    } catch (error) {
      // @ts-ignore
      console.error("Error creating keypair: " + error.message);
    }
  } else if (option === "3") {
    const newKeypair = createNewKeypair();
    console.log(`New Keypair created!`);
    console.log(`Public Key: ${newKeypair.publicKey.toBase58()}`);
    const secretKeyArray = Array.from(newKeypair.secretKey);
    const formattedSecretKey = JSON.stringify(secretKeyArray).replace(/,/g, ", ");
    console.log(`Private Key (Array Format): ${formattedSecretKey}`);
  } else if (option === "4") {
    const questionC = [
      {
        type: "input",
        name: "publicKeyInput",
        message: "Enter your public key:",
      },
    ];
    // @ts-ignore
    const { publicKeyInput } = await inquirer.prompt(questionC);

    try {
      const publicKey = new PublicKey(publicKeyInput);
      await requestAirdrop(publicKey);
    } catch (error) {
      // @ts-ignore
      console.error("Error requesting airdrop: " + error.message);
    }
  } else if (option === "5") {
    const questionD = [
      {
        type: "input",
        name: "secretKeyInput",
        message: "Enter your Keypair secret key as a comma-separated list:",
      },
      {
        type: "input",
        name: "recipientPublicKey",
        message: "Enter the recipient's public key:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter the amount of SOL to send:",
      },
    ];
    // @ts-ignore
    const { secretKeyInput, recipientPublicKey, amount } = await inquirer.prompt(questionD);
    const cleanedSecretKeyInput = secretKeyInput.replace(/[\[\]]/g, "");
    const secretKeyArray = cleanedSecretKeyInput.split(",").map((num: string) => parseInt(num.trim(), 10));

    try {
      const keypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      const recipientPublicKeyInstance = new PublicKey(recipientPublicKey);
      await sendSol(keypair, recipientPublicKeyInstance, parseFloat(amount));
    } catch (error) {
      // @ts-ignore
      console.error("Error sending SOL: " + error.message);
    }
  } else {
    console.log("Invalid option. Please choose a valid option.");
  }
}

// Execute the main function
main().catch((error) => {
  console.error("An unexpected error occurred: " + error.message);
});
