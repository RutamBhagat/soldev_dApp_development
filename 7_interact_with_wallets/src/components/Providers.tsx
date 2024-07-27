"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { AlphaWalletAdapter, LedgerWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { FC, useMemo } from "react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

type Props = {
  children?: React.ReactNode;
};

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //input your RPC as your endpoint value
  const endpoint = "https://api-devnet.helius.xyz";

  const wallets = useMemo(() => [new SolflareWalletAdapter(), new AlphaWalletAdapter(), new LedgerWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
