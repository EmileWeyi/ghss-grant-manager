import { z } from 'zod';

export const grantApplicationSchema = z.object({
  // Personal Info
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneCode: z.string(),
  phoneNumber: z.string().min(8, "Phone number is too short"),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  dob: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18 && age <= 35;
  }, {
    message: "You must be between 18 and 35 years old to apply.",
  }),
});

export type GrantApplicationData = z.infer<typeof grantApplicationSchema>;