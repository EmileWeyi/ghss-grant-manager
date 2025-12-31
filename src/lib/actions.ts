'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { grantApplicationSchema } from './schema';
import type { GrantApplication } from './types';
import { getContentAssistance as genkitGetContentAssistance, ContentAssistanceInput } from '@/ai/flows/content-assistance-flow';
import localGuidance from './local-guidance.json';

const SUPER_ADMIN_UID = '5RBc7GzSyLTPnBh0NRzNZccp7aK2';

export async function saveGrantApplication(data: GrantApplication) {
  // This is a server action, but we can't reliably get the current user here without passing it.
  // In a real app, you might use a library that integrates with Next.js auth to verify the user on the server.
  // For this context, we assume the check is done on the client before calling.
  
  const validation = grantApplicationSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: 'Invalid data' };
  }

  try {
    await addDoc(collection(db, 'grantApplications'), {
      ...validation.data,
      submittedAt: serverTimestamp(),
      status: 'submitted',
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding document: ', error);
    return { success: false, error: 'Could not save application to the database.' };
  }
}

type GuidanceKeys = keyof typeof localGuidance;

export async function getContentAssistance(formSection: string, userInput: string | undefined) {
  if (!Object.keys(localGuidance).includes(formSection)) {
    throw new Error('Invalid form section for AI assistance.');
  }

  const typedFormSection = formSection as GuidanceKeys;

  const input: ContentAssistanceInput = {
    formSection: typedFormSection,
    localGuidance: JSON.stringify(localGuidance[typedFormSection]),
    userInput: userInput,
  };

  try {
    const result = await genkitGetContentAssistance(input);
    return { suggestion: result.suggestion };
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw new Error('Failed to get AI suggestion.');
  }
}
