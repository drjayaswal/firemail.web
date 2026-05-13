import { auth, signIn } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Home from "@/components/Home";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="z-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="space-y-4">
            <Image
              src="/text-logo.png"
              alt="Fathommail"
              width={240}
              height={80}
              className="object-contain mx-auto"
              priority
            />
          </div>

          <div className="w-full p-8 space-y-6">
            <div className="space-y-2 text-left">
              <h1 className="text-xl  tracking-tight text-white">Access Portal</h1>
              <p className="text-sm text-muted-foreground">Authorize with Google to begin indexing your mails.</p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
              className="w-full"
            >
              <Button
                size="sm"
                variant="ghost"
                className="w-full h-10 rounded-xl hover:bg-white hover:text-black text-sm flex items-center justify-center gap-3 transition-all duration-200"
              >
                <Image src="/google.svg" alt="Google" width={18} height={18} />
                Continue with Google
              </Button>
            </form>
            <nav
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest text-muted-foreground"
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
        </div>
      </div>
    );
  }
  return (
    <Home
      sessionUserEmail={session.user?.email ?? null}
      sessionUserId={session.user?.id ?? null}
    />
  );
}