'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function GrantApplicationDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { fullName: '' }
  });

  const onSubmit = async (data: { fullName: string }) => {
    setIsSubmitting(true);
    setDebugMessage('Connecting to Firebase...');
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        fullName: data.fullName,
        testMode: true,
        submittedAt: serverTimestamp(),
      });
      setDebugMessage(`✅ Success! ID: ${docRef.id}`);
      alert("Success! Check Firestore!");
    } catch (error: any) {
      console.error(error);
      setDebugMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4 border rounded-lg bg-white shadow">
      <h1 className="text-xl font-bold text-center">Connection Test</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input {...register('fullName')} placeholder="Enter test name" />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Sending...' : 'Test Firebase Connection'}
        </Button>
      </form>

      {debugMessage && (
        <p className="p-2 text-xs bg-slate-100 rounded text-center font-mono">
          {debugMessage}
        </p>
      )}
    </div>
  );
}