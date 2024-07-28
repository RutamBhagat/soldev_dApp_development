"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SolanaBalance from "./SolanaBalance";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addressSchema = z
  .string()
  .length(44, { message: "Invalid Solana address format" })
  .refine(
    (value) => {
      try {
        new PublicKey(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    { message: "Invalid Solana address format" }
  );

const mintCreationSchema = z.object({
  tokenMintAddress: addressSchema.optional(),
  ownerAddress: addressSchema.optional(),
});

type MintCreationSchema = z.infer<typeof mintCreationSchema>;

export function MintCreation() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MintCreationSchema>({
    resolver: zodResolver(mintCreationSchema),
  });

  const [tokenMint, setTokenMint] = useState<string | null>(null);
  const [tokenAccountOwner, setTokenAccountOwner] = useState<string | null>(null);

  const createMint = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintPublicKey,
          0, // decimals
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection, { signers: [mintKeypair] });
      await connection.confirmTransaction(signature, "processed");

      setTokenMint(mintPublicKey.toString());
      reset({ tokenMintAddress: mintPublicKey.toString() });
      toast.success("Token mint created successfully");
    } catch (error) {
      toast.error("Failed to create token mint");
      console.error(error);
    }
  };

  const createTokenAccount = async () => {
    if (!publicKey || !tokenMint || !tokenAccountOwner) {
      toast.error("Invalid input");
      return;
    }

    try {
      const tokenMintPublicKey = new PublicKey(tokenMint);
      const tokenAccountOwnerPublicKey = new PublicKey(tokenAccountOwner);

      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenMintPublicKey,
        tokenAccountOwnerPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          tokenAccountOwnerPublicKey,
          tokenMintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      toast.success("Token account created successfully");
    } catch (error) {
      toast.error("Failed to create token account");
      console.error(error);
    }
  };

  return (
    <Card>
      <SolanaBalance />
      <CardContent className="grid gap-6">
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="token-mint">Token Mint</Label>
          <Input
            id="token-mint"
            placeholder="J2SFddenUcPYrbc4U4EvvNbipAUnQ7hioXrnJo8ce8H3"
            {...register("tokenMintAddress")}
            className={errors.tokenMintAddress ? "border-red-500" : ""}
            onChange={(e) => setTokenMint(e.target.value)}
          />
          {errors.tokenMintAddress && <span className="text-red-500">{errors.tokenMintAddress.message}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="token-account-owner">Token Account Owner</Label>
          <Input
            id="token-account-owner"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            {...register("ownerAddress")}
            className={errors.ownerAddress ? "border-red-500" : ""}
            onChange={(e) => setTokenAccountOwner(e.target.value)}
          />
          {errors.ownerAddress && <span className="text-red-500">{errors.ownerAddress.message}</span>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
        <Button
          className="w-full bg-violet-900 hover:bg-violet-950"
          onClick={handleSubmit(createMint)}
          disabled={isSubmitting}
        >
          Create Mint
        </Button>
        <Button
          className="w-full bg-violet-900 hover:bg-violet-950"
          onClick={handleSubmit(createTokenAccount)}
          disabled={isSubmitting}
        >
          Create Token Account
        </Button>
      </CardFooter>
    </Card>
  );
}
