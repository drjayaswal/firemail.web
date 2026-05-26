'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2Icon, CircleQuestionMarkIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { toast } from '@/lib/toast';
import { useSearchParams } from 'next/navigation';

export default function Auth() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");
  
  useEffect(() => {
    // 1. Grab the full encoded redirect path (e.g., "/device?user_code=ABCD1234")
    const redirectParam = searchParams.get("redirect");
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
  }, [searchParams]);
  
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        // 2. Pass the exact path back to the callbackURL
        callbackURL: redirectTo, 
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
    <div className="min-h-[94.28vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-4 flex flex-col items-center">
        <div className="flex justify-center">
                <Image
                  src="/firemail-opensource.svg"
                  alt="firemail"
                  width={100}
                  height={100}
                  quality={90}
                  style={{ width: '240px', height: 'auto' }}
                  priority
                />
        </div>
        <Button
          type="button"
          size="xl"
          variant="light"
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
      </div>
    </div>
  );
}
