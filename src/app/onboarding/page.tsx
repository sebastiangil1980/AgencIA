"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/prefs";
import type { Level } from "@/lib/tutor";

type Option = { value: string; label: string; emoji: string };
type Step = { key: "gender" | "level" | "goal"; title: string; options: Option[] };

const STEPS: Step[] = [
  {
    key: "level",
    title: "¿Cuál es tu nivel de inglés?",
    options: [
      { value: "beginner", label: "Principiante", emoji: "🌱" },
      { value: "intermediate", label: "Intermedio", emoji: "🌿" },
      { value: "advanced", label: "Avanzado", emoji: "🌳" },
    ],
  },
  {
    key: "goal",
    title: "¿Para qué quieres aprender inglés?",
    options: [
      { value: "work", label: "Trabajo", emoji: "💼" },
      { value: "travel", label: "Viajar", emoji: "✈️" },
      { value: "study", label: "Estudios", emoji: "🎓" },
      { value: "fun", label: "Por diversión", emoji: "🎉" },
    ],
  },
  {
    key: "gender",
    title: "¿Cómo prefieres que te traten?",
    options: [
      { value: "female", label: "Femenino", emoji: "👩" },
      { value: "male", label: "Masculino", emoji: "👨" },
      { value: "neutral", label: "Prefiero no decirlo", emoji: "🙂" },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    const p = loadPrefs();
    if (p.done) router.replace("/practice");
    else setPrefs(p);
  }, [router]);

  if (!prefs) return null;
  const current = STEPS[step];

  const choose = (value: string) => {
    const next = { ...prefs, [current.key]: current.key === "level" ? (value as Level) : value };
    if (step === STEPS.length - 1) {
      savePrefs({ ...next, done: true });
      router.push("/practice");
    } else {
      setPrefs(next);
      setStep(step + 1);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <ProgressBar value={(step + 1) / (STEPS.length + 1)} />
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-6 self-start text-2xl text-muted" aria-label="Volver">
          ←
        </button>
      )}
      <h1 className="mt-14 text-center text-3xl font-bold leading-tight">{current.title}</h1>
      <div className="mt-10 flex flex-col gap-4">
        {current.options.map((o) => (
          <button
            key={o.value}
            onClick={() => choose(o.value)}
            className={`pill justify-start bg-white text-black ${
              prefs[current.key] === o.value ? "ring-2 ring-brand" : ""
            }`}
          >
            <span className="text-2xl">{o.emoji}</span> {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
