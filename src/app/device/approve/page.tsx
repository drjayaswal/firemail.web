"use client";

import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

type ModalState = "idle" | "success" | "denied" | "error";

export default function DeviceApprovalPage() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ModalState>("idle");

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await authClient.device.approve({
        userCode: userCode!,
      });
      setStatus("success");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setStatus("error");
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    try {
      await authClient.device.deny({
        userCode: userCode!,
      });
      setStatus("denied");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setStatus("error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center sm:p-10 p-4">
      <div className="w-full max-w-sm border border-gray-200 rounded-xl shadow-sm p-8 space-y-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
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

        {status === "idle" && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-black">
                Authorization Request
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                A device is requesting access to your account.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 w-full flex justify-center">
              <span className="text-xl font-mono font-semibold tracking-widest text-black">
                {userCode || "----"}
              </span>
            </div>

            <div className="w-full space-y-3">
              <Button
                onClick={handleApprove}
                disabled={isProcessing || !userCode}
                size="xl"
                variant="accent"
                className="w-full text-base"
              >
                {isProcessing ? (
                  <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {isProcessing ? "Processing..." : "Approve Access"}
              </Button>
              <Button
                onClick={handleDeny}
                disabled={isProcessing || !userCode}
                variant="light"
                size="xl"
                className="w-full text-base text-gray-600 hover:text-black"
              >
                Deny
              </Button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in fade-in duration-300 w-full py-4">
            <CheckCircle2Icon className="w-16 h-16 text-green-500" />
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">Device Approved</h2>
              <p className="text-sm text-gray-500">Redirecting you securely...</p>
            </div>
          </div>
        )}

        {status === "denied" && (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in fade-in duration-300 w-full py-4">
            <XCircleIcon className="w-16 h-16 text-red-500" />
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
              <p className="text-sm text-gray-500">Redirecting to home...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in fade-in duration-300 w-full py-4">
            <XCircleIcon className="w-16 h-16 text-red-500" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Action Failed</h2>
              <p className="text-sm text-gray-500 mb-4">
                We couldn't process this request. Please try again.
              </p>
            </div>
            <Button
              onClick={() => setStatus("idle")}
              variant="outline"
              size="xl"
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}