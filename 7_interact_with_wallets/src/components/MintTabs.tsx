"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BurnToken } from "./mint/BurnToken";
import { DelegateToken } from "./mint/DelegateToken";
import MintAddress from "./mint/MintAddress";
import { MintCreation } from "./mint/MintCreation";
import { MintToken } from "./mint/MintToken";
import SolanaBalance from "./SolanaBalance";
import { TransferToken } from "./mint/TransferToken";
import { useState } from "react";

export function MintTabs() {
  const [mintAddress, setMintAddress] = useState("5d5ZMoXsYcY3kWu44qpG2vNLpsRNtpF1FBLYgRMcCwns");
  return (
    <Tabs defaultValue="mint-creation" className="w-[800px]">
      <SolanaBalance />
      <MintAddress mintAddress={mintAddress} />
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="mint-creation">Mint Creation</TabsTrigger>
        <TabsTrigger value="mint-token">Mint Token</TabsTrigger>
        <TabsTrigger value="transfer-token">Transfer Token</TabsTrigger>
        <TabsTrigger value="burn-token">Burn Token</TabsTrigger>
        <TabsTrigger value="delegate-token">Delegate Token</TabsTrigger>
      </TabsList>
      <TabsContent value="mint-creation">
        <MintCreation mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
      <TabsContent value="mint-token">
        <MintToken mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
      <TabsContent value="transfer-token">
        <TransferToken mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
      <TabsContent value="burn-token">
        <BurnToken mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
      <TabsContent value="delegate-token">
        <DelegateToken mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
    </Tabs>
  );
}
