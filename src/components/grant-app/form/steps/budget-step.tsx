'use client';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { AiAssistant } from '../ai-assistant';
import type { GrantApplication } from '@/lib/types';

export function BudgetStep() {
  const { control } = useFormContext<GrantApplication>();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="requestedAmount"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{t('total_amount')}</FormLabel>
              <AiAssistant fieldName="requestedAmount" formSection="totalAmount" />
            </div>
            <FormControl>
              <Input type="number" placeholder={t('total_amount_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="budgetBreakdown"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{t('budget_breakdown')}</FormLabel>
              <AiAssistant fieldName="budgetBreakdown" formSection="budgetBreakdown" />
            </div>
            <FormControl>
              <Textarea
                placeholder={t('budget_breakdown_placeholder')}
                className="min-h-[150px]"
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