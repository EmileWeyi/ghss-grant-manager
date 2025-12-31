'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { getContentAssistance } from '@/lib/actions';
import type { GrantApplication } from '@/lib/types';

interface AiAssistantProps {
  fieldName: keyof GrantApplication;
  formSection: string;
}

export function AiAssistant({ fieldName, formSection }: AiAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setValue, getValues } = useFormContext<GrantApplication>();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      const userInput = getValues(fieldName);
      const result = await getContentAssistance(formSection, userInput);
      if (result.suggestion) {
        setValue(fieldName, result.suggestion, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('ai_error_description'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleGetSuggestion}
            disabled={isLoading}
            className="h-8 w-8"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-accent" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('get_suggestion')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
