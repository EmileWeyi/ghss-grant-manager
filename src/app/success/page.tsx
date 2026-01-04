'use client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('id');
  const email = searchParams.get('email');

  const openGmail = () => window.open(`https://mail.google.com/mail/u/0/#search/GHSS`, '_blank');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-green-100">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">Application Received!</h1>
          <p className="text-gray-500 text-sm">Your GHSS Micro-Project submission was successful.</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Your Application ID</p>
          <code className="text-lg font-mono font-bold text-blue-800">{appId}</code>
        </div>

        <div className="text-left text-xs text-gray-600 bg-gray-50 p-4 rounded-xl space-y-2">
          <p className="flex items-center gap-2"><Mail className="w-3 h-3"/> A confirmation email has been sent to:</p>
          <p className="font-bold text-gray-900 ml-5">{email}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={openGmail} className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl flex gap-2">
            Open Gmail <ExternalLink className="w-4 h-4"/>
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full text-gray-400 text-xs">
              <ArrowLeft className="w-3 h-3 mr-2"/> Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}