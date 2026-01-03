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
import { Loader2, ChevronRight, ChevronLeft, Upload, CheckCircle, FileText, User, MapPin, Briefcase } from 'lucide-react';

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

  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', gender: '', dob: '', region: '', locality: '',
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '', disabilityType: '', hasHivDocs: '',
      businessName: '', businessSector: '', businessDescription: '', transformationDetails: '',
      fundingAmount: 250000 
    }
  });

  const allValues = watch(); // Used for the review step
  const selectedVulnerabilities = watch("vulnerabilities") || [];
  const businessDesc = watch("businessDescription") || "";
  const transformDesc = watch("transformationDetails") || "";

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-white animate-in zoom-in duration-300">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-gray-600 mt-2 max-w-md">Your grant application has been successfully submitted. Our team will review your details and contact you via email.</p>
        <Button className="mt-8 bg-blue-600" onClick={() => window.location.reload()}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border">
        
        {/* PROGRESS HEADER */}
        <div className="mb-10">
          <div className="flex justify-between mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
            <span>Step {step} of 6</span>
            <span>{Math.round((step / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Personal Information</h2>
              </div>
              <Input {...register('fullName')} placeholder="Full Name" className="h-12" />
              <Input {...register('email')} placeholder="Email Address" className="h-12" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border rounded-md p-2 h-12 text-sm">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <Input type="date" {...register('dob')} className="h-12" />
              </div>
              <Button type="button" onClick={() => setStep(2)} className="w-full h-12 bg-blue-600 text-lg">
                Continue <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: LOCATION & BACKGROUND */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Location & Background</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="border rounded-md p-2 h-12 text-sm">
                  <option value="">Select Region</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
                <select {...register("locality")} className="border rounded-md p-2 h-12 text-sm">
                  <option value="">Select Locality</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-bold text-gray-700">Vulnerability Categories</p>
                {[
                  "Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", 
                  "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"
                ].map(cat => (
                  <div key={cat} className="space-y-2 border-b pb-3 last:border-0">
                    <label className="flex items-center space-x-3 text-sm cursor-pointer p-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4 rounded text-blue-600" />
                      <span className="text-gray-700">{cat}</span>
                    </label>
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                       <Input {...register("displacedFrom")} placeholder="Which subdivision?" className="ml-8 w-11/12" />
                    )}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                       <select {...register("countryOfOrigin")} className="ml-8 w-11/12 border rounded p-2 h-10 text-sm">
                         <option value="">Country of Origin...</option>
                         {africanCountries.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    )}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                       <div className="ml-8 text-xs flex gap-6 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                         <span className="font-medium text-blue-800">Formal documentation?</span>
                         <label className="flex items-center gap-1.5"><input type="radio" value="YES" {...register("hasHivDocs")} /> YES</label>
                         <label className="flex items-center gap-1.5"><input type="radio" value="NO" {...register("hasHivDocs")} /> NO</label>
                       </div>
                    )}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                       <select {...register("disabilityType")} className="ml-8 w-11/12 border rounded p-2 h-10 text-sm">
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
              <div className="flex gap-4 pt-2">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(4)} className="flex-1 h-12 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT DETAILS */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Business Project Details</h2>
              </div>
              <Input {...register('businessName')} placeholder="Business Name" className="h-12" />
              <select {...register('businessSector')} className="w-full border rounded-md p-2 h-12 text-sm">
                <option value="">Select Business Sector</option>
                <option value="Vocational">Vocational trades (Mechanics, Welder)</option>
                <option value="Agriculture">Agriculture or Livestock</option>
                <option value="Pastries">Pastries or Cattery</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Beauty">Beauty and Wellness</option>
                <option value="ICT">ICT</option>
                <option value="Other">Other</option>
              </select>

              <div>
                <label className="text-sm font-semibold flex justify-between mb-1">
                  Business Description 
                  <span className={countWords(businessDesc) > 500 ? "text-red-500 font-bold" : "text-gray-400"}>
                    {countWords(businessDesc)} / 500 words
                  </span>
                </label>
                <Textarea {...register('businessDescription')} placeholder="Describe your business goals and activities..." className="h-32 resize-none" />
              </div>

              <div>
                <label className="text-sm font-semibold flex justify-between mb-1">
                  Transformation & Impact
                  <span className={countWords(transformDesc) > 500 ? "text-red-500 font-bold" : "text-gray-400"}>
                    {countWords(transformDesc)} / 500 words
                  </span>
                </label>
                <Textarea {...register('transformationDetails')} placeholder="How does your business transform lives or products?" className="h-32 resize-none" />
              </div>

              <div>
                <label className="text-sm font-semibold">Funding Requested (XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} className="h-12 font-mono text-lg" />
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Range: 250,000 - 550,000 XAF</p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(5)} className="flex-1 h-12 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Document Uploads</h2>
              </div>
              <p className="text-xs text-gray-500 bg-amber-50 p-2 border border-amber-100 rounded">Accepted formats: PDF, Word (DOCX), or Excel (for Budget).</p>
              
              {[
                { label: "Business Plan", icon: <FileText className="w-4 h-4" /> },
                { label: "Proof of Eligibility", icon: <CheckCircle className="w-4 h-4" /> },
                { label: "CV", icon: <User className="w-4 h-4" /> },
                { label: "Budget Plan", icon: <Briefcase className="w-4 h-4" /> },
                { label: "Additional Documents", icon: <Upload className="w-4 h-4" /> }
              ].map((doc) => (
                <div key={doc.label} className="group p-4 border-2 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      {doc.icon} {doc.label}
                    </label>
                  </div>
                  <div className="relative">
                    <Input type="file" className="text-xs h-9 cursor-pointer opacity-0 absolute inset-0 z-10" />
                    <div className="flex items-center justify-center gap-2 h-9 border rounded-lg bg-white text-blue-600 border-blue-200 pointer-events-none">
                      <Upload className="w-3 h-3" />
                      <span className="font-medium">Choose File</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(6)} className="flex-1 h-12 bg-blue-600">Review Application</Button>
              </div>
            </div>
          )}

          {/* STEP 6: VERIFY & REVIEW */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                <h2 className="text-lg font-bold text-amber-800">Review Your Application</h2>
                <p className="text-sm text-amber-700">Please verify all information. You cannot edit your application once submitted.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h3 className="font-bold border-b text-blue-700 pb-1">Personal Details</h3>
                  <p><span className="text-gray-500">Name:</span> {allValues.fullName}</p>
                  <p><span className="text-gray-500">Email:</span> {allValues.email}</p>
                  <p><span className="text-gray-500">Location:</span> {allValues.locality}, {allValues.region}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold border-b text-blue-700 pb-1">Business Details</h3>
                  <p><span className="text-gray-500">Project:</span> {allValues.businessName}</p>
                  <p><span className="text-gray-500">Sector:</span> {allValues.businessSector}</p>
                  <p><span className="text-gray-500">Requested:</span> {allValues.fundingAmount?.toLocaleString()} XAF</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <h3 className="font-bold text-gray-700">Description Summary</h3>
                <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-3">"{allValues.businessDescription}"</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(5)} variant="outline" className="flex-1 h-12">Back to Edit</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg">
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