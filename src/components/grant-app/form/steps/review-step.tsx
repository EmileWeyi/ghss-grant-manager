'use client';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '@/hooks/use-language';
import type { GrantApplication } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export function ReviewStep() {
  const { getValues } = useFormContext<GrantApplication>();
  const { t } = useLanguage();
  const values = getValues();

  const sections = [
    {
      title: t('step_applicant_info'),
      fields: [
        { label: t('applicant_name'), value: values.fullName },
        { label: t('contact_email'), value: values.email },
        { label: t('organization_type'), value: values.businessSector },
      ],
    },
    {
      title: t('step_project_details'),
      fields: [
        { label: t('project_title'), value: values.businessName },
        { label: t('project_description'), value: values.businessDescription },
      ],
    },
    {
      title: t('step_budget'),
      fields: [
        { label: t('total_amount'), value: values.requestedAmount },
        { label: t('budget_breakdown'), value: values.budgetBreakdown },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground italic">
          {t('review_instructions') || 'Please review your information carefully before submitting.'}
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">
            {section.title}
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.label} className="sm:col-span-1">
                <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {field.value?.toString() || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}