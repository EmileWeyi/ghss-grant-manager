import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Personal Info
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  phone: z.string().min(9, { message: 'Valid phone number is required.' }),
  dob: z.string().min(1, { message: 'Date of birth is required.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  
  // Business Info
  businessName: z.string().min(3, { message: 'Business name is required.' }),
  businessSector: z.string().min(1, { message: 'Please select a sector.' }),
  businessDescription: z.string().min(20, { message: 'Provide a brief description.' }),
  transformationLogic: z.string().min(20, { message: 'Explain your business logic.' }),
  
  // Location & Demographics
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  locality: z.string().min(1, "Locality is required"),
  idpSubdivision: z.string().optional(),
  vulnerabilityCategories: z.array(z.string()).default([]),
  disabilityType: z.string().optional(),
  hivMedicalDoc: z.boolean().default(false),
  
  // Financials
  requestedAmount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  budgetBreakdown: z.string().min(10, { message: 'Budget details required.' }),
  supportingDocuments: z.string().url().optional().or(z.literal('')),
});