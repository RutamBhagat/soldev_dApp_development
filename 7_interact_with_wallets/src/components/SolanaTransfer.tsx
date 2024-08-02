"use client";

import { Card, CardContent, CardFooter } from "./ui/card";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SolanaBalance from "./SolanaBalance";
import { SuccessMessage } from "./SuccessMessage";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const amountSchema = z.string().regex(/^\d*\.?\d*$/, { message: "Invalid amount format" });
const addressSchema = z
  .string()

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

const transferSchema = z.object({
  amount: amountSchema,
  address: addressSchema,
});

type TransferSchema = z.infer<typeof transferSchema>;

export function SolanaTransfer() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransferSchema>({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = async (data: TransferSchema) => {
    if (!publicKey || !signTransaction || !sendTransaction) return;

    const toPubkey = new PublicKey(data.address);
    const lamportsToSend = parseFloat(data.amount) * LAMPORTS_PER_SOL;

    try {
      // Fetch the latest blockhash and fee calculator
      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: lamportsToSend,
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await sendTransaction(signedTransaction, connection);
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);

      // Show success toast
      toast.success(<SuccessMessage explorerLink={link} transactionMessage={"Transaction Submitted"} />, {
        duration: 3000, // 3 seconds
      });

      reset();
    } catch (error) {
      console.error("Transaction failed:", error);

      // Show error toast
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <Card>
      <SolanaBalance />
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount to send (in SOL)</Label>
          <Input
            id="amount"
            placeholder="0.01"
            {...register("amount")}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && <span className="text-red-500">{errors.amount.message}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="address">Send SOL to (recipient address)</Label>
          <Input
            id="address"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            {...register("address")}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && <span className="text-red-500">{errors.address.message}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-violet-900" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}
