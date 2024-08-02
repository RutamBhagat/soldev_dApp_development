"use client";

import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MdContentCopy, MdLibraryAddCheck } from "react-icons/md";
import { useEffect, useState } from "react";

export default function MintAddress({ mintAddress }: { mintAddress: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(mintAddress);
    } else {
      document.execCommand("copy", true, mintAddress);
    }
    setCopied(true);
  };

  return (
    <>
      {mintAddress ? (
        <CardHeader className="relative">
          <CardTitle>Mint Address</CardTitle>
          <CardDescription>{mintAddress}</CardDescription>
          <button
            className="absolute top-2 text-gray-800 right-3 hover:text-gray-600 cursor-pointer"
            onClick={handleCopy}
          >
            {copied ? <MdLibraryAddCheck size={20} /> : <MdContentCopy size={20} />}
          </button>
        </CardHeader>
      ) : null}
    </>
  );
}
