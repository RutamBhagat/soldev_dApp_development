import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function SolanaBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);

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

  return (
    <CardHeader>
      <CardTitle>SOL Balance</CardTitle>
      <CardDescription>{balance !== null ? `${balance} SOL` : "Loading..."}</CardDescription>
    </CardHeader>
  );
}
