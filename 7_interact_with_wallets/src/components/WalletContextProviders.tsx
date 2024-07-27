"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import * as web3 from "@solana/web3.js";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

export default function WalletContextProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //input your RPC as your endpoint value
  const endpoint = web3.clusterApiUrl("devnet");

  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
