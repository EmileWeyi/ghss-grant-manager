import { z } from 'zod';

export const grantApplicationSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
});