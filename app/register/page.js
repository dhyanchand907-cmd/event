import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <main className="auth-wrap">
      <AuthForm mode="register" />
    </main>
  );
}
