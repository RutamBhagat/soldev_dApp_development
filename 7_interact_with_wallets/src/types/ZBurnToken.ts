import { addressSchema } from "./ZAddress";
import { amountSchema } from "./ZAmount";
import { z } from "zod";

export const burnTokenSchema = z.object({
  tokenMintAddress: addressSchema,
  amount: amountSchema,
});

export type BurnTokenSchema = z.infer<typeof burnTokenSchema>;
