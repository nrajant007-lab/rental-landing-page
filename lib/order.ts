import { z } from 'zod';
import { totals } from './product';
export const orderSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), phone: z.string().trim().regex(/^[+\d ()-]{7,25}$/, 'Enter a valid phone number'), address: z.string().trim().min(8).max(500), region: z.enum(['valley','outside']), quantity: z.number().int().min(1).max(10), consent: z.literal(true), website: z.string().max(0) });
export type OrderInput = z.infer<typeof orderSchema>;
export function orderValues(input: OrderInput) { return { ...input, ...totals(input.quantity, input.region) }; }
