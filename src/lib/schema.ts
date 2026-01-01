import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Personal Info
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneCode: z.string().default("+237"),
  phoneNumber: z.string().min(8, "Phone number is too short"),
  gender: z.string().min(1, "Please select a gender"),
  dob: z.string().min(1, "Date of Birth is required"),
  
  // Location Info (The new fields that caused the crash)
  region: z.string().min(1, "Please select a region"),
  locality: z.string().min(1, "Please select a locality"),
  
  // Vulnerability Info
  vulnerabilities: z.array(z.string()).optional(),
  displacedFrom: z.string().optional(),
  countryOfOrigin: z.string().optional()
});

export type GrantApplicationData = z.infer<typeof grantApplicationSchema>;