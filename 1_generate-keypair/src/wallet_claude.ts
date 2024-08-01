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
async function requestAirdrop(connection: Connection, publicKey: PublicKey, amount: number): Promise<string> {
  const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature);
  return signature;
}

// Function to send SOL
async function sendSOL(connection: Connection, from: Keypair, to: PublicKey, amount: number): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
  return signature;
}

// Main function to handle user input
async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const mainQuestion = [
    {
      type: "list",
      name: "option",
      message: "Choose an option:",
      choices: [
        { name: "Utils", value: "1" },
        { name: "Create New Keypair", value: "2" },
        { name: "Request Airdrop", value: "3" },
        { name: "Send SOL", value: "4" },
      ],
    },
  ];

  // @ts-ignore
  const { option } = await inquirer.prompt(mainQuestion);

  if (option === "1") {
    const utilsQuestion = [
      {
        type: "list",
        name: "utilOption",
        message: "Choose a utility option:",
        choices: [
          { name: "Base58 to Keypair", value: "1" },
          { name: "Keypair to Base58", value: "2" },
        ],
      },
    ];

    // @ts-ignore
    const { utilOption } = await inquirer.prompt(utilsQuestion);

    if (utilOption === "1") {
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
    } else if (utilOption === "2") {
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
    }
  } else if (option === "2") {
    const newKeypair = createNewKeypair();
    console.log(`New Keypair created:`);
    console.log(`Public Key: ${newKeypair.publicKey.toBase58()}`);
    console.log(`Private Key (Base58): ${keypairToBase58(newKeypair)}`);
  } else if (option === "3") {
    const airdropQuestions = [
      {
        type: "input",
        name: "publicKey",
        message: "Enter the public key to receive the airdrop:",
      },
      {
        type: "number",
        name: "amount",
        message: "Enter the amount of SOL to request (max 2):",
        validate: (value: number) => value <= 2 || "Maximum airdrop amount is 2 SOL",
      },
    ];
    // @ts-ignore
    const { publicKey, amount } = await inquirer.prompt(airdropQuestions);
    try {
      const signature = await requestAirdrop(connection, new PublicKey(publicKey), amount);
      console.log(`Airdrop successful. Transaction signature: ${signature}`);
    } catch (error) {
      // @ts-ignore
      console.error("Error requesting airdrop: " + error.message);
    }
  } else if (option === "4") {
    const sendSOLQuestions = [
      {
        type: "input",
        name: "fromPrivateKey",
        message: "Enter the sender's private key (Base58):",
      },
      {
        type: "input",
        name: "toPublicKey",
        message: "Enter the recipient's public key:",
      },
      {
        type: "number",
        name: "amount",
        message: "Enter the amount of SOL to send:",
      },
    ];
    // @ts-ignore
    const { fromPrivateKey, toPublicKey, amount } = await inquirer.prompt(sendSOLQuestions);
    try {
      const fromKeypair = base58ToKeypair(fromPrivateKey);
      const toPublicKeyObj = new PublicKey(toPublicKey);
      const signature = await sendSOL(connection, fromKeypair, toPublicKeyObj, amount);
      console.log(`Transaction successful. Signature: ${signature}`);
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
