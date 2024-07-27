import * as fs from "fs";

import { type CollectionNftData, type NftData } from "../types/nftTypes";
import { PublicKey } from "@solana/web3.js";
import { Metaplex, NftWithToken, toMetaplexFile } from "@metaplex-foundation/js";

export async function uploadMetadata(metaplex: Metaplex, nftData: NftData): Promise<string> {
  // file to buffer
  const buffer = fs.readFileSync("src/" + nftData.imageFile);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, nftData.imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);
  return uri;
}

export async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  collectionMint: PublicKey
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      collection: collectionMint,
    },
    { commitment: "finalized" }
  );

  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

  await metaplex.nfts().verifyCollection({
    //this is what verifies our collection as a Certified Collection
    mintAddress: nft.mint.address,
    collectionMintAddress: collectionMint,
    isSizedCollection: true,
  });

  return nft;
}

export async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  );

  console.log(`Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

  return nft;
}

// helper function update NFT
export async function updateNftUri(metaplex: Metaplex, uri: string, mintAddress: PublicKey) {
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" }
  );

  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

  console.log(`Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}
