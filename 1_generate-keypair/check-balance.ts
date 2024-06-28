import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { get_public_key } from "./get_public_key";

const suppliedPublicKey = process.argv[2];
const resolvedPublicKey = await get_public_key(suppliedPublicKey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

try {
  const publicKey = new PublicKey(resolvedPublicKey);

  const balanceInLamports = await connection.getBalance(publicKey);

  const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

  console.log(`✅ Finished! The balance for the wallet at address ${publicKey} is ${balanceInSOL}!`);
} catch (error) {
  console.error(`❌ Failed to check the balance for the wallet at address ${suppliedPublicKey}!`);
}
