'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, ChevronRight, Upload, CheckCircle, User, 
  MapPin, Briefcase, Info, Paperclip, AlertCircle, FileCheck 
} from 'lucide-react';

const locationData: Record<string, string[]> = {
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili", "Mbengwi Town", "Santa Urban", "Akum"],
  "South West": ["Tiko", "Limbe I", "Limbe II", "Mutengene", "Buea", "Muea"],
  "Littoral": ["Douala I", "Douala III", "Douala IV", "Douala V", "Souza", "Bomono"],
  "Far North": ["Mayo Tsanaga", "Mayo Sava", "Diamare", "Mayo-Danay"],
  "West": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Dschang"],
  "East": ["Mandjou", "Kpokolota", "Mokolo", "Ngaikada", "Gado-Badzere", "Ngam Refugee Camp", "Mbile", "Lolo"]
};

export function GrantApplicationDashboard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    mode: "onChange",
    defaultValues: { 
      vulnerabilities: [], 
      fundingAmount: 250000 
    }
  });

  const allValues = watch(); 
  const selectedVulnerabilities = watch("vulnerabilities") || [];

  // 1. GENERATE GHSS APPLICATION ID
  const generateAppID = (region: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    
    const regionCodes: Record<string, string> = {
      'North West': 'NW', 'South West': 'SW', 'Littoral': 'LT',
      'Far North': 'FN', 'West': 'WE', 'East': 'EA'
    };
    
    const regionCode = regionCodes[region] || 'XX';
    return `APP-${year}${month}${day}-${regionCode}-${random}`;
  };

  // 2. CALCULATE INTERNAL SCORES
  const calculateInternalScores = (data: any) => {
    // Vulnerability Score
    const vulnCount = data.vulnerabilities?.length || 0;
    let vulnScore = 0;
    if (vulnCount === 1) vulnScore = 10;
    else if (vulnCount === 2) vulnScore = 15;
    else if (vulnCount === 3) vulnScore = 20;
    else if (vulnCount === 4) vulnScore = 25;
    else if (vulnCount >= 5) vulnScore = 30;

    // Document Score
    const requiredDocs = ['plan', 'proof', 'cv', 'budget'];
    const docCount = requiredDocs.filter(key => !!fileNames[key]).length;
    let docScore = 0;
    if (docCount === 4) docScore = 5;
    else if (docCount === 3) docScore = 4;
    else if (docCount === 2) docScore = 2;
    else if (docCount === 1) docScore = 1;

    // Funding Score
    let fundScore = (data.fundingAmount >= 250000 && data.fundingAmount <= 550000) ? 5 : 2;

    const totalScore = vulnScore + docScore + fundScore;
    let priority = "LOW";
    if (totalScore >= 35) priority = "HIGH";
    else if (totalScore >= 20) priority = "MEDIUM";

    return { vulnScore, docScore, fundScore, totalScore, priority };
  };

  const handleNextStep = async (fields: any[], nextStep: number) => {
    if (step === 2) { // Step 2 is Location & Background (Optional)
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

  // 3. FINAL SUBMISSION HANDLER
  const onFinalSubmit = async (data: any) => {
    setIsSubmitting(true);
    const appId = generateAppID(data.region);
    const scores = calculateInternalScores(data);

    try {
      // Save to Firebase
      await addDoc(collection(db, 'applications'), {
        ...data,
        applicationId: appId,
        ...scores,
        status: 'SUBMITTED',
        submittedAt: serverTimestamp(),
      });

      // Send Confirmation Email via API
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.fullName, appId }),
      });

      // Redirect to Success Page
      router.push(`/success?id=${appId}&email=${data.email}`);

    } catch (e: any) {
      alert("Error: " + e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-gray-100">
        
        {/* PROGRESS (1/5) */}
        <div className="mb-10">
          <div className="flex justify-between mb-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
            <span>Phase {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${(step / 5) * 100}%` }}></div>
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
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-400 tracking-tighter uppercase">Optional</span>
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
                {["Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"].map(cat => (
                  <div key={cat} className="space-y-2">
                    <label className="flex items-center space-x-3 text-sm p-3 border rounded-xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4 rounded text-blue-600" />
                      <span className="font-medium text-gray-700">{cat}</span>
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
                <label className="text-sm font-bold flex justify-between uppercase text-gray-500 tracking-wider">Business Description <span className={countWords(allValues.businessDescription) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(allValues.businessDescription)}/500</span></label>
                <Textarea {...register('businessDescription')} placeholder="Highlight main development impact of your business/organization." className="h-40 rounded-2xl p-4 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex justify-between uppercase text-gray-500 tracking-wider">Production Process <span className={countWords(allValues.transformationDetails) > 500 ? "text-red-500" : "text-gray-400"}>{countWords(allValues.transformationDetails)}/500</span></label>
                <Textarea {...register('transformationDetails')} placeholder="How does your business involve transformation?" className="h-40 rounded-2xl p-4 resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold uppercase text-gray-500 tracking-wider">Funding Requested (XAF)</label>
                <Input type="number" {...register('fundingAmount', { valueAsNumber: true })} className="text-lg font-mono font-bold" />
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => handleNextStep(['businessName', 'businessDescription', 'transformationDetails', 'fundingAmount'], 4)} className="flex-1 h-12 bg-blue-600 font-bold">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 4/5: DOCUMENT UPLOADS */}
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
                <div key={doc.key} className="p-5 border-2 border-dashed rounded-3xl hover:bg-blue-50/50 hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{doc.label} {doc.key !== 'extra' && <span className="text-red-500">*</span>}</span>
                    <div className="relative">
                      <Input type="file" onChange={(e) => handleFileChange(e, doc.key)} className="opacity-0 absolute inset-0 z-10 cursor-pointer" />
                      <div className="px-4 py-2 border-2 border-blue-600 rounded-xl bg-white text-xs font-black text-blue-600 flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Paperclip className="w-3 h-3" /> {fileNames[doc.key] ? "Update" : "Choose File"}
                      </div>
                    </div>
                  </div>
                  {fileNames[doc.key] && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                      <FileCheck className="w-3 h-3" /> {fileNames[doc.key]}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(3)} variant="outline" className="flex-1 h-12">Back</Button>
                <Button type="button" onClick={() => setStep(5)} className="flex-1 h-12 bg-blue-600 font-bold">Review Application</Button>
              </div>
            </div>
          )}

          {/* STEP 5/5: FINAL COMPREHENSIVE REVIEW */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-amber-50 p-5 rounded-2xl border-l-4 border-amber-400 flex gap-4">
                <AlertCircle className="text-amber-600 w-6 h-6 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 font-medium italic">Final Check: After submission, your application will be evaluated based on the data below. You cannot edit after this point.</p>
              </div>

              <div className="space-y-6">
                {/* Review: Personal */}
                <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5"/> Identity Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                    <div><p className="text-gray-400">Name</p><strong>{allValues.fullName}</strong></div>
                    <div><p className="text-gray-400">Email</p><strong>{allValues.email}</strong></div>
                    <div><p className="text-gray-400">Gender/DOB</p><strong>{allValues.gender} ({allValues.dob})</strong></div>
                  </div>
                </div>

                {/* Review: Location */}
                <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> Geography & Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div><p className="text-gray-400">Location</p><strong>{allValues.locality || 'N/A'}, {allValues.region || 'N/A'}</strong></div>
                    <div>
                      <p className="text-gray-400">Vulnerabilities</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVulnerabilities.length > 0 ? selectedVulnerabilities.map(v => <span key={v} className="bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold">{v}</span>) : <span className="text-gray-300">No categories selected</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review: Project Details */}
                <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Briefcase className="w-3.5 h-3.5"/> Proposal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b pb-4">
                    <div><p className="text-gray-400">Project Name</p><strong>{allValues.businessName}</strong></div>
                    <div><p className="text-gray-400">Funding Goal</p><strong className="text-blue-600 text-sm font-mono">{allValues.fundingAmount?.toLocaleString()} XAF</strong></div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">Business Description</p><p className="text-xs text-gray-700 italic border-l-2 border-blue-100 pl-3 leading-relaxed">"{allValues.businessDescription}"</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">Production Process</p><p className="text-xs text-gray-700 italic border-l-2 border-blue-100 pl-3 leading-relaxed">"{allValues.transformationDetails}"</p></div>
                  </div>
                </div>

                {/* Review: Attached Files */}
                <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><FileCheck className="w-3.5 h-3.5"/> Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(fileNames).length > 0 ? Object.entries(fileNames).map(([key, name]) => (
                      <div key={key} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 text-[10px]">
                        <span className="font-bold text-gray-400 uppercase">{key}</span>
                        <span className="text-blue-600 font-medium truncate ml-4">{name}</span>
                      </div>
                    )) : <p className="text-xs text-red-500 italic">No files attached. (Reminder: Required documents must be updated in Step 4)</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setStep(4)} variant="outline" className="flex-1 h-14 rounded-2xl font-bold">Back to Edit</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-green-100 transition-all">
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