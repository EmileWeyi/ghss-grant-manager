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
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili", "Mbengwi Town", "Santa Urban", "Akum"],
  "South West": ["Tiko", "Limbe I", "Limbe II", "Mutengene", "Buea", "Muea"],
  "Littoral": ["Douala I", "Douala III", "Douala IV", "Douala V", "Souza", "Bomono"],
  "Far North": ["Mayo Tsanaga", "Mayo Sava", "Diamare", "Mayo-Danay"],
  "West": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Dschang"],
  "East": ["Mandjou", "Kpokolota", "Mokolo", "Ngaikada", "Gado-Badzere", "Ngam Refugee Camp", "Mbile", "Lolo"]
};

// Simplified list for the dropdown
const africanCountries = ["Nigeria", "Chad", "Central African Republic", "Congo", "Gabon", "Equatorial Guinea"];

export function GrantApplicationDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // Tracks which step we are on
  const [selectedRegion, setSelectedRegion] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', phoneCode: '+237', phoneNumber: '',
      gender: '', dob: '', region: '', locality: '', 
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '',
      disabilityType: '', hasHivDocs: ''
    }
  });

  const selectedVulnerabilities = watch("vulnerabilities") || [];

  const onSubmit = async (data: any) => {
    // 1. If we are on Step 1, we only care about Step 1 fields
    if (step === 1) {
      // Manual check to ensure Step 1 is filled
      if (!data.fullName || !data.email || !data.gender || !data.dob) {
        alert("Please fill in all fields in Step 1");
        return;
      }
      setStep(2);
      return;
    }

    // 2. If we are on Step 2, now we save to Firebase
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        status: 'SUBMITTED',
        submittedAt: serverTimestamp(),
      });
      alert("Application Submitted Successfully! ID: " + docRef.id);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        
        {/* PROGRESS HEADER */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-blue-600">
            <span>{step === 1 ? "Step 1: Personal Information" : "Step 2: Location & Background"}</span>
            <span>{step * 20}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${step * 20}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-gray-800">Tell Us About Yourself</h2>
              <div>
                <label className="text-sm font-semibold">Full Name</label>
                <Input {...register('fullName')} placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-sm font-semibold">Email Address</label>
                <Input {...register('email')} type="email" placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Gender</label>
                  <select {...register('gender')} className="w-full border rounded-md p-2 h-10 text-sm">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Date of Birth</label>
                  <Input type="date" {...register('dob')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & VULNERABILITY */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-gray-800">Location & Personal Background</h2>
              
              {/* Location Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Region</label>
                  <select {...register("region")} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full border rounded-md p-2 h-10 text-sm">
                    <option value="">Select Region</option>
                    {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Locality</label>
                  <select {...register("locality")} className="w-full border rounded-md p-2 h-10 text-sm">
                    <option value="">Select Locality</option>
                    {selectedRegion && locationData[selectedRegion].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Vulnerabilities List */}
              <div className="pt-4 space-y-3">
                <label className="text-sm font-bold">Vulnerability Categories (Select all that apply)</label>
                {[
                  "Internally Displaced Person (IDP)", "Refugee", "Person Living with HIV", 
                  "Young Single Parent", "Person with Disability", "Low-income Rural Youth", "Unemployed Youth"
                ].map((cat) => (
                  <div key={cat} className="space-y-2 border-b pb-2 last:border-0">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>

                    {/* Conditional: IDP */}
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                      <Input {...register("displacedFrom")} placeholder="Subdivision you were displaced from?" className="ml-6 w-11/12 mt-1" />
                    )}

                    {/* Conditional: Refugee */}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                      <select {...register("countryOfOrigin")} className="ml-6 w-11/12 border rounded p-2 text-sm">
                        <option value="">Select Country of Origin</option>
                        {africanCountries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}

                    {/* Conditional: HIV */}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                      <div className="ml-6 space-x-4 flex items-center bg-gray-50 p-2 rounded">
                        <span className="text-xs font-semibold">Do you have medical documentation?</span>
                        <label className="text-xs"><input type="radio" value="YES" {...register("hasHivDocs")} /> YES</label>
                        <label className="text-xs"><input type="radio" value="NO" {...register("hasHivDocs")} /> NO</label>
                      </div>
                    )}

                    {/* Conditional: Disability */}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                      <select {...register("disabilityType")} className="ml-6 w-11/12 border rounded p-2 text-sm">
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
            </div>
          )}

          {/* BUTTON NAVIGATION */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (step === 2 ? "Final Submit (Testing)" : "Continue")}
              {step < 2 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}