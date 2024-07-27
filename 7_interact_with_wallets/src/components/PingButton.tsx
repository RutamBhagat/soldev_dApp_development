import * as web3 from "@solana/web3.js";

import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const PROGRAM_ID = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
const DATA_ACCOUNT_PUBKEY = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

export const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [showPopup, setShowPopup] = useState(false);
  const [explorerLink, setExplorerLink] = useState("");

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
    sendTransaction(transaction, connection).then((signature) => {
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`You can view your transaction on Solana Explorer at:\n${link}`);
      setExplorerLink(link);
      setShowPopup(true);
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

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Transaction Submitted</h2>
            <p className="mb-4">You can view your transaction on Solana Explorer:</p>
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline block mb-6"
            >
              View on Solana Explorer
            </a>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full p-2 bg-violet-800 text-white rounded hover:bg-violet-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
