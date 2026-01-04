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
import { Loader2, ChevronRight, Upload, CheckCircle, User, MapPin, Briefcase, Info, Paperclip, AlertCircle, FileCheck } from 'lucide-react';

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
    mode: "onChange",
    defaultValues: { 
      vulnerabilities: [], fundingAmount: 250000 
    }
  });

  const allValues = watch(); 
  const selectedVulnerabilities = watch("vulnerabilities") || [];

  const handleNextStep = async (fields: any[], nextStep: number) => {
    // If we are on Step 2, we allow "Continue" even if fields are empty
    if (step === 2) {
      setStep(nextStep);
      return;
    }
    const isValid = await trigger(fields);
    if (isValid) setStep(nextStep);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files?.[0]) {
      setFileNames(prev => ({ ...prev, [fieldName]: e.target.files![0].name }));
    }
  };

  const countWords = (str: string) => (str || '').trim() === '' ? 0 : str.trim().split(/\s+/).filter(Boolean).length;

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
        <p className="text-gray-600 mt-2">Your application is now under review by GHSS.</p>
        <Button className="mt-8 bg-blue-600 px-10" onClick={() => window.location.reload()}>Finish</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-gray-100">
        
        {/* PROGRESS BAR (1/5) */}
        <div className="mb-10">
          <div className="flex justify-between mb-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
            <span>Phase {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
          
          {/* STEP 1/5: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-blue-600"/> Personal Info</h2>
              <Input {...register('fullName')} placeholder="Full Name" />
              <Input {...register('email')} placeholder="Email Address" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border rounded-xl px-3 h-12 text-sm">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <Input type="date" {...register('dob')} />
              </div>
              <Button type="button" onClick={() => handleNextStep(['fullName', 'email', 'gender', 'dob'], 2)} className="w-full h-14 bg-blue-600 rounded-xl font-bold">Continue</Button>
            </div>
          )}

          {/* STEP 2/5: LOCATION & BACKGROUND (OPTIONAL) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6 text-blue-600"/> Location & Background</h2>
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-400">OPTIONAL</span>
              </div>
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
                <p className="text-xs font-bold text-gray-500 uppercase">Vulnerability Category</p>
                {["Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"].map(cat => (
                  <div key={cat} className="space-y-2">
                    <label className="flex items-center space-x-3 text-sm p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4" />
                      <span>{cat}</span>
                    </label>
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && <Input {...register("displacedFrom")} placeholder="Subdivision of origin?" className="ml-8 w-11/12" />}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && <Input {...register("countryOfOrigin")} placeholder="Country of origin?" className="ml-8 w-11/12" />}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                      <select {...register("disabilityType")} className="ml-8 w-11/12 border rounded-xl h-10 text-sm">
                        <option value="">Type of Disability</option>
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
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1 h-12 bg-blue-600 text-white font-bold">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 3/5: PROJECT DETAILS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-blue-600"/> Project Details</h2>
              <Input {...register('businessName')} placeholder="Business Name" />
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Business Description <span className={countWords(allValues.businessDescription) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(allValues.businessDescription)}/500</span></label>
                <Textarea {...register('businessDescription')} placeholder="Highlight main development impact of your business/organization." className="h-32 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Production Process <span className={countWords(allValues.transformationDetails) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(allValues.transformationDetails)}/500</span></label>
                <Textarea {...register('transformationDetails')} placeholder="How does your business involve transformation?" className="h-32 resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold">Funding Requested (XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} />
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => handleNextStep(['businessName', 'businessDescription', 'transformationDetails', 'fundingAmount'], 4)} className="flex-1 h-12 bg-blue-600 font-bold">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4/5: DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6 text-blue-600"/> Document Uploads</h2>
              {[
                { label: "Business Plan", key: "plan" },
                { label: "Proof of Eligibility", key: "proof" },
                { label: "CV", key: "cv" },
                { label: "Budget Plan", key: "budget" },
                { label: "Additional Documents", key: "extra" }
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
                  {fileNames[doc.key] && <p className="text-[10px] text-green-600 mt-2 font-medium italic">File: {fileNames[doc.key]}</p>}
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(3)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(5)} className="flex-1 h-12 bg-blue-600 font-bold">Review Application</Button>
              </div>
            </div>
          )}

          {/* STEP 5/5: FULL REVIEW STAGE */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-amber-50 p-5 rounded-2xl border-l-4 border-amber-400 flex gap-4">
                <AlertCircle className="text-amber-600 w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Final Verification</h3>
                  <p className="text-[11px] text-amber-800">Review your entire application. By clicking submit, you certify that all information provided is accurate.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* 1. Identity Summary */}
                <div className="border rounded-2xl p-6 bg-gray-50/50">
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest flex items-center gap-2"><User className="w-3 h-3"/> Identity & Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div><p className="text-gray-400 mb-1">Full Name</p><strong>{allValues.fullName}</strong></div>
                    <div><p className="text-gray-400 mb-1">Email</p><strong>{allValues.email}</strong></div>
                    <div><p className="text-gray-400 mb-1">Gender / DOB</p><strong>{allValues.gender} ({allValues.dob})</strong></div>
                  </div>
                </div>

                {/* 2. Background Summary */}
                <div className="border rounded-2xl p-6 bg-gray-50/50">
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3"/> Background & Vulnerability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div><p className="text-gray-400 mb-1">Region / Locality</p><strong>{allValues.locality || 'N/A'}, {allValues.region || 'N/A'}</strong></div>
                    <div>
                      <p className="text-gray-400 mb-1">Vulnerabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedVulnerabilities.length > 0 ? selectedVulnerabilities.map(v => <span key={v} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold">{v}</span>) : <strong>None Selected</strong>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Project Summary */}
                <div className="border rounded-2xl p-6 bg-gray-50/50 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-2 tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3"/> Project Proposal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div><p className="text-gray-400 mb-1">Business Name</p><strong>{allValues.businessName}</strong></div>
                    <div><p className="text-gray-400 mb-1">Funding Requested</p><strong className="text-blue-600 text-sm">{allValues.fundingAmount?.toLocaleString()} XAF</strong></div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-white border rounded-lg"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Business Description</p><p className="text-xs italic leading-relaxed">"{allValues.businessDescription}"</p></div>
                    <div className="p-3 bg-white border rounded-lg"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Production Process</p><p className="text-xs italic leading-relaxed">"{allValues.transformationDetails}"</p></div>
                  </div>
                </div>

                {/* 4. Document Summary */}
                <div className="border rounded-2xl p-6 bg-gray-50/50">
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest flex items-center gap-2"><FileCheck className="w-3 h-3"/> Uploaded Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(fileNames).map(([key, name]) => (
                      <div key={key} className="flex items-center gap-2 text-[10px] bg-white p-2 rounded border border-gray-100">
                        <Paperclip className="w-3 h-3 text-gray-300"/> <span className="font-bold uppercase text-gray-400 w-20">{key}:</span> <span className="text-green-600 truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1 h-14 rounded-2xl font-bold">Back to Edit</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-lg transition-all">
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