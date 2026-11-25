"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SCENARIOS, type Scenario } from "@/lib/tutor";
import { loadPrefs, type Prefs } from "@/lib/prefs";
import { LogoMark } from "@/components/Logo";
import Conversation from "@/components/Conversation";

const LEVEL_LABEL = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };

export default function Practice() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    setPrefs(loadPrefs());
  }, [status, router]);

  if (status !== "authenticated" || !prefs) return null;
  if (scenario) return <Conversation scenario={scenario} level={prefs.level} onExit={() => setScenario(null)} />;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="text-xl font-bold text-brand">AgencIA English</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-muted underline">
          Salir
        </button>
      </header>

      <h1 className="mt-8 text-3xl font-bold">
        Hola{session.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-muted">
        Nivel: {LEVEL_LABEL[prefs.level]} ·{" "}
        <button className="text-brand underline" onClick={() => {
          localStorage.removeItem("agencia-prefs");
          router.push("/onboarding");
        }}>
          cambiar
        </button>
      </p>

      <h2 className="mt-8 text-lg font-semibold">Elige una conversación</h2>
      <div className="mt-4 flex flex-col gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s)}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-pill transition active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-3xl">
              {s.emoji}
            </span>
            <span>
              <span className="block text-lg font-semibold">{s.title}</span>
              <span className="block text-sm text-muted">{s.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
