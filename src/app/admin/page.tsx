import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import Admin from "@/components/Admin";
import Restriction from "@/components/Restriction";
import Auth from "@/components/Auth";

export default async function AdminPage() {
  const session = await auth();
  if (!session) return <Auth />
  if (!isAdminEmail(session.user?.email)) return <Restriction />
  return <Admin sessionAdminId={session.user?.email ?? null}/>
}