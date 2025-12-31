import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Section 1: Applicant Info
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  phone: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  
  // Section 2: Business/Project Details
  businessName: z.string().min(3, { message: 'Business name is required.' }),
  businessSector: z.string().min(1, { message: 'Please select a sector.' }),
  businessDescription: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  transformationLogic: z.string().optional().or(z.literal('')),
  
  // Section 3: Financials
  requestedAmount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  budgetBreakdown: z.string().min(10, { message: 'Budget details required.' }),
  
  // Metadata (Defaults to match your Firestore structure)
  country: z.string().default('Cameroon'),
  region: z.string().optional(),
  locality: z.string().optional(),
  status: z.string().default('SUBMITTED'),
  hivMedicalDoc: z.boolean().default(false),
  vulnerabilityCategories: z.array(z.string()).default([]),
});