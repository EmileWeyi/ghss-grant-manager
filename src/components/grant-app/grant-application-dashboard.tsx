'use client';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import type { GrantApplication } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// ... other imports remain same

export function GrantApplicationDashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const methods = useForm<GrantApplication>({
    resolver: zodResolver(grantApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: undefined,
      businessName: '',
      businessSector: '',
      businessDescription: '',
      transformationLogic: '',
      country: 'Cameroon',
      region: '',
      locality: '',
      requestedAmount: 0,
      budgetBreakdown: '',
      hivMedicalDoc: false,
      vulnerabilityCategories: [],
    },
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    const fieldsPerStep: (keyof GrantApplication)[][] = [
      ['fullName', 'email', 'phone', 'dob', 'gender'],
      ['businessName', 'businessSector', 'businessDescription'],
      ['requestedAmount', 'budgetBreakdown'],
    ];

    const isValid = await trigger(fieldsPerStep[currentStep]);
    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const onSubmit = async (data: GrantApplication) => {
    setIsSubmitting(true);
    try {
      // Direct write to 'applications' collection
      await addDoc(collection(db, 'applications'), {
        ...data,
        dob: data.dob ? new Date(data.dob) : null, // Ensure Date format
        status: 'SUBMITTED',
        submittedAt: serverTimestamp(),
      });

      toast({
        title: t('submission_success_title'),
        description: t('submission_success_description'),
      });
      methods.reset();
      setCurrentStep(0);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Submission Failed",
        description: error.message,
      });
    } finally {
      // THIS UNSTICKS THE BUTTON
      setIsSubmitting(false);
    }
  };

  // ... renderStep logic remains same
}