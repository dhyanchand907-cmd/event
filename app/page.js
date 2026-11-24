import { redirect } from "next/navigation";

// Middleware sends visitors without a session on to /login.
export default function Home() {
  redirect("/dashboard");
}
