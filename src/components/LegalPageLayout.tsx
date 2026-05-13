import Link from "next/link";

export default function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
        <nav
          className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-8 text-xs uppercase tracking-widest text-muted-foreground"
          aria-label="Site"
        >
          <Link href="/" className="text-accent transition-colors hover:text-accent/90">
            Home
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/policy" className="transition-colors hover:text-foreground">
            Privacy & security
          </Link>
        </nav>
      </div>
    </div>
  );
}
