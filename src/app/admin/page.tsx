import { auth } from "@/lib/auth";
import Admin from "@/components/Admin";
import Restriction from "@/components/Restriction";
import Auth from "@/components/Auth";

export default async function AdminPage() {
  const session = await auth();
  if (!session) return <Auth />
  if (session.user?.email != process.env.ADMIN_EMAIL) return <Restriction />
  return <Admin sessionAdminId={session.user?.email ?? null}/>
}