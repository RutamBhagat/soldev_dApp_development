"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MintAddress from "./mint/MintAddress";
import { MintCreation } from "./mint/MintCreation";
import { MintToken } from "./mint/MintToken";
import SolanaBalance from "./SolanaBalance";
import { useState } from "react";

export function MintTabs() {
  const [mintAddress, setMintAddress] = useState("DCcV7CCDcTeoZwmPph4wqJsobCeN9QMZkYH7WzVy8Z6X");
  return (
    <Tabs defaultValue="mint-creation" className="w-[400px]">
      <SolanaBalance />
      <MintAddress mintAddress={mintAddress} />
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mint-creation">Mint Creation</TabsTrigger>
        <TabsTrigger value="mint-token">Mint Token</TabsTrigger>
      </TabsList>
      <TabsContent value="mint-creation">
        <MintCreation mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
      <TabsContent value="mint-token">
        <MintToken mintAddress={mintAddress} setMintAddress={setMintAddress} />
      </TabsContent>
    </Tabs>
  );
}
