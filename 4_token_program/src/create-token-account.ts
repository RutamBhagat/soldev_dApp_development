import "dotenv/config";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

// Subtitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey(
  process.env.TOKEN_MINT_ADDRESS as string
);

// Here we are making an associated token account for our own address, but we can
// make an ATA on any other wallet in devnet!
const recipient = new PublicKey(process.env.RECIPIENT_ADDRESS as string);
// const recipient = user.publicKey;

// This function is flaky, so if it fails, try again. It will work second or third time.
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient
);

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

const link = getExplorerLink(
  "address",
  tokenAccount.address.toBase58(),
  "devnet"
);

console.log(`✅ Created token Account: ${link}`);
