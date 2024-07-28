import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MintCreation } from "./MintCreation";
import { MintToken } from "./MintToken";

export function MintTabs() {
  return (
    <Tabs defaultValue="mint-creation" className="w-[400px]">
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
