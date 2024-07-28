"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { z } from "zod";

const amountSchema = z.string().regex(/^\d*\.?\d*$/, { message: "Invalid amount format" });
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

export function SolanaTransfer() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd");

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const result = amountSchema.safeParse(value);
    if (result.success) {
      setAmount(value);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const result = addressSchema.safeParse(value);
    if (result.success) {
      setAddress(value);
    }
  };

  const handleSend = async () => {
    if (!publicKey || !address || !amount || !signTransaction || !sendTransaction) return;

    const amountResult = amountSchema.safeParse(amount);
    const addressResult = addressSchema.safeParse(address);

    if (!amountResult.success || !addressResult.success) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    const toPubkey = new PublicKey(address);
    const lamportsToSend = parseFloat(amount) * LAMPORTS_PER_SOL;

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
      console.log(`Transaction signature: ${signature}`);

      // Show success toast
      toast.success("Transaction sent successfully!", {
        duration: 3000, // 3 seconds
      });
    } catch (error) {
      console.error("Transaction failed:", error);

      // Show error toast
      toast.error("Transaction failed. Please try again.");
    }
  };

  const amountError = amountSchema.safeParse(amount).success
    ? ""
    : amountSchema.safeParse(amount).error?.errors[0]?.message || "Invalid amount format";

  const addressError = addressSchema.safeParse(address).success
    ? ""
    : addressSchema.safeParse(address).error?.errors[0]?.message || "Invalid Solana address format";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardDescription>{balance !== null ? `${balance} SOL` : "Loading..."}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount to send (in SOL)</Label>
          <Input
            id="amount"
            placeholder="0.01"
            value={amount}
            onChange={handleAmountChange}
            className={amountError ? "border-red-500" : ""}
          />
          {amountError && <span className="text-red-500">{amountError}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="address">Send SOL to (recipient address)</Label>
          <Input
            id="address"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            value={address}
            onChange={handleAddressChange}
            className={addressError ? "border-red-500" : ""}
          />
          {addressError && <span className="text-red-500">{addressError}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-gray-900" onClick={handleSend} disabled={!!amountError || !!addressError}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}
