
import { z } from 'zod';

export const grantApplicationSchema = z.object({
  applicantName: z.string().min(3, { message: 'Applicant name must be at least 3 characters.' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  organizationType: z.enum(['ngo', 'academic', 'government', 'other'], {
    required_error: 'You need to select an organization type.',
  }),
  projectTitle: z.string().min(10, { message: 'Project title must be at least 10 characters.' }),
  projectDescription: z.string().min(50, { message: 'Project description must be at least 50 characters.' }),
  supportingDocuments: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  totalAmount: z.coerce.number({invalid_type_error: "Please enter a valid amount."}).positive({ message: 'Amount must be a positive number.' }),
  budgetBreakdown: z.string().min(20, { message: 'Budget breakdown must be at least 20 characters.' }),
});
