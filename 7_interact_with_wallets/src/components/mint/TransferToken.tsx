"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
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

const amountSchema = z.number().int().positive({ message: "Amount must be a positive integer" });
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

const transferTokenSchema = z.object({
  tokenMintAddress: addressSchema,
  toAddress: addressSchema,
  amount: amountSchema,
});

type TransferTokenSchema = z.infer<typeof transferTokenSchema>;

export function TransferToken({
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
  } = useForm<TransferTokenSchema>({
    resolver: zodResolver(transferTokenSchema),
    defaultValues: {
      tokenMintAddress: mintAddress || "",
      amount: 1,
    },
  });

  useEffect(() => {
    if (mintAddress) {
      setValue("tokenMintAddress", mintAddress);
    }
  }, [mintAddress, setValue]);

  const onSubmit = async (data: TransferTokenSchema) => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const mintPublicKey = new PublicKey(data.tokenMintAddress);
      const toPublicKey = new PublicKey(data.toAddress);

      // Get the associated token accounts for the sender and recipient
      const fromATA = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const toATA = await getAssociatedTokenAddress(
        mintPublicKey,
        toPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Check if the recipient's associated token account exists
      const toAccountInfo = await connection.getAccountInfo(toATA);
      if (!toAccountInfo) {
        // If it doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            toATA,
            toPublicKey,
            mintPublicKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add the transfer instruction
      transaction.add(createTransferInstruction(fromATA, toATA, publicKey, BigInt(data.amount), [], TOKEN_PROGRAM_ID));

      // Send the transaction
      const signature = await sendTransaction(transaction, connection);

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);

      toast.success(<SuccessMessage explorerLink={link} transactionMessage={"Tokens Transferred"} />, {
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
            {...register("tokenMintAddress")}
            className={errors.tokenMintAddress ? "border-red-500" : ""}
            onChange={(e) => setMintAddress(e.target.value)}
          />
          {errors.tokenMintAddress && <span className="text-red-500">{errors.tokenMintAddress.message}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="from-address">From Address</Label>
          <Input id="from-address" value={publicKey?.toString() || ""} disabled />
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="to-address">To Address</Label>
          <Input
            id="to-address"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            {...register("toAddress")}
            className={errors.toAddress ? "border-red-500" : ""}
          />
          {errors.toAddress && <span className="text-red-500">{errors.toAddress.message}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount of tokens to transfer</Label>
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
          Transfer Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}
