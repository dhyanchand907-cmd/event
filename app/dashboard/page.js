import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import EventManager from "@/components/EventManager";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // Second line of defence behind middleware.
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <header className="topbar">
        <strong className="brand">Event Management</strong>
        <div className="topbar-right">
          <span className="muted">Hi, {session.name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="container">
        <EventManager currentUserId={session.id} />
      </main>
    </>
  );
}
