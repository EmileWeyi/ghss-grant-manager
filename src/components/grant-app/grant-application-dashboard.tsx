'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronRight, ChevronLeft, Upload, CheckCircle } from 'lucide-react';

const locationData: Record<string, string[]> = {
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili", "Mbengwi Town", "Santa Urban", "Akum"],
  "South West": ["Tiko", "Limbe I", "Limbe II", "Mutengene", "Buea", "Muea"],
  "Littoral": ["Douala I", "Douala III", "Douala IV", "Douala V", "Souza", "Bomono"],
  "Far North": ["Mayo Tsanaga", "Mayo Sava", "Diamare", "Mayo-Danay"],
  "West": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Dschang"],
  "East": ["Mandjou", "Kpokolota", "Mokolo", "Ngaikada", "Gado-Badzere", "Ngam Refugee Camp", "Mbile", "Lolo"]
};

const africanCountries = ["Nigeria", "Central African Republic", "Chad", "Congo", "Sudan", "Mali", "Other"];

export function GrantApplicationDashboard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', gender: '', dob: '', region: '', locality: '',
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '', disabilityType: '', hasHivDocs: '',
      businessName: '', businessSector: '', businessDescription: '', transformationDetails: '',
      fundingAmount: 250000 
    }
  });

  // Watchers for dynamic UI
  const selectedVulnerabilities = watch("vulnerabilities") || [];
  const businessDesc = watch("businessDescription") || "";
  const transformDesc = watch("transformationDetails") || "";

  // Word Counter Helper
  const countWords = (str: string) => {
    return str.trim() === '' ? 0 : str.trim().split(/\s+/).filter(Boolean).length;
  };

  const onFinalSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...data,
        status: 'SUBMITTED',
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-white">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-gray-600 mt-2">Your grant application has been successfully submitted and is under review.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Apply for Another Grant</Button>
      </div>
    );
  }

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

        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold">Step 1: Personal Information</h2>
              <Input {...register('fullName')} placeholder="Full Name" />
              <Input {...register('email')} placeholder="Email" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border rounded p-2 text-sm h-10">
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

          {/* STEP 2: LOCATION & BACKGROUND */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold">Step 2: Location & Background</h2>
              <div className="grid grid-cols-2 gap-4">
                <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="border rounded p-2 text-sm h-10">
                  <option value="">Select Region...</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
                <select {...register("locality")} className="border rounded p-2 text-sm h-10">
                  <option value="">Select Locality...</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-bold">Vulnerability Categories</p>
                {[
                  "Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", 
                  "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"
                ].map(cat => (
                  <div key={cat} className="space-y-2 border-b pb-2 last:border-0">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} />
                      <span>{cat}</span>
                    </label>
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                       <Input {...register("displacedFrom")} placeholder="Which subdivision?" className="ml-6" />
                    )}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                       <select {...register("countryOfOrigin")} className="ml-6 w-11/12 border rounded p-2 text-sm">
                         <option value="">Country of Origin...</option>
                         {africanCountries.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    )}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                       <div className="ml-6 text-xs flex gap-4 bg-gray-50 p-2 rounded">
                         <span>Formal documentation?</span>
                         <label><input type="radio" value="YES" {...register("hasHivDocs")} /> YES</label>
                         <label><input type="radio" value="NO" {...register("hasHivDocs")} /> NO</label>
                       </div>
                    )}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                       <select {...register("disabilityType")} className="ml-6 w-11/12 border rounded p-2 text-sm">
                         <option value="">Type of disability?</option>
                         <option value="Physical">Physical</option>
                         <option value="Visual">Visual</option>
                         <option value="Hearing">Hearing</option>
                         <option value="Intellectual">Intellectual</option>
                       </select>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 3: PLACEHOLDER */}
          {step === 3 && (
            <div className="space-y-4 text-center py-10">
              <h2 className="text-xl font-bold">Step 3 Ready</h2>
              <p>Move to Project Details.</p>
              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
                <Button type="button" onClick={() => setStep(4)} className="flex-1 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT DETAILS */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold">Step 4: Business Details</h2>
              <Input {...register('businessName')} placeholder="Business Name" />
              <select {...register('businessSector')} className="w-full border rounded p-2 text-sm h-10">
                <option value="">Select Sector...</option>
                <option value="Vocational">Vocational trades</option>
                <option value="Agriculture">Agriculture or Livestock</option>
                <option value="Pastries">Pastries or Cattery</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Beauty">Beauty and Wellness</option>
                <option value="ICT">ICT</option>
                <option value="Other">Other</option>
              </select>

              <div>
                <label className="text-sm font-semibold flex justify-between">
                  Business Description 
                  <span className={countWords(businessDesc) > 500 ? "text-red-500" : "text-gray-400"}>
                    {countWords(businessDesc)} / 500 words
                  </span>
                </label>
                <Textarea {...register('businessDescription')} className="h-32" />
              </div>

              <div>
                <label className="text-sm font-semibold flex justify-between">
                  Transformation Aspect
                  <span className={countWords(transformDesc) > 500 ? "text-red-500" : "text-gray-400"}>
                    {countWords(transformDesc)} / 500 words
                  </span>
                </label>
                <Textarea {...register('transformationDetails')} className="h-32" />
              </div>

              <div>
                <label className="text-sm font-semibold">Funding Requested (250,000 - 550,000 XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} />
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(3)} variant="outline" className="flex-1">Back</Button>
                <Button type="button" onClick={() => setStep(5)} className="flex-1 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold">Step 5: Document Uploads</h2>
              {[
                "Business Plan", "Proof of Eligibility", "CV", "Budget Plan", "Additional Documents"
              ].map((doc) => (
                <div key={doc} className="p-3 border rounded-lg bg-gray-50">
                  <label className="text-sm font-semibold block mb-2">{doc}</label>
                  <Input type="file" className="text-xs" accept=".pdf,.doc,.docx,.xls,.xlsx" />
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1">Back</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white font-bold">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Final Submit"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}