import { addressSchema } from "./ZAddress";
import { amountSchema } from "./ZAmount";
import { z } from "zod";

export const delegateTokenSchema = z.object({
  tokenMintAddress: addressSchema,
  delegateAddress: addressSchema,
  amount: amountSchema,
});

export type DelegateTokenSchema = z.infer<typeof delegateTokenSchema>;
