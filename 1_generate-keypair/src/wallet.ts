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

// Main function to handle user input
async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  while (true) {
    const mainQuestion = [
      {
        type: "list",
        name: "option",
        message: "Choose an option:",
        choices: [
          { name: "Create New Keypair", value: "1" },
          { name: "Request Airdrop", value: "2" },
          { name: "Send SOL", value: "3" },
          { name: "Utils", value: "4" },
          { name: "Exit", value: "5" },
        ],
      },
    ];

    // @ts-ignore
    const { option } = await inquirer.prompt(mainQuestion);

    if (option === "1") {
      await handleCreateNewKeypair();
    } else if (option === "2") {
      await handleRequestAirdrop(connection);
    } else if (option === "3") {
      await handleSendSOL(connection);
    } else if (option === "4") {
      await handleUtils();
    } else if (option === "5") {
      console.log("Exiting the program. Goodbye!");
      break;
    } else {
      console.log("Invalid option. Please choose a valid option.");
    }

    console.log("\n"); // Add a newline for better readability
  }
}

async function handleUtils() {
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
      const keypair = base58ToKeypair(base58PrivateKey.trim());
      console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
      const secretKeyArray = Array.from(keypair.secretKey);
      const formattedSecretKey = JSON.stringify(secretKeyArray).replace(/,/g, ", ");
      console.log(`Private Key (Array Format): ${formattedSecretKey}`);
    } catch (error) {
      console.error("Error: " + (error as Error).message);
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
    if (secretKeyArray.length !== 64) {
      console.error("Error: Invalid secret key array length. Expected 64 numbers.");
      return;
    }
    try {
      const keypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      const base58PrivateKey = keypairToBase58(keypair);
      console.log(`Base58 Private Key: ${base58PrivateKey}`);
    } catch (error) {
      console.error("Error creating keypair: " + (error as Error).message);
    }
  }
}

async function handleCreateNewKeypair() {
  const newKeypair = createNewKeypair();
  console.log(`New Keypair created:`);
  console.log(`Public Key: ${newKeypair.publicKey.toBase58()}`);
  console.log(`Private Key (Base58): ${keypairToBase58(newKeypair)}`);
}

async function handleRequestAirdrop(connection: Connection) {
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
      validate: (value: number) => (value > 0 && value <= 2) || "Airdrop amount must be between 0 and 2 SOL",
    },
  ];
  // @ts-ignore
  const { publicKey, amount } = await inquirer.prompt(airdropQuestions);
  try {
    const publicKeyObj = new PublicKey(publicKey.trim());
    const signature = await requestAirdrop(connection, publicKeyObj, amount);
    console.log(`Airdrop successful. Transaction signature: ${signature}`);
  } catch (error) {
    console.error("Invalid public key or airdrop failed: " + (error as Error).message);
  }
}

async function handleSendSOL(connection: Connection) {
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
      validate: (value: number) => value > 0 || "Amount must be greater than 0",
    },
  ];
  // @ts-ignore
  const { fromPrivateKey, toPublicKey, amount } = await inquirer.prompt(sendSOLQuestions);
  try {
    const fromKeypair = base58ToKeypair(fromPrivateKey.trim());
    const toPublicKeyObj = new PublicKey(toPublicKey.trim());
    const signature = await sendSOL(connection, fromKeypair, toPublicKeyObj, amount);
    console.log(`Transaction successful. Signature: ${signature}`);
  } catch (error) {
    console.error("Error sending SOL: " + (error as Error).message);
  }
}

// Utility functions moved to the bottom
function base58ToKeypair(base58PrivateKey: string): Keypair {
  try {
    const privateKeyBuffer = bs58.decode(base58PrivateKey);
    return Keypair.fromSecretKey(privateKeyBuffer);
  } catch (error) {
    throw new Error("Invalid Base58 private key");
  }
}

function keypairToBase58(keypair: Keypair): string {
  return bs58.encode(keypair.secretKey);
}

function createNewKeypair(): Keypair {
  return Keypair.generate();
}

async function requestAirdrop(connection: Connection, publicKey: PublicKey, amount: number): Promise<string> {
  if (amount <= 0 || amount > 2) {
    throw new Error("Airdrop amount must be between 0 and 2 SOL");
  }
  const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature);
  return signature;
}

async function sendSOL(connection: Connection, from: Keypair, to: PublicKey, amount: number): Promise<string> {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const balance = await connection.getBalance(from.publicKey);
  if (balance < amount * LAMPORTS_PER_SOL) {
    throw new Error("Insufficient balance");
  }

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

// Execute the main function
main().catch((error) => {
  console.error("An unexpected error occurred: " + (error as Error).message);
});
