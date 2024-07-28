"use client";

import { Card, CardContent, CardFooter } from "./ui/card";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SolanaBalance from "./SolanaBalance";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";

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

export function MintCreation() {
  const [tokenMintAddress, setTokenMintAddress] = useState("J2SFddenUcPYrbc4U4EvvNbipAUnQ7hioXrnJo8ce8H3");
  const [ownerAddress, setOwnerAddress] = useState("DCcV7CCDcTeoZwmPph4wqJsobCeN9QMZkYH7WzVy8Z6X");
  const [recipientAddress, setRecipientAddress] = useState("JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const result = addressSchema.safeParse(value);
    if (result.success) {
      setRecipientAddress(value);
    }
  };

  const addressError = addressSchema.safeParse(recipientAddress).success
    ? ""
    : addressSchema.safeParse(recipientAddress).error?.errors[0]?.message || "Invalid Solana address format";

  return (
    <Card>
      <SolanaBalance />
      <CardContent className="grid gap-6">
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="token-mint">Token Mint</Label>
          <Input
            id="token-mint"
            placeholder="J2SFddenUcPYrbc4U4EvvNbipAUnQ7hioXrnJo8ce8H3"
            value={tokenMintAddress}
            onChange={handleAddressChange}
            className={addressError ? "border-red-500" : ""}
          />
          {addressError && <span className="text-red-500">{addressError}</span>}
        </div>
        <div className="grid gap-2 md:min-w-[500px]">
          <Label htmlFor="token-account-owner">Token Account Owner</Label>
          <Input
            id="token-account-owner"
            placeholder="JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd"
            value={recipientAddress}
            onChange={handleAddressChange}
            className={addressError ? "border-red-500" : ""}
          />
          {addressError && <span className="text-red-500">{addressError}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-gray-900" onClick={() => {}} disabled={!!addressError}>
          Mint Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}
