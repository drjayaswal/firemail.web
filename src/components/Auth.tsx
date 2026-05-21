'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2Icon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { toast } from '@/lib/toast';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      if (error) {
        toast.error(error.message ?? 'Could not start Google sign-in');
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.error('No redirect URL from Google sign-in');
      setLoading(false);
    } catch {
      toast.error('Could not start Google sign-in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8 flex flex-col items-center">
        <div className="flex justify-center">
          <Image
            src="/firemail-opensource.svg"
            alt="firemail"
            width={100}
            height={100}
            quality={90}
            className="h-auto w-60 object-contain"
            style={{ height: 'auto' }}
            priority
          />
        </div>
        <div className="space-y-2 text-center w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Access Portal
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Authorize with Google to begin.
          </p>
        </div>
        <Button
          type="button"
          size="xl"
          variant="light"
          className="w-full"
          disabled={loading}
          onClick={handleGoogleSignIn}
        >
          {loading ? (
            <Loader2Icon className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Image
              src="/google.svg"
              alt="Google"
              width={18}
              height={18}
              className="bg-white p-0.5 rounded-sm"
            />
          )}
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </Button>
        <nav
          className="flex justify-center gap-x-4 text-xs text-gray-400"
          aria-label="Legal"
        >
          <Link href="/terms-condition" className="hover:text-black transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="hover:text-black transition-colors">
            Privacy Policy
          </Link>
          <Link href="/help" className="hover:text-black transition-colors">
            Help
          </Link>
        </nav>
      </div>
    </div>
  );
}
