'use client';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { LanguageToggle } from '../shared/language-toggle';
import { Icons } from '../shared/icons';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

export function DashboardHeader() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm md:px-8">
      <div className="flex items-center gap-4">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          GHSS Grants Portal
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('logout')}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
