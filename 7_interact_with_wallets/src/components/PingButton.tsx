"use client";

import * as web3 from "@solana/web3.js";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { FC } from "react";
import React from "react";
import SuccessMessage from "./SuccessMessage";
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
        toast.success(<SuccessMessage explorerLink={link} transactionMessage="Ping Successful!" />, {
          duration: 3000, // 3 seconds
        });
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed. Please try again.", {
          duration: 3000, // 3 seconds
        });
      });
  };

  return (
    <>
      {connection && publicKey ? (
        <button
          onClick={onClick}
          className="p-4 text-lg font-roboto border-0 bg-violet-900 text-white shadow-md hover:bg-violet-950"
        >
          Ping!
        </button>
      ) : (
        <div className="p-10 text-lg cursor-default font-roboto border-0 bg-violet-900 text-white shadow-md">
          Please connect your wallet
        </div>
      )}
    </>
  );
};
