import { z } from 'zod';
export const grantApplicationSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
});