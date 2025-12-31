'use server';

/**
 * @fileOverview An AI agent for providing content assistance for grant applications.
 *
 * - getContentAssistance - A function that provides content suggestions for a given section of the application form.
 * - ContentAssistanceInput - The input type for the getContentAssistance function.
 * - ContentAssistanceOutput - The return type for the ContentAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentAssistanceInputSchema = z.object({
  formSection: z
    .string()
    .describe('The specific section of the grant application form.'),
  localGuidance: z
    .string()
    .describe('The JSON string of local guidance to follow.'),
  userInput: z
    .string()
    .optional()
    .describe('The user input for the current section, if any.'),
});
export type ContentAssistanceInput = z.infer<typeof ContentAssistanceInputSchema>;

const ContentAssistanceOutputSchema = z.object({
  suggestion:
    z.string()
      .describe('The AI-powered content suggestion for the form section.'),
});
export type ContentAssistanceOutput = z.infer<typeof ContentAssistanceOutputSchema>;

export async function getContentAssistance(
  input: ContentAssistanceInput
): Promise<ContentAssistanceOutput> {
  return contentAssistanceFlow(input);
}

const contentAssistancePrompt = ai.definePrompt({
  name: 'contentAssistancePrompt',
  input: {schema: ContentAssistanceInputSchema},
  output: {schema: ContentAssistanceOutputSchema},
  prompt: `You are an AI assistant designed to provide content suggestions for grant application forms.

  You will follow the rules strictly defined in the local guidance.

  Local Guidance JSON:
  \`\`\`
  {{{localGuidance}}}
  \`\`\`

  Form Section: {{{formSection}}}

  User Input (if any): {{{userInput}}}

  Based on the local guidance and the current form section, provide a content suggestion to help the applicant fill out the form more efficiently and accurately.
  The suggestion should be concise and relevant to the form section and guidance provided.
  Ensure the suggestion aligns with the tone and requirements outlined in the local guidance.
  If there is no user input, create a suggestion from scratch, adhering to local guidance. If there is user input, refine it.

  Suggestion:`,
});

const contentAssistanceFlow = ai.defineFlow(
  {
    name: 'contentAssistanceFlow',
    inputSchema: ContentAssistanceInputSchema,
    outputSchema: ContentAssistanceOutputSchema,
  },
  async input => {
    const {output} = await contentAssistancePrompt(input);
    return output!;
  }
);
