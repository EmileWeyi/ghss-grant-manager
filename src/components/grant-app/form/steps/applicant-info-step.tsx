'use client';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { AiAssistant } from '../ai-assistant';
import type { GrantApplication } from '@/lib/types';

export function ApplicantInfoStep() {
  const { control } = useFormContext<GrantApplication>();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="applicantName"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{t('applicant_name')}</FormLabel>
              <AiAssistant fieldName="applicantName" formSection="applicantName" />
            </div>
            <FormControl>
              <Input placeholder={t('applicant_name_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{t('contact_email')}</FormLabel>
               <AiAssistant fieldName="contactEmail" formSection="contactEmail" />
            </div>
            <FormControl>
              <Input type="email" placeholder={t('contact_email_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationType"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
                <FormLabel>{t('organization_type')}</FormLabel>
                <AiAssistant fieldName="organizationType" formSection="organizationType" />
            </div>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('organization_type')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ngo">{t('org_type_ngo')}</SelectItem>
                <SelectItem value="academic">{t('org_type_academic')}</SelectItem>
                <SelectItem value="government">{t('org_type_gov')}</SelectItem>
                <SelectItem value="other">{t('org_type_other')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
