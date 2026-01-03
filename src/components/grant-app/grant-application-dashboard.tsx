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
import { Loader2, ChevronRight, Upload, CheckCircle, User, MapPin, Briefcase, Info, Paperclip, AlertCircle } from 'lucide-react';

const locationData: Record<string, string[]> = {
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili", "Mbengwi Town", "Santa Urban", "Akum"],
  "South West": ["Tiko", "Limbe I", "Limbe II", "Mutengene", "Buea", "Muea"],
  "Littoral": ["Douala I", "Douala III", "Douala IV", "Douala V", "Souza", "Bomono"],
  "Far North": ["Mayo Tsanaga", "Mayo Sava", "Diamare", "Mayo-Danay"],
  "West": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Dschang"],
  "East": ["Mandjou", "Kpokolota", "Mokolo", "Ngaikada", "Gado-Badzere", "Ngam Refugee Camp", "Mbile", "Lolo"]
};

export function GrantApplicationDashboard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    mode: "onChange", // Validates as they type
    defaultValues: { 
      fullName: '', email: '', gender: '', dob: '', region: '', locality: '',
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '', disabilityType: '', hasHivDocs: '',
      businessName: '', businessSector: '', businessDescription: '', transformationDetails: '',
      fundingAmount: 250000 
    }
  });

  const allValues = watch(); 
  const selectedVulnerabilities = watch("vulnerabilities") || [];
  const businessDesc = watch("businessDescription") || "";
  const transformDesc = watch("transformationDetails") || "";

  // Force validation before changing steps
  const handleNextStep = async (fields: any[], nextStep: number) => {
    const isValid = await trigger(fields);
    if (isValid) setStep(nextStep);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files?.[0]) {
      setFileNames(prev => ({ ...prev, [fieldName]: e.target.files![0].name }));
    }
  };

  const countWords = (str: string) => str.trim() === '' ? 0 : str.trim().split(/\s+/).filter(Boolean).length;

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
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-white animate-in zoom-in">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold">Submission Received</h1>
        <p className="text-gray-600 mt-2">GHSS team will review your application soon.</p>
        <Button className="mt-8 bg-blue-600 px-10" onClick={() => window.location.reload()}>Finish</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
        
        {/* PROGRESS */}
        <div className="mb-10">
          <div className="flex justify-between mb-2 text-[10px] font-black uppercase text-blue-600">
            <span>Step {step} / 6</span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
          
          {/* STEP 1: PERSONAL */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-blue-600"/> Personal Info</h2>
              <div className="space-y-1">
                <Input {...register('fullName')} placeholder="Full Name" className={errors.fullName ? "border-red-500" : ""} />
                {errors.fullName && <p className="text-red-500 text-[10px]">Name is required</p>}
              </div>
              <Input {...register('email')} placeholder="Email Address" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border rounded-xl px-3 h-12 text-sm">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <Input type="date" {...register('dob')} />
              </div>
              <Button type="button" onClick={() => handleNextStep(['fullName', 'email', 'gender', 'dob'], 2)} className="w-full h-14 bg-blue-600 rounded-xl">Continue</Button>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6 text-blue-600"/> Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="border rounded-xl h-12 text-sm">
                  <option value="">Region</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
                <select {...register("locality")} className="border rounded-xl h-12 text-sm">
                  <option value="">Locality</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <p className="text-xs font-bold text-blue-600 uppercase">Vulnerability Category</p>
                {["Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"].map(cat => (
                  <div key={cat} className="space-y-2">
                    <label className="flex items-center space-x-3 text-sm p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4" />
                      <span>{cat}</span>
                    </label>
                    {/* Follow-ups (Not Obligatory as requested) */}
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && <Input {...register("displacedFrom")} placeholder="Subdivision of origin?" className="ml-8 w-11/12" />}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && <Input {...register("countryOfOrigin")} placeholder="Country of origin?" className="ml-8 w-11/12" />}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                      <div className="ml-8 text-[10px] flex gap-4 bg-gray-50 p-2 rounded-lg">
                        <span>Documentation?</span>
                        <label><input type="radio" value="YES" {...register("hasHivDocs")} /> Yes</label>
                        <label><input type="radio" value="NO" {...register("hasHivDocs")} /> No</label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => handleNextStep(['region', 'locality'], 4)} className="flex-1 h-12 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT DETAILS (GHSS Terminology) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-blue-600"/> Project Details</h2>
              <Input {...register('businessName')} placeholder="Business Name" />
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Business Description <span className={countWords(businessDesc) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(businessDesc)}/500</span></label>
                <Textarea {...register('businessDescription')} placeholder="Highlight main development impact of your business/organization." className="h-32 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Production Process <span className={countWords(transformDesc) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(transformDesc)}/500</span></label>
                <Textarea {...register('transformationDetails')} placeholder="How does your business involve transformation?" className="h-32 resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold">Funding Requested (XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} />
                <p className="text-[10px] text-gray-400 uppercase">250,000 - 550,000 XAF</p>
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => handleNextStep(['businessName', 'businessDescription', 'transformationDetails', 'fundingAmount'], 5)} className="flex-1 h-12 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6 text-blue-600"/> Document Uploads</h2>
              {[
                { label: "Business Plan", key: "plan" },
                { label: "Proof of Eligibility", key: "proof" },
                { label: "CV", key: "cv" },
                { label: "Budget Plan", key: "budget" },
                { label: "Additional Documents", key: "extra" } // Optional
              ].map((doc) => (
                <div key={doc.key} className="p-4 border-2 border-dashed rounded-2xl hover:bg-blue-50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{doc.label} {doc.key !== 'extra' && <span className="text-red-500">*</span>}</span>
                    <div className="relative">
                      <Input type="file" onChange={(e) => handleFileChange(e, doc.key)} className="opacity-0 absolute inset-0 z-10 cursor-pointer" />
                      <div className="px-3 py-1 border rounded-lg bg-white text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {fileNames[doc.key] ? "Change" : "Choose File"}
                      </div>
                    </div>
                  </div>
                  {fileNames[doc.key] && <p className="text-[10px] text-green-600 mt-2 italic font-medium tracking-tight">Attached: {fileNames[doc.key]}</p>}
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(6)} className="flex-1 h-12 bg-blue-600 text-white">Review Application</Button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-amber-50 p-4 rounded-2xl border-l-4 border-amber-400 flex gap-3">
                <AlertCircle className="text-amber-600 w-5 h-5 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">Please review all information. After submission, your file is locked for GHSS evaluation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                  <h3 className="font-black text-blue-600 uppercase text-[9px]">Personal</h3>
                  <p><strong>{allValues.fullName}</strong></p>
                  <p className="text-gray-500">{allValues.email}</p>
                  <p className="text-gray-500">{allValues.locality}, {allValues.region}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                  <h3 className="font-black text-blue-600 uppercase text-[9px]">Finance</h3>
                  <p><strong>{allValues.businessName}</strong></p>
                  <p className="text-blue-700 font-bold">{allValues.fundingAmount?.toLocaleString()} XAF</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-black text-blue-600 uppercase text-[9px] mb-2">Business Description</h3>
                  <p className="text-[11px] leading-relaxed text-gray-700 italic">"{allValues.businessDescription}"</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-black text-blue-600 uppercase text-[9px] mb-2">Production Process</h3>
                  <p className="text-[11px] leading-relaxed text-gray-700 italic">"{allValues.transformationDetails}"</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(5)} variant="outline" className="flex-1 h-14">Edit</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 bg-green-600 text-white font-black text-lg">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm & Submit"}
                </Button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}