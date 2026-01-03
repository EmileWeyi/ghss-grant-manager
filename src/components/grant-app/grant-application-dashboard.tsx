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
import { Loader2, ChevronRight, ChevronLeft, Upload, CheckCircle, FileText, User, MapPin, Briefcase, Info, Paperclip } from 'lucide-react';

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
  
  // State to store the names of selected files
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFileNames(prev => ({ ...prev, [fieldName]: e.target.files![0].name }));
    }
  };

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
        <h1 className="text-3xl font-bold font-serif">Submission Received</h1>
        <p className="text-gray-600 mt-2 max-w-md">Your application has been logged. Please keep an eye on your email for the next steps.</p>
        <Button className="mt-8 bg-blue-600 px-10" onClick={() => window.location.reload()}>Finish</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
        
        {/* PROGRESS HEADER */}
        <div className="mb-12">
          <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
            <span>Progress: Phase {step} / 6</span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-8">
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500">Ensure your name matches your official identity document.</p>
              </div>
              <Input {...register('fullName')} placeholder="Full Name" className="h-14 rounded-xl border-gray-200 focus:ring-blue-500" />
              <Input {...register('email')} placeholder="Email Address" className="h-14 rounded-xl border-gray-200 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('gender')} className="border border-gray-200 rounded-xl px-4 h-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <Input type="date" {...register('dob')} className="h-14 rounded-xl border-gray-200 focus:ring-blue-500" />
              </div>
              <Button type="button" onClick={() => setStep(2)} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
                Continue <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: LOCATION & BACKGROUND */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-gray-900">Location & Vulnerability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="border border-gray-200 rounded-xl px-4 h-14 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">Region</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
                <select {...register("locality")} className="border border-gray-200 rounded-xl px-4 h-14 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">Locality</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Select your category</p>
                {[
                  "Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", 
                  "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"
                ].map(cat => (
                  <div key={cat} className="group space-y-3">
                    <label className="flex items-center space-x-3 text-sm cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-100 transition-colors">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-5 h-5 rounded-md text-blue-600 border-gray-300" />
                      <span className="text-gray-700 font-medium">{cat}</span>
                    </label>
                    {/* Follow-ups */}
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                       <Input {...register("displacedFrom")} placeholder="Which subdivision were you displaced from?" className="ml-8 w-11/12 h-12 rounded-lg" />
                    )}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                       <select {...register("countryOfOrigin")} className="ml-8 w-11/12 border border-gray-200 rounded-lg h-12 text-sm">
                         <option value="">Country of Origin...</option>
                         {africanCountries.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    )}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                       <div className="ml-8 text-xs flex gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100 w-11/12">
                         <span className="font-bold">Medical documentation?</span>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="YES" {...register("hasHivDocs")} /> Yes</label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="NO" {...register("hasHivDocs")} /> No</label>
                       </div>
                    )}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                       <select {...register("disabilityType")} className="ml-8 w-11/12 border border-gray-200 rounded-lg h-12 text-sm">
                         <option value="">Disability Type...</option>
                         <option value="Physical">Physical</option>
                         <option value="Visual">Visual</option>
                         <option value="Hearing">Hearing</option>
                         <option value="Intellectual">Intellectual</option>
                       </select>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-14 rounded-xl">Back</Button>
                <Button type="button" onClick={() => setStep(4)} className="flex-1 h-14 bg-blue-600 text-white rounded-xl font-bold">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT DETAILS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
              <Input {...register('businessName')} placeholder="Business/Project Name" className="h-14 rounded-xl" />
              <select {...register('businessSector')} className="w-full border border-gray-200 rounded-xl h-14 px-4 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Select Business Sector</option>
                {["Vocational trades", "Agriculture or Livestock", "Pastries or Cattery", "Cosmetics", "Food Processing", "Beauty and Wellness", "ICT", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Description <span className={countWords(businessDesc) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(businessDesc)}/500 words</span></label>
                <Textarea {...register('businessDescription')} placeholder="Summarize your business mission..." className="h-40 rounded-xl p-4 resize-none border-gray-200" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between">Transformation aspect <span className={countWords(transformDesc) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(transformDesc)}/500 words</span></label>
                <Textarea {...register('transformationDetails')} placeholder="How is this business changing lives?" className="h-40 rounded-xl p-4 resize-none border-gray-200" />
              </div>

              <div>
                <label className="text-sm font-bold">Funding Requested (XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} className="h-14 rounded-xl text-xl font-mono" />
                <p className="text-[10px] text-gray-400 mt-2">MIN: 250,000 | MAX: 550,000</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1 h-14 rounded-xl">Back</Button>
                <Button type="button" onClick={() => setStep(5)} className="flex-1 h-14 bg-blue-600 text-white rounded-xl font-bold">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-gray-900">Document Uploads</h2>
              <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 text-blue-700">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">Please ensure documents are clearly legible. Files must be under 5MB each.</p>
              </div>
              
              {[
                { label: "Business Plan", key: "plan" },
                { label: "Proof of Eligibility", key: "proof" },
                { label: "CV", key: "cv" },
                { label: "Budget Plan", key: "budget" },
                { label: "Additional Evidence", key: "extra" }
              ].map((doc) => (
                <div key={doc.key} className="relative group overflow-hidden border-2 border-dashed border-gray-100 rounded-2xl p-6 transition-all hover:border-blue-300 hover:bg-blue-50/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-700">{doc.label}</span>
                    </div>
                    
                    <div className="relative min-w-[140px]">
                      <Input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, doc.key)}
                        className="opacity-0 absolute inset-0 z-10 cursor-pointer" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx" 
                      />
                      <div className="h-10 px-4 flex items-center justify-center gap-2 border border-blue-200 rounded-xl bg-white text-blue-600 text-xs font-bold pointer-events-none group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        {fileNames[doc.key] ? "Change File" : "Choose File"}
                      </div>
                    </div>
                  </div>
                  {fileNames[doc.key] && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 w-fit px-3 py-1 rounded-full animate-in slide-in-from-left-2">
                      <CheckCircle className="w-3 h-3" />
                      {fileNames[doc.key]}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1 h-14 rounded-xl">Back</Button>
                <Button type="button" onClick={() => setStep(6)} className="flex-1 h-14 bg-blue-600 text-white rounded-xl font-bold">Review Application</Button>
              </div>
            </div>
          )}

          {/* STEP 6: FULL SUMMARY REVIEW */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Final Verification</h2>
                <p className="text-gray-500 text-sm">Review your data carefully. Once you click "Confirm", you cannot make any more changes.</p>
              </div>

              <div className="space-y-6">
                {/* Summary Section: Identity */}
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <User className="w-4 h-4" /> Identity & Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><span className="text-gray-400">Full Name:</span> <br/> <strong>{allValues.fullName || "—"}</strong></p>
                    <p><span className="text-gray-400">Email:</span> <br/> <strong>{allValues.email || "—"}</strong></p>
                    <p><span className="text-gray-400">Gender / DOB:</span> <br/> <strong>{allValues.gender} ({allValues.dob})</strong></p>
                    <p><span className="text-gray-400">Location:</span> <br/> <strong>{allValues.locality}, {allValues.region}</strong></p>
                  </div>
                </div>

                {/* Summary Section: Background */}
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Background Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Vulnerabilities Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVulnerabilities.map(v => (
                        <span key={v} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600">{v}</span>
                      ))}
                    </div>
                    {allValues.countryOfOrigin && <p className="text-sm mt-2"><span className="text-gray-400">Origin:</span> <strong>{allValues.countryOfOrigin}</strong></p>}
                    {allValues.disabilityType && <p className="text-sm mt-2"><span className="text-gray-400">Disability:</span> <strong>{allValues.disabilityType}</strong></p>}
                    {allValues.hasHivDocs && <p className="text-sm mt-2"><span className="text-gray-400">HIV Docs:</span> <strong>{allValues.hasHivDocs}</strong></p>}
                  </div>
                </div>

                {/* Summary Section: Project */}
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Business Proposal
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <p><span className="text-gray-400">Business Name:</span> <br/> <strong>{allValues.businessName}</strong></p>
                      <p><span className="text-gray-400">Sector:</span> <br/> <strong>{allValues.businessSector}</strong></p>
                      <p><span className="text-gray-400">Requested Funding:</span> <br/> <strong className="text-blue-600 text-lg">{allValues.fundingAmount?.toLocaleString()} XAF</strong></p>
                    </div>
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Mission Summary</p>
                      <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 italic">"{allValues.businessDescription}"</p>
                    </div>
                  </div>
                </div>

                {/* Files Review */}
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" /> Attached Files
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(fileNames).length > 0 ? (
                      Object.entries(fileNames).map(([key, name]) => (
                        <div key={key} className="flex justify-between items-center text-xs bg-white p-3 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-green-600">{name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-red-500 italic">No files selected</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <Button type="button" onClick={() => setStep(5)} variant="outline" className="flex-1 h-14 rounded-2xl font-bold">Back to Edit</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-100 transition-all">
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