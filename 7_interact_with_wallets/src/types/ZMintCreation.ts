import { addressSchema } from "./ZAddress";
import { z } from "zod";

export const mintCreationSchema = z.object({
  tokenMintAddress: addressSchema.optional(),
  ownerAddress: addressSchema.optional(),
});

export type MintCreationSchema = z.infer<typeof mintCreationSchema>;
