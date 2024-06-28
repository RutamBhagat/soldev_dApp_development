import * as dotenv from "dotenv";

import { Connection, PublicKey } from "@solana/web3.js";

dotenv.config();

async function checkAccount(connection: Connection, publicKey: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);
    if (accountInfo === null) {
      console.log("Account does not exist");
    } else {
      console.log("Account exists and is initialized");
    }
  } catch (error) {
    // @ts-ignore
    console.log("Error: ", error.message);
  }
}

(async () => {
  const connection = new Connection("http://localhost:8899", "confirmed");
  const suppliedToPubkey = process.argv[2] || null;
  if (!suppliedToPubkey) {
    console.log(`Please provide a public key to send to`);
    process.exit(1);
  }
  await checkAccount(connection, new PublicKey(suppliedToPubkey)); // replace with the destination account public key
})();
