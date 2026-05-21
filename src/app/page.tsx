import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import Home from "@/components/Home";
import Auth from "@/components/Auth";

export default async function HomePage() {
  const session = await auth();
  if (!session) return <Auth />
  const email = session.user?.email ?? null;
  return (
    <Home
      sessionUserEmail={email}
      sessionUserId={session.user?.id ?? null}
      isAdmin={isAdminEmail(email)}
    />
  );
}