import { z } from "zod";

export const amountSchema = z.number().int().positive({ message: "Amount must be a positive integer" });
