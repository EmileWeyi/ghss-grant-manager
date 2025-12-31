
'use client';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKeys } from '@/lib/i18n';
import { CheckCircle, Circle } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import type { GrantApplication } from '@/lib/types';

interface FormStepperProps {
  currentStep: number;
  steps: string[];
  setCurrentStep: (step: number) => void;
}

export function FormStepper({ currentStep, steps, setCurrentStep }: FormStepperProps) {
  const { t } = useLanguage();
  const { getFieldState, formState } = useFormContext<GrantApplication>();

  const fieldsPerStep: (keyof GrantApplication)[][] = [
    ['applicantName', 'contactEmail', 'organizationType'],
    ['projectTitle', 'projectDescription', 'supportingDocuments'],
    ['totalAmount', 'budgetBreakdown'],
  ];

  const isStepCompleted = (stepIndex: number) => {
    if (stepIndex >= currentStep) {
      return false;
    }

    const fieldsToValidate = fieldsPerStep[stepIndex];
    if (!fieldsToValidate || fieldsToValidate.length === 0) {
      return true;
    }

    return fieldsToValidate.every(field => !getFieldState(field, formState).invalid);
  };

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="sticky top-24 rounded-lg border bg-card p-4 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Application Steps</h2>
        <nav className="space-y-2" aria-label="Application Steps">
          {steps.map((step, index) => (
            <Button
              key={step}
              variant={currentStep === index ? 'secondary' : 'ghost'}
              className="h-auto w-full justify-start py-2 text-left"
              onClick={() => setCurrentStep(index)}
              disabled={index > currentStep}
              aria-current={currentStep === index ? 'step' : undefined}
            >
              <div className="flex w-full items-start">
                {isStepCompleted(index) ? (
                  <CheckCircle
                    className="mr-3 h-5 w-5 shrink-0 text-green-500"
                    aria-label="Step completed"
                  />
                ) : (
                  <Circle
                    className={`mr-3 h-5 w-5 shrink-0 ${
                      currentStep === index ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span className={`flex-1 ${currentStep === index ? 'font-semibold' : ''}`}>
                  {t(step as TranslationKeys)}
                </span>
              </div>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
