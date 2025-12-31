'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import type { GrantApplication } from '@/lib/types';

const ReviewItem = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-4">
    <dt className="font-medium text-muted-foreground">{label}</dt>
    <dd className="md:col-span-2">{value || 'N/A'}</dd>
  </div>
);

export function ReviewStep() {
  const { getValues } = useFormContext<GrantApplication>();
  const { t } = useLanguage();
  const data = getValues();
  const orgTypeMap = {
    ngo: t('org_type_ngo'),
    academic: t('org_type_academic'),
    government: t('org_type_gov'),
    other: t('org_type_other'),
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">{t('review_title')}</h2>
      <p className="text-muted-foreground">{t('review_description')}</p>
      <Separator className="my-6" />
      <div className="space-y-8">
        <div>
            <h3 className="mb-4 text-lg font-semibold">{t('step_applicant_info')}</h3>
            <dl className="space-y-4">
                <ReviewItem label={t('applicant_name')} value={data.applicantName} />
                <ReviewItem label={t('contact_email')} value={data.contactEmail} />
                <ReviewItem label={t('organization_type')} value={orgTypeMap[data.organizationType]} />
            </dl>
        </div>
        <Separator />
         <div>
            <h3 className="mb-4 text-lg font-semibold">{t('step_project_details')}</h3>
            <dl className="space-y-4">
                <ReviewItem label={t('project_title')} value={data.projectTitle} />
                <ReviewItem label={t('project_description')} value={data.projectDescription} />
                <ReviewItem label={t('supporting_documents')} value={data.supportingDocuments} />
            </dl>
        </div>
        <Separator />
        <div>
            <h3 className="mb-4 text-lg font-semibold">{t('step_budget')}</h3>
            <dl className="space-y-4">
                <ReviewItem label={t('total_amount')} value={`$${data.totalAmount?.toLocaleString()}`} />
                <ReviewItem label={t('budget_breakdown')} value={data.budgetBreakdown} />
            </dl>
        </div>
      </div>
    </div>
  );
}
