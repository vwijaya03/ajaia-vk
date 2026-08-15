import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
        <p className="text-sm font-medium text-indigo-600">Ajaia Docs</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use a seeded demo account to explore document editing and sharing.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-zinc-500">
          Demo users: alice@ajaia.test, bob@ajaia.test, carol@ajaia.test — password{" "}
          <code className="rounded bg-zinc-100 px-1">password123</code>
        </p>
      </div>
    </div>
  );
}
