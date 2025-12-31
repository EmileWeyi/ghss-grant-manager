'use client';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import type { GrantApplication } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicantInfoStep } from './form/steps/applicant-info-step';
import { ProjectDetailsStep } from './form/steps/project-details-step';
import { BudgetStep } from './form/steps/budget-step';
import { ReviewStep } from './form/steps/review-step';
import { FormStepper } from './form/form-stepper';
import { DashboardHeader } from './header';

const steps = ['step_applicant_info', 'step_project_details', 'step_budget', 'step_review_submit'];

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
      businessSector: '',
      businessName: '',
      businessDescription: '',
      requestedAmount: 0,
      budgetBreakdown: '',
      country: 'Cameroon',
    },
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    const fieldsPerStep: (keyof GrantApplication)[][] = [
      ['fullName', 'email', 'businessSector'],
      ['businessName', 'businessDescription'],
      ['requestedAmount', 'budgetBreakdown'],
    ];

    const isValid = await trigger(fieldsPerStep[currentStep]);
    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const onSubmit = async (data: GrantApplication) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...data,
        dob: data.dob ? new Date(data.dob) : null,
        submittedAt: serverTimestamp(),
        status: 'SUBMITTED',
      });

      toast({ title: t('submission_success_title') });
      methods.reset();
      setCurrentStep(0);
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <DashboardHeader />
        <main className="flex flex-1 flex-col p-4 md:p-8 lg:flex-row lg:gap-8">
          <FormStepper currentStep={currentStep} steps={steps} setCurrentStep={setCurrentStep} />
          <div className="mt-8 flex-1 lg:mt-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card><CardContent className="p-6">
                {currentStep === 0 && <ApplicantInfoStep />}
                {currentStep === 1 && <ProjectDetailsStep />}
                {currentStep === 2 && <BudgetStep />}
                {currentStep === 3 && <ReviewStep />}
              </CardContent></Card>
              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0}>{t('previous_step')}</Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>{t('next_step')}</Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('submit_application')}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </FormProvider>
  );
}