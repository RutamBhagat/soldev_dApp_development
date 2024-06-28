import { getHashedNameSync, getNameAccountKeySync, NameRegistryState } from "@bonfida/spl-name-service";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

export const get_public_key = async (input: string) => {
  if (!input) {
    throw new Error("Provide a .SOL domain or a public key to resolve!");
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"));

  try {
    if (input.includes(".sol")) {
      // Resolve public key from domain
      const domain = input;
      const hashedName = await getHashedNameSync(domain.replace(".sol", ""));
      const nameAccountKey = await getNameAccountKeySync(
        hashedName,
        undefined,
        new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
      );
      const owner = await NameRegistryState.retrieve(connection, nameAccountKey);
      const publicKey = owner.registry.owner.toBase58();
      console.log(`✅ The public key for the domain ${domain} is ${publicKey}`);
      return publicKey;
    }
    return input;
  } catch (error) {
    throw new Error(`❌ Failed to resolve the input ${input}`);
  }
};
