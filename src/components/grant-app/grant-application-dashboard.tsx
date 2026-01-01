'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// List of African Country Codes (Selected sample, can be expanded)
const africanCodes = [
  { code: '+237', country: 'Cameroon' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
  { code: '+27', country: 'South Africa' },
  { code: '+221', country: 'Senegal' },
  { code: '+250', country: 'Rwanda' },
];

export function GrantApplicationDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step] = useState(1); // Set for Step 1

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { 
      fullName: '', 
      email: '', 
      phoneCode: '+237', 
      phoneNumber: '',
      gender: '',
      dob: '' 
    }
  });

  const onSubmit = async (data: any) => {
    // Age Validation Logic (18-35)
    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }

    if (age < 18 || age > 35) {
      alert("Eligibility Error: You must be between 18 and 35 years old.");
      return;
    }

    setIsSubmitting(true);
    console.log("2. Attempting Firebase write with full data...");
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        ageCalculated: age,
        status: 'STARTED',
        submittedAt: serverTimestamp(),
      });
      console.log("3. Success! ID:", docRef.id);
      alert("Step 1 Saved! Progressing... ID: " + docRef.id);
    } catch (e: any) {
      console.error("4. Error:", e);
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Step {step} of 5: Tell Us About Yourself</span>
            <span>20%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '20%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Full Name</label>
              <Input {...register('fullName', { required: true })} placeholder="John Doe" />
            </div>

            <div>
              <label className="text-sm font-semibold">Email Address</label>
              <Input type="email" {...register('email', { required: true })} placeholder="john@example.com" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-sm font-semibold">Code</label>
                <select {...register('phoneCode')} className="w-full border rounded-md p-2 text-sm h-10">
                  {africanCodes.map(c => <option key={c.code} value={c.code}>{c.country} ({c.code})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input {...register('phoneNumber', { required: true })} placeholder="670000000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Gender</label>
                <select {...register('gender', { required: true })} className="w-full border rounded-md p-2 text-sm h-10">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Date of Birth</label>
                <Input type="date" {...register('dob', { required: true })} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Save & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}