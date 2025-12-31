'use client';
import { useAuth } from '@/hooks/use-auth';
import { LoginPage } from '@/components/auth/login-page';
import { GrantApplicationDashboard } from '@/components/grant-app/grant-application-dashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && isSuperAdmin) {
    return <GrantApplicationDashboard />;
  }

  return <LoginPage />;
}
