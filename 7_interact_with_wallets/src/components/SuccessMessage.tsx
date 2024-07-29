import React from "react";
import { toast } from "sonner";

export default function SuccessMessage({
  explorerLink,
  transactionMessage,
}: {
  explorerLink: string;
  transactionMessage: string;
}) {
  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => toast.dismiss()}
        className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none absolute right-0 top-0"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold text-green-800 my-2">{transactionMessage}</h2>
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
}
