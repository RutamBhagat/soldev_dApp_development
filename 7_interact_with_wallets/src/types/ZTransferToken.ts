import { addressSchema } from "./ZAddress";
import { amountSchema } from "./ZAmount";
import { z } from "zod";

export const transferTokenSchema = z.object({
  tokenMintAddress: addressSchema,
  toAddress: addressSchema,
  amount: amountSchema,
});

export type TransferTokenSchema = z.infer<typeof transferTokenSchema>;
