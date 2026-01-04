'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, Mail, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 1. Move the data-reading logic into a separate component
function SuccessContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('id') || 'APP-PENDING';
  const email = searchParams.get('email') || 'applicant';

  const openGmail = () => window.open(`https://mail.google.com/mail/u/0/#search/GHSS`, '_blank');

  return (
    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 border border-gray-100">
      <div className="flex justify-center">
        <div className="bg-green-100 p-5 rounded-full text-green-600">
          <CheckCircle size={48} className="animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Application Sent!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your application for the GHSS Grant has been successfully received and is under review.
        </p>
      </div>

      <div className="bg-blue-600 p-6 rounded-[2rem] shadow-lg text-white">
        <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-2">Application ID</p>
        <code className="text-2xl font-mono font-bold tracking-wider">{appId}</code>
      </div>

      <div className="text-left bg-gray-50 p-5 rounded-2xl flex items-start gap-3 border border-gray-100">
        <Mail className="w-5 h-5 text-blue-600 mt-1" />
        <p className="text-[11px] text-gray-500">
          A confirmation was sent to <span className="text-blue-600 font-bold">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={openGmail} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
          Check Gmail <ExternalLink size={16} />
        </Button>
        <Link href="/" className="w-full text-center py-2 text-xs text-gray-400 flex items-center justify-center gap-2">
          <ArrowLeft size={12} /> Return Home
        </Link>
      </div>
    </div>
  );
}

// 2. The main page component that Next.js sees
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4 font-bold">Verifying submission...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}