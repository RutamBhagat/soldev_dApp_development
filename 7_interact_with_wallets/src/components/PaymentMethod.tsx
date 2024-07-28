"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

export function PaymentMethod() {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("JCZjJcmuWidrj5DwuJBxwqHx7zRfiBAp6nCLq3zYmBxd");
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setAmountError("");
    } else {
      setAmountError("Invalid amount format");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    try {
      if (value.length !== 44) {
        throw new Error("Invalid length");
      }
      new PublicKey(value);
      setAddressError("");
    } catch (error) {
      setAddressError("Invalid Solana address format");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardDescription>0.01 SOL</CardDescription>
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
          <Label htmlFor="address">Send SOL to (recepient address)</Label>
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
        <Button className="w-full" disabled={!!amountError || !!addressError}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}
