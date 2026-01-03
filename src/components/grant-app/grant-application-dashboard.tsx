'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

const locationData: Record<string, string[]> = {
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili"],
  "South West": ["Tiko", "Limbe I", "Buea"],
  "Littoral": ["Douala I", "Douala II"],
  "Far North": ["Maroua"],
  "West": ["Bafoussam"],
  "East": ["Bertoua"]
};

export function GrantApplicationDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', gender: '', dob: '', region: '', locality: '', 
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '', disabilityType: '', hasHivDocs: ''
    }
  });

  const selectedVulnerabilities = watch("vulnerabilities") || [];

  // This handles the final save to Firebase
  const handleFinalSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        status: 'SUBMITTED',
        submittedAt: serverTimestamp(),
      });
      alert("Success! ID: " + docRef.id);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border">
        
        {/* PROGRESS HEADER */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-bold text-blue-600">
            <span>Step {step} of 5</span>
            <span>{step * 20}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${step * 20}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-6">
          
          {/* STEP 1 FIELDS */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tell Us About Yourself</h2>
              <Input {...register('fullName')} placeholder="Full Name" />
              <Input {...register('email')} placeholder="Email" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border rounded p-2 h-10 text-sm">
                  <option value="">Gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <Input type="date" {...register('dob')} />
              </div>
              <Button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600">
                Continue <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2 FIELDS */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Location & Background</h2>
              <div className="grid grid-cols-2 gap-4">
                <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="border rounded p-2 text-sm h-10">
                  <option value="">Region...</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
                <select {...register("locality")} className="border rounded p-2 text-sm h-10">
                  <option value="">Locality...</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-bold">Vulnerabilities</p>
                {["Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", "Person with Disability"].map(cat => (
                  <div key={cat} className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} />
                      <span>{cat}</span>
                    </label>
                    
                    {/* Conditional: IDP */}
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                       <Input {...register("displacedFrom")} placeholder="Which subdivision?" className="ml-6" />
                    )}

                    {/* Conditional: HIV Radio */}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                       <div className="ml-6 text-xs flex gap-4">
                         <span>Documentation?</span>
                         <label><input type="radio" value="YES" {...register("hasHivDocs")} /> YES</label>
                         <label><input type="radio" value="NO" {...register("hasHivDocs")} /> NO</label>
                       </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}