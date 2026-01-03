'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
  const [selectedRegion, setSelectedRegion] = useState("");

  const { register, watch, setValue } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', gender: '', dob: '', region: '', locality: '', 
      vulnerabilities: [], displacedFrom: '', countryOfOrigin: '', disabilityType: '', hasHivDocs: ''
    }
  });

  const selectedVulnerabilities = watch("vulnerabilities") || [];

  return (
    <div className="p-10 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border">
        
        {/* PROGRESS HEADER */}
        <div className="mb-8 text-blue-600 font-bold">
          <div className="flex justify-between mb-2 text-sm">
            <span>Step {step} of 5</span>
            <span>{step * 20}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${step * 20}%` }}></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Step 1: Tell Us About Yourself</h2>
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
              <Button onClick={() => setStep(2)} className="w-full bg-blue-600">
                Continue <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: LOCATION & VULNERABILITY */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Step 2: Location & Background</h2>
              
              {/* Region and Locality */}
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

              {/* Vulnerabilities Checklist */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-bold">Vulnerability Categories (Select all that apply)</p>
                {[
                  "Internally Displaced Person (IDP)", 
                  "Refugee", 
                  "Person Living with HIV", 
                  "Young Single Parent", 
                  "Person with Disability", 
                  "Low-income Rural Youth", 
                  "Unemployed Youth"
                ].map(cat => (
                  <div key={cat} className="space-y-2 border-b pb-2 last:border-0">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input type="checkbox" value={cat} {...register("vulnerabilities")} className="w-4 h-4" />
                      <span>{cat}</span>
                    </label>
                    
                    {/* Follow-up: IDP */}
                    {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                       <Input {...register("displacedFrom")} placeholder="Which subdivision were you displaced from?" className="ml-6 w-11/12 mt-1" />
                    )}

                    {/* Follow-up: Refugee (African Countries Dropdown) */}
                    {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                       <select {...register("countryOfOrigin")} className="ml-6 w-11/12 border rounded p-2 text-sm h-10">
                         <option value="">Select Country of Origin...</option>
                         {africanCountries.map(country => <option key={country} value={country}>{country}</option>)}
                       </select>
                    )}

                    {/* Follow-up: HIV (YES/NO Radio) */}
                    {selectedVulnerabilities.includes("Person Living with HIV") && cat.includes("HIV") && (
                       <div className="ml-6 text-xs flex items-center gap-4 bg-gray-50 p-2 rounded w-11/12">
                         <span className="font-semibold">Formal documentation available?</span>
                         <label className="flex items-center gap-1"><input type="radio" value="YES" {...register("hasHivDocs")} /> YES</label>
                         <label className="flex items-center gap-1"><input type="radio" value="NO" {...register("hasHivDocs")} /> NO</label>
                       </div>
                    )}

                    {/* Follow-up: Disability (Dropdown) */}
                    {selectedVulnerabilities.includes("Person with Disability") && cat.includes("Disability") && (
                       <select {...register("disabilityType")} className="ml-6 w-11/12 border rounded p-2 text-sm h-10">
                         <option value="">What type of disability?</option>
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
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-blue-600">Continue</Button>
              </div>
            </div>
          )}

          {/* Placeholder for Step 3 */}
          {step === 3 && (
            <div className="text-center py-10">
              <h2 className="text-xl font-bold">Step 3: Project Details Coming Soon</h2>
              <Button onClick={() => setStep(2)} variant="link">Go Back to Step 2</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}