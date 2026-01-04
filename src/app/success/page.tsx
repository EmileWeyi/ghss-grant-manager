'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Import Suspense
import { CheckCircle, Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 1. We move the logic that uses searchParams into a sub-component
function SuccessContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('id') || 'APP-PENDING';
  const email = searchParams.get('email') || 'your email';

  const openGmail = () => window.open(`https://mail.google.com/mail/u/0/#search/GHSS`, '_blank');

  return (
    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 border border-gray-100">
      <div className="flex justify-center">
        <div className="bg-green-100 p-5 rounded-full animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Submission Successful!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you for applying to the GHSS Micro-Project Grant. Your application has been logged.
        </p>
      </div>

      <div className="bg-blue-600 p-6 rounded-[2rem] shadow-lg shadow-blue-100 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase opacity-80 tracking-[0.2em] mb-2">Reference ID</p>
          <code className="text-2xl font-mono font-bold tracking-wider">{appId}</code>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500 rounded-full opacity-50"></div>
      </div>

      <div className="text-left bg-gray-50 p-5 rounded-2xl space-y-3">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-700">Confirmation Sent</p>
            <p className="text-[11px] text-gray-500">A copy was sent to <span className="text-blue-600 font-semibold">{email}</span>.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={openGmail} className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
          Check your Email <ExternalLink className="w-4 h-4" />
        </Button>
        <Link href="/" className="w-full">
          <Button variant="ghost" className="w-full h-12 text-gray-400 text-xs font-medium">
            <ArrowLeft className="w-3 h-3 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

// 2. The main page exports the Content wrapped in Suspense
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-bold">Loading your confirmation...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

// Simple loader icon if you don't have it imported
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  );
}