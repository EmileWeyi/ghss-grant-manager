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
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { AiAssistant } from '../ai-assistant';
import type { GrantApplication } from '@/lib/types';

export function ProjectDetailsStep() {
  const { control } = useFormContext<GrantApplication>();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="projectTitle"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{t('project_title')}</FormLabel>
              <AiAssistant fieldName="projectTitle" formSection="projectTitle" />
            </div>
            <FormControl>
              <Input placeholder={t('project_title_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="projectDescription"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
                <FormLabel>{t('project_description')}</FormLabel>
                <AiAssistant fieldName="projectDescription" formSection="projectDescription" />
            </div>
            <FormControl>
              <Textarea
                placeholder={t('project_description_placeholder')}
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={control}
        name="supportingDocuments"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
                <FormLabel>{t('supporting_documents')}</FormLabel>
                <AiAssistant fieldName="supportingDocuments" formSection="supportingDocuments" />
            </div>
            <FormControl>
              <Input
                placeholder={t('supporting_documents_placeholder')}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
