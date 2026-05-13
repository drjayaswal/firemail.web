import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not found | fathom²ail",
  description: "This URL is the dedicated not-found reference for fathom²ail.",
};

export default function NotFoundReferencePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Not found</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Nothing here
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        You opened the <span className="text-foreground">/notfound</span> route. Use the
        button below to return to the dashboard or review legal information.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="accent" className="rounded-xl">
          <Link href="/">Back to app</Link>
        </Button>
      </div>
      <nav
        className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-muted-foreground"
        aria-label="Legal"
      >
        <Link href="/terms" className="transition-colors hover:text-foreground">
          Terms
        </Link>
        <Link href="/policy" className="transition-colors hover:text-foreground">
          Privacy & security
        </Link>
      </nav>
    </div>
  );
}
