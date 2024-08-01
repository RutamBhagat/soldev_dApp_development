import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MintCreation } from "./mint/MintCreation";
import { MintToken } from "./mint/MintToken";
import SolanaBalance from "./SolanaBalance";

export function MintTabs() {
  return (
    <Tabs defaultValue="mint-creation" className="w-[400px]">
      <SolanaBalance />
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mint-creation">Mint Creation</TabsTrigger>
        <TabsTrigger value="mint-token">Mint Token</TabsTrigger>
      </TabsList>
      <TabsContent value="mint-creation">
        <MintCreation />
      </TabsContent>
      <TabsContent value="mint-token">
        <MintToken />
      </TabsContent>
    </Tabs>
  );
}
