"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";

export default function DeviceConnectPage() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userCode, setUserCode] = useState(searchParams.get("user_code") || "");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (searchParams.has("user_code")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("user_code");
      const newQuery = params.toString();
      const newPath = window.location.pathname + (newQuery ? `?${newQuery}` : "");
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (session?.user && userCode) {
      const autoSubmit = async () => {
        setIsProcessing(true);
        try {
          const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();
          const response = await authClient.device({
            query: { user_code: formattedCode },
          });

          if (response.data) {
            window.location.href = `/device/approve?user_code=${encodeURIComponent(formattedCode)}`;
          }
        } catch (err) {
          console.error("Auto-authorization failed", err);
          setIsProcessing(false);
        }
      };

      autoSubmit();
    }
  }, [session, userCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();
      const approvalPath = `/device/approve?user_code=${encodeURIComponent(formattedCode)}`;
      if (!session?.user) {
        const verificationPath = `/device?user_code=${encodeURIComponent(formattedCode)}`;
        window.location.href = `/?redirect=${encodeURIComponent(verificationPath)}`;
        return;
      }
      const response = await authClient.device({
        query: { user_code: formattedCode },
      });

      if (response.data) {
        window.location.href = approvalPath;
      }
    } catch (err) {
      console.log(err);
      setIsProcessing(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/-/g, "").toUpperCase();
    if (val.length > 4) val = val.slice(0, 4) + "-" + val.slice(4);
    setUserCode(val);
  };

  return (
    <div className="flex flex-col items-center justify-center sm:p-10 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <Image
            src="/firemail-opensource.svg"
            alt="firemail"
            width={100}
            height={100}
            quality={90}
            className="h-auto w-48 object-contain"
            priority
          />
        </div>

        <div className="space-y-2 text-center w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Connect Device
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Enter the code displayed in your terminal to authorize Firemail.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <input
              type="text"
              maxLength={9}
              value={userCode}
              onChange={handleCodeChange}
              placeholder="ABCD-1234"
              className="w-full text-black text-center text-2xl font-medium tracking-widest uppercase py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
              required
              disabled={isProcessing}
            />
          </div>

          <Button
            type="submit"
            size="xl"
            variant="accent"
            className="w-full text-base"
            disabled={isProcessing || userCode.replace(/-/g, "").length < 8}
          >
            {isProcessing ? (
              <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isProcessing ? "Authorizing..." : "Authorize Firemail"}
          </Button>
        </form>
      </div>
    </div>
  );
}