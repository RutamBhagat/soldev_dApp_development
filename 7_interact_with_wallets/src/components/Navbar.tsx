"use client";

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButtonDynamic = dynamic(async () => WalletMultiButton, { ssr: false });

export default function NavBar() {
  const wallet = useWallet();

  return (
    <div className="h-full flex-col flex bg-gray-900">
      <div className="container flex justify-between items-center py-4 h-16">
        <h2 className="text-lg font-semibold text-white flex-shrink-0">Solana Wallet Interactions</h2>
        <div className="ml-auto flex items-center space-x-2">
          <WalletMultiButtonDynamic>
            {wallet.publicKey ? `${wallet.publicKey.toBase58().substring(0, 7)}...` : "Connect Wallet"}
          </WalletMultiButtonDynamic>
        </div>
      </div>
    </div>
  );
}
