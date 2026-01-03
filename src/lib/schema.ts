import { z } from 'zod';

export const grantApplicationSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phoneCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  region: z.string().optional(),
  locality: z.string().optional(),
  vulnerabilities: z.array(z.string()).default([]),
  displacedFrom: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  disabilityType: z.string().optional(), // New field for Disability dropdown
  hasHivDocs: z.string().optional()       // New field for HIV Radio
});

export type GrantApplicationData = z.infer<typeof grantApplicationSchema>;