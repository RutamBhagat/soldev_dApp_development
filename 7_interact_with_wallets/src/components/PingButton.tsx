"use client";

import * as web3 from "@solana/web3.js";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { FC } from "react";
import React from "react";
import { toast } from "sonner";

const PROGRAM_ID = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
const DATA_ACCOUNT_PUBKEY = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

export const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = () => {
    if (!connection || !publicKey) {
      return;
    }

    const programId = new web3.PublicKey(PROGRAM_ID);
    const programDataAccount = new web3.PublicKey(DATA_ACCOUNT_PUBKEY);
    const transaction = new web3.Transaction();

    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: programDataAccount,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId,
    });

    transaction.add(instruction);
    sendTransaction(transaction, connection)
      .then((signature) => {
        const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        console.log(`You can view your transaction on Solana Explorer at:\n${link}`);
        toast.success(<SuccessMessage explorerLink={link} />, {
          duration: 5000, // 5 seconds
        });
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed. Please try again.", {
          duration: 5000, // 5 seconds
        });
      });
  };

  return (
    <>
      {connection && publicKey ? (
        <button
          onClick={onClick}
          className="p-4 text-lg font-roboto border-0 bg-violet-800 text-white shadow-md hover:bg-violet-900"
        >
          Ping!
        </button>
      ) : (
        <div className="p-10 text-lg cursor-default font-roboto border-0 bg-blue-800 text-white shadow-md">
          Please connect your wallet
        </div>
      )}
    </>
  );
};

export const SuccessMessage = ({ explorerLink }: { explorerLink: string }) => {
  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => toast.dismiss()}
        className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none absolute right-0 top-0"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold text-green-800 my-2">Transaction Submitted</h2>
      <p className="text-gray-700 mb-2">You can view your transaction on Solana Explorer:</p>
      <a
        href={explorerLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline block mb-4"
      >
        View on Solana Explorer
      </a>
    </div>
  );
};
