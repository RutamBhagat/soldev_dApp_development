import { addressSchema } from "./ZAddress";
import { amountSchema } from "./ZAmount";
import { z } from "zod";

export const mintTokenSchema = z.object({
  amount: amountSchema,
  tokenMintAddress: addressSchema,
  recipientAddress: addressSchema,
});

export type MintTokenSchema = z.infer<typeof mintTokenSchema>;
