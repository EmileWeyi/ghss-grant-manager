'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantApplicationSchema } from '@/lib/schema';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// --- DATA LISTS ---
const africanCodes = [
  { code: '+237', country: 'Cameroon' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
];

const locationData: Record<string, string[]> = {
  "North West": ["Bamenda I", "Bamenda II", "Bamenda III", "Bambui", "Bambili", "Mbengwi Town", "Santa Urban", "Akum"],
  "South West": ["Tiko", "Limbe I", "Limbe II", "Mutengene", "Buea", "Muea"],
  "Littoral": ["Douala I", "Douala III", "Douala IV", "Douala V", "Souza", "Bomono"],
  "Far North": ["Mayo Tsanaga", "Mayo Sava", "Diamare", "Mayo-Danay"],
  "West": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Dschang"],
  "East": ["Mandjou", "Kpokolota", "Mokolo", "Ngaikada", "Gado-Badzere", "Ngam Refugee Camp", "Mbile", "Lolo"]
};

export function GrantApplicationDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");

  // --- FORM CONFIGURATION ---
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grantApplicationSchema),
    defaultValues: { 
      fullName: '', email: '', phoneCode: '+237', phoneNumber: '',
      gender: '', dob: '', region: '', locality: '', vulnerabilities: [] 
    }
  });

  // Watch the vulnerability checkboxes so we can show/hide extra questions
  const selectedVulnerabilities = watch("vulnerabilities") || [];

  // --- SUBMIT LOGIC ---
  const onSubmit = async (data: any) => {
    // 1. Calculate Age
    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) { age--; }

    // 2. Security Check (18-35)
    if (age < 18 || age > 35) {
      alert("Error: Age must be 18-35.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 3. Save to Firebase (Default Database)
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        ageCalculated: age,
        status: 'STARTED',
        submittedAt: serverTimestamp(),
      });
      alert("Saved! Document ID: " + docRef.id);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        
        {/* PROGRESS BAR SECTION */}
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
          
          {/* PERSONAL INFO SECTION */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg border-b pb-2">Personal Information</h2>
            <div>
              <label className="text-sm font-semibold">Full Name</label>
              <Input {...register('fullName')} placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message as string}</p>}
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

          {/* LOCATION SECTION */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="font-bold text-lg">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Region</label>
                <select 
                  {...register("region")} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full border rounded-md p-2 h-10 text-sm"
                >
                  <option value="">Select Region</option>
                  {Object.keys(locationData).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Locality</label>
                <select {...register("locality")} className="w-full border rounded-md p-2 h-10 text-sm">
                  <option value="">Select Locality</option>
                  {selectedRegion && locationData[selectedRegion].map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VULNERABILITY SECTION */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="font-bold text-lg">Vulnerability & Background</h2>
            <div className="space-y-3">
              {[
                "Internally Displaced Person (IDP)", 
                "Refugee", 
                "Person Living with HIV", 
                "Person with Disability"
              ].map((cat) => (
                <div key={cat} className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" value={cat} {...register("vulnerabilities")} />
                    <span className="text-sm">{cat}</span>
                  </label>

                  {/* CONDITIONAL FIELD: Only shows if IDP is checked */}
                  {selectedVulnerabilities.includes("Internally Displaced Person (IDP)") && cat.includes("IDP") && (
                    <Input {...register("displacedFrom")} placeholder="Subdivision you were displaced from?" className="ml-6 w-11/12" />
                  )}

                  {/* CONDITIONAL FIELD: Only shows if Refugee is checked */}
                  {selectedVulnerabilities.includes("Refugee") && cat.includes("Refugee") && (
                    <Input {...register("countryOfOrigin")} placeholder="Country of Origin" className="ml-6 w-11/12" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Save & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );