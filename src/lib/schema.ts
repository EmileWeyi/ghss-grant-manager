import { z } from 'zod';

// Helper function to count words
const wordCount = (val: string) => val.trim().split(/\s+/).filter(Boolean).length;

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
  disabilityType: z.string().optional(),
  hasHivDocs: z.string().optional(),
  
  // Step 4: Project Details with strict 500 word validation
  businessName: z.string().min(2, "Business name required"),
  businessSector: z.string().min(1, "Select a sector"),
  
  businessDescription: z.string()
    .refine((val) => wordCount(val) <= 500, {
      message: "Business description must not exceed 500 words",
    }),
    
  transformationDetails: z.string()
    .refine((val) => wordCount(val) <= 500, {
      message: "Transformation details must not exceed 500 words",
    }),

  fundingAmount: z.number().min(250000, "Minimum 250,000 XAF").max(550000, "Maximum 550,000 XAF"),

  // Step 5: Document Placeholders
  businessPlanUrl: z.string().optional(),
  eligibilityProofUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  budgetPlanUrl: z.string().optional(),
  additionalDocsUrl: z.string().optional()
});

export type GrantApplicationData = z.infer<typeof grantApplicationSchema>;