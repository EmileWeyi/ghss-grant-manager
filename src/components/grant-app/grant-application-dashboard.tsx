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
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { fullName: '' }
  });

  const onSubmit = async (data: { fullName: string }) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        fullName: data.fullName,
        test: true,
        submittedAt: serverTimestamp(),
      });
      alert("Success! The connection is fixed!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-20 bg-white min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Reset Test</h1>
        <p>If you see other questions, the code hasn't updated yet.</p>
        <Input {...register('fullName')} placeholder="Type your name" />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Test This One Button"}
        </Button>
      </form>
    </div>
  );
}