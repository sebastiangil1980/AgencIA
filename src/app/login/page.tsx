"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ProgressBar from "@/components/ProgressBar";
import { LogoMark } from "@/components/Logo";

function LoginForm() {
  const signup = useSearchParams().get("mode") === "signup";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("email", { email, name, redirect: false });
    setLoading(false);
    if (res?.ok) window.location.href = "/onboarding";
    else setError("Revisa tu correo electrónico.");
  };

  return (
    <div className="flex flex-1 flex-col">
      <ProgressBar value={signup ? 0.15 : 1} />
      <Link href="/" className="mt-6 text-2xl text-muted" aria-label="Volver">←</Link>
      <div className="mt-8 flex flex-col items-center gap-4">
        <LogoMark size={64} />
        <h1 className="text-3xl font-bold">{signup ? "Crea tu cuenta" : "Inicia sesión"}</h1>
      </div>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
        {signup && (
          <input
            className="rounded-2xl bg-white px-5 py-4 text-lg shadow-pill outline-none focus:ring-2 focus:ring-brand"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          required
          className="rounded-2xl bg-white px-5 py-4 text-lg shadow-pill outline-none focus:ring-2 focus:ring-brand"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="pill mt-4 bg-brand text-white">
          {loading ? "Entrando…" : "Continuar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
