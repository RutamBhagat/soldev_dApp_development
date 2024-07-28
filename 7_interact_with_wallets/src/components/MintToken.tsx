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

export function MintToken() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [tokenMintAddress, setTokenMintAddress] = useState("J2SFddenUcPYrbc4U4EvvNbipAUnQ7hioXrnJo8ce8H3");
  const [ownerAddress, setOwnerAddress] = useState("DCcV7CCDcTeoZwmPph4wqJsobCeN9QMZkYH7WzVy8Z6X");
  const [recipientAddress, setRecipientAddress] = useState("JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd");

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
      setRecipientAddress(value);
    }
  };

  const handleSend = async () => {
    if (!publicKey || !recipientAddress || !amount || !signTransaction || !sendTransaction) return;

    const amountResult = amountSchema.safeParse(amount);
    const addressResult = addressSchema.safeParse(recipientAddress);

    if (!amountResult.success || !addressResult.success) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    const toPubkey = new PublicKey(recipientAddress);
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

  const addressError = addressSchema.safeParse(recipientAddress).success
    ? ""
    : addressSchema.safeParse(recipientAddress).error?.errors[0]?.message || "Invalid Solana address format";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardDescription>{balance !== null ? `${balance} SOL` : "Loading..."}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="address">Token Mint</Label>
          <Input
            id="address"
            placeholder="J2SFddenUcPYrbc4U4EvvNbipAUnQ7hioXrnJo8ce8H3"
            value={tokenMintAddress}
            onChange={handleAddressChange}
            className={addressError ? "border-red-500" : ""}
          />
          {addressError && <span className="text-red-500">{addressError}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="address">Recipient Address</Label>
          <Input
            id="address"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            value={recipientAddress}
            onChange={handleAddressChange}
            className={addressError ? "border-red-500" : ""}
          />
          {addressError && <span className="text-red-500">{addressError}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount of tokens to mint</Label>
          <Input
            id="amount"
            placeholder="0.01"
            value={amount}
            onChange={handleAmountChange}
            className={amountError ? "border-red-500" : ""}
          />
          {amountError && <span className="text-red-500">{amountError}</span>}
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
