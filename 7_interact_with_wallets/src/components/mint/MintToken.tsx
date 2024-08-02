"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ConfirmOptions, PublicKey, Transaction } from "@solana/web3.js";
import { MintTokenSchema, mintTokenSchema } from "@/types/ZMintToken";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuccessMessage } from "../SuccessMessage";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function MintToken({
  mintAddress,
  setMintAddress,
}: {
  mintAddress: string;
  setMintAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MintTokenSchema>({
    resolver: zodResolver(mintTokenSchema),
    defaultValues: {
      tokenMintAddress: mintAddress || "",
      amount: 1,
    },
  });

  const onSubmit = async (data: MintTokenSchema) => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    const tokenMintPublicKey = new PublicKey(data.tokenMintAddress);
    const recipientPublicKey = new PublicKey(data.recipientAddress);

    try {
      // Fetch the mint info to get the decimals
      const mintInfo = await getMint(connection, tokenMintPublicKey);
      const decimals = mintInfo.decimals;

      // Calculate the amount to mint using the correct decimals
      const amountToMint = Math.floor(data.amount * Math.pow(10, decimals));

      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenMintPublicKey,
        recipientPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Create a transaction
      const transaction = new Transaction();

      // Check if the associated token account exists
      const associatedTokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);
      if (!associatedTokenAccountInfo) {
        // If it doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            associatedTokenAddress, // associated token account
            recipientPublicKey, // owner
            tokenMintPublicKey, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add the mint instruction
      transaction.add(
        createMintToInstruction(
          tokenMintPublicKey,
          associatedTokenAddress,
          publicKey,
          BigInt(amountToMint),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection, { signers: [] });

      const confirmOptions: ConfirmOptions = {
        commitment: "processed",
        preflightCommitment: "processed",
      };
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        confirmOptions.commitment
      );

      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);

      toast.success(<SuccessMessage explorerLink={link} transactionMessage={"Tokens Minted"} />, {
        duration: 3000,
      });
      reset();
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed. Please try again.");
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
            {...register("tokenMintAddress", {
              onChange: (e) => setMintAddress(e.target.value),
            })}
            className={errors.tokenMintAddress ? "border-red-500" : ""}
          />
          {errors.tokenMintAddress && <span className="text-red-500">{errors.tokenMintAddress.message}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="recipient-address">Recipient Address</Label>
          <Input
            id="recipient-address"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            {...register("recipientAddress")}
            className={errors.recipientAddress ? "border-red-500" : ""}
          />
          {errors.recipientAddress && <span className="text-red-500">{errors.recipientAddress.message}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount of tokens to mint</Label>
          <Input
            id="amount"
            placeholder="100"
            {...register("amount", { valueAsNumber: true })}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && <span className="text-red-500">{errors.amount.message}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-violet-900 hover:bg-violet-950"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          Mint Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}
