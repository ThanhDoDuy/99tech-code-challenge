import { z } from 'zod';

/** Body for creating a resource. */
export const createResourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100),
  category: z.string().trim().min(1, 'category is required').max(50),
  description: z.string().trim().max(1000).optional().default(''),
  amount: z.number().finite().nonnegative().optional().default(0),
});

/** Body for updating a resource — any subset, but at least one field. */
export const updateResourceSchema = createResourceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

/** Query params for listing resources (with basic filters). */
export const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minAmount: z.coerce.number().finite().optional(),
  maxAmount: z.coerce.number().finite().optional(),
  sort: z
    .enum(['name', 'amount', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Route param: resource id. */
export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
