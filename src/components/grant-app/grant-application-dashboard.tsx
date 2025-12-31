
'use client';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import type { GrantApplication } from '@/lib/types';
import { DashboardHeader } from './header';
import { FormStepper } from './form/form-stepper';
import { ApplicantInfoStep } from './form/steps/applicant-info-step';
import { ProjectDetailsStep } from './form/steps/project-details-step';
import { BudgetStep } from './form/steps/budget-step';
import { ReviewStep } from './form/steps/review-step';
import { saveGrantApplication } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const steps = [
  'step_applicant_info',
  'step_project_details',
  'step_budget',
  'step_review_submit',
];

export function GrantApplicationDashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const methods = useForm<GrantApplication>({
    resolver: zodResolver(grantApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      applicantName: '',
      contactEmail: '',
      organizationType: undefined,
      projectTitle: '',
      projectDescription: '',
      supportingDocuments: '',
      totalAmount: undefined,
      budgetBreakdown: '',
    },
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    const fieldsPerStep: (keyof GrantApplication)[][] = [
      ['applicantName', 'contactEmail', 'organizationType'],
      ['projectTitle', 'projectDescription', 'supportingDocuments'],
      ['totalAmount', 'budgetBreakdown'],
    ];

    const fieldsToValidate = fieldsPerStep[currentStep];

    if (!fieldsToValidate) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: GrantApplication) => {
    setIsSubmitting(true);
    const result = await saveGrantApplication(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: t('submission_success_title'),
        description: t('submission_success_description'),
      });
      methods.reset();
      setCurrentStep(0);
    } else {
      toast({
        variant: 'destructive',
        title: t('submission_error_title'),
        description: result.error || t('submission_error_description'),
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ApplicantInfoStep />;
      case 1: return <ProjectDetailsStep />;
      case 2: return <BudgetStep />;
      case 3: return <ReviewStep />;
      default: return null;
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
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  {renderStep()}
                </CardContent>
              </Card>
              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                  {t('previous_step')}
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    {t('next_step')}
                  </Button>
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
