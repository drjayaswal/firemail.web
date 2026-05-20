import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-8xl uppercase text-accent">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        The page you requested does not exist.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="accent" className="rounded-xl">
          <Link href="/">Back to app</Link>
        </Button>
      </div>
    </div>
  );
}
