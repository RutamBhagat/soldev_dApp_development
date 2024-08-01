"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SuccessMessage from "../SuccessMessage";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addressSchema = z.string().refine(
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

export function MintCreation({
  mintAddress,
  setMintAddress,
}: {
  mintAddress: string;
  setMintAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MintCreationSchema>({
    resolver: zodResolver(mintCreationSchema),
    defaultValues: {
      tokenMintAddress: mintAddress || "",
    },
  });

  const [tokenMint, setTokenMint] = useState<string | null>(null);
  const [tokenAccountOwner, setTokenAccountOwner] = useState<string | null>(null);

  useEffect(() => {
    if (tokenMint) {
      setMintAddress(tokenMint);
    }
  }, [tokenMint, setMintAddress]);

  const createMint = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const instructions = [
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
        ),
      ];

      const latestBlockhash = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([mintKeypair]);

      const signature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      setTokenMint(mintPublicKey.toString());
      setMintAddress(mintPublicKey.toString());
      setValue("tokenMintAddress", mintPublicKey.toString()); // Update the form state manually
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);

      // Show success toast
      toast.success(<SuccessMessage explorerLink={link} transactionMessage={"Token Mint Created"} />, {
        duration: 3000, // 3 seconds
      });
    } catch (error) {
      toast.error("Failed to create token mint");
      console.error(error);
    }
  };

  const createTokenAccount = async (data: MintCreationSchema) => {
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

      const instruction = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        associatedTokenAddress,
        tokenAccountOwnerPublicKey,
        tokenMintPublicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const latestBlockhash = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      const signature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      console.log("Associated Token Account:", associatedTokenAddress.toString());
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);

      // Show success toast
      toast.success(<SuccessMessage explorerLink={link} transactionMessage={"Token Account Created"} />, {
        duration: 3000, // 3 seconds
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("TokenAccountNotFoundError")) {
        toast.info("Token account already exists");
      } else {
        toast.error("Failed to create token account");
        console.error(error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="token-mint">Token Mint</Label>
          <Input
            id="token-mint"
            placeholder="EB9oi8BZA5RkKxd7VzwUt6JQF2W2UNniCzBj7T3gx44P"
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
          onClick={createMint} // Directly call createMint function
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
