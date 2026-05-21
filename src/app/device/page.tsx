"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function DeviceConnectPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await authClient.device.approve({
        userCode: code.toUpperCase(), 
      });

      if (error) {
        throw new Error(error.error_description || "An error occurred");
      }

      setStatus("success");
      setMessage("Success! You can now return to your CLI.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to authorize");
    }
  };
  return (
    <div className="flex items-center justify-center py-40">
      <div className="w-full sm:max-w-sm max-w-xs rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Firemail</h1>
        <p className="text-gray-600 mb-6">
          Enter the code displayed in your terminal to authorize Firemail
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD-1234"
              className="w-full text-black text-center text-xl tracking-widest uppercase p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
              required
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "Verifying..." : "Authorize Firemail"}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}