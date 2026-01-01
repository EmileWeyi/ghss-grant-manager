import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Step 1: Minimum requirements to move forward
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  gender: z.string().min(1, "Select gender"),
  dob: z.string().min(1, "Date of birth required"),
  
  // Step 2: Make these optional so they don't block Step 1
  phoneCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  region: z.string().optional(),
  locality: z.string().optional(),
  vulnerabilities: z.array(z.string()).default([]),
  displacedFrom: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  disabilityType: z.string().optional(),
  hasHivDocs: z.string().optional()
});