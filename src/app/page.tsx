import { auth } from "@/lib/auth";
import Home from "@/components/Home";
import Auth from "@/components/Auth";

export default async function HomePage() {
  const session = await auth();
  if (!session) return <Auth />
  return <Home sessionUserEmail={session.user?.email ?? null} sessionUserId={session.user?.id ?? null}/>
}