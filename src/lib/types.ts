import { z } from 'zod';
import { grantApplicationSchema } from './schema';

export type GrantApplication = z.infer<typeof grantApplicationSchema>;
