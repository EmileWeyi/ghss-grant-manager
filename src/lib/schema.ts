import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Keep these required because they are in your ApplicantInfoStep
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  businessSector: z.string().min(1, { message: 'Please select a sector.' }),

  // Change all others to .optional() or .default() so they don't block the button
  phone: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional(),
  
  businessName: z.string().optional().or(z.literal('')),
  businessDescription: z.string().optional().or(z.literal('')),
  transformationLogic: z.string().optional().or(z.literal('')),
  
  country: z.string().default('Cameroon'),
  region: z.string().optional().or(z.literal('')),
  locality: z.string().optional().or(z.literal('')),
  idpSubdivision: z.string().optional(),
  vulnerabilityCategories: z.array(z.string()).default([]),
  disabilityType: z.string().optional(),
  hivMedicalDoc: z.boolean().default(false),
  
  requestedAmount: z.coerce.number().optional().default(0),
  budgetBreakdown: z.string().optional().or(z.literal('')),
  supportingDocuments: z.string().url().optional().or(z.literal('')),
});