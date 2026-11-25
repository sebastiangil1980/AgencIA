"use client";
import { useEffect, useRef, useState } from "react";
import type { Level, Scenario } from "@/lib/tutor";

type Feedback = { ok: boolean; corrected: string; explanation: string; score: number } | null;
type Turn = { role: "user" | "assistant"; content: string; feedback?: Feedback };

// Un único reproductor que se "desbloquea" con un toque del usuario (requisito de iPhone/Safari)
let player: HTMLAudioElement | null = null;
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!player) player = new Audio();
  player.src = SILENCE;
  player.play().catch(() => {});
}

function extensionFor(mime: string) {
  if (mime.includes("mp4") || mime.includes("aac")) return "mp4";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg")) return "mp3";
  return "webm";
}

async function speak(text: string) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.status === 200) {
      const url = URL.createObjectURL(await res.blob());
      if (!player) player = new Audio();
      player.src = url;
      player.onended = () => URL.revokeObjectURL(url);
      await player.play();
      return;
    }
  } catch {
    /* sigue con la voz del navegador */
  }
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

export default function Conversation({
  scenario,
  level,
  onExit,
}: {
  scenario: Scenario;
  level: Level;
  onExit: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", content: scenario.opener }]);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState<"" | "listening" | "thinking">("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speak(scenario.opener);
  }, [scenario.opener]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  const send = async (content: string) => {
    if (!content.trim()) return;
    setError("");
    const history = [...turns, { role: "user" as const, content }];
    setTurns(history);
    setBusy("thinking");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          level,
          // el primer mensaje (opener) lo añade el servidor
          messages: history.slice(1).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error del servidor");
      setTurns((t) => {
        const copy = [...t];
        copy[copy.length - 1] = { ...copy[copy.length - 1], feedback: data.feedback };
        return [...copy, { role: "assistant", content: data.reply }];
      });
      speak(data.reply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const toggleMic = async () => {
    unlockAudio();
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = mr.mimeType || chunks.current[0]?.type || "audio/webm";
        const blob = new Blob(chunks.current, { type: mime });
        if (blob.size < 1000) {
          setError("No se escuchó nada. Mantén el micrófono activo mientras hablas y vuelve a tocar para enviar.");
          return;
        }
        setBusy("listening");
        const form = new FormData();
        form.append("audio", blob, `speech.${extensionFor(mime)}`);
        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "No se pudo transcribir");
          setBusy("");
          await send(data.text);
        } catch (e) {
          setBusy("");
          setError((e as Error).message);
        }
      };
      recorder.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      const name = (e as Error).name;
      setError(
        name === "NotAllowedError"
          ? "El micrófono está bloqueado. En el iPhone: toca «aA» en la barra de Safari → Configuración del sitio web → Micrófono → Permitir, y recarga la página."
          : !navigator.mediaDevices
            ? "Este navegador no permite usar el micrófono aquí. Abre la página con https:// en Safari o Chrome."
            : `No se pudo acceder al micrófono (${name}).`,
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3">
        <button onClick={onExit} className="text-2xl text-muted" aria-label="Volver">←</button>
        <span className="text-2xl">{scenario.emoji}</span>
        <h1 className="text-xl font-bold">{scenario.title}</h1>
      </header>

      <div className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[85%]"}>
            <div
              className={`rounded-3xl px-4 py-3 text-[17px] leading-snug ${
                t.role === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white shadow-pill"
              }`}
            >
              {t.content}
              {t.role === "assistant" && (
                <button onClick={() => speak(t.content)} className="ml-2 align-middle text-sm opacity-60" aria-label="Escuchar">
                  🔊
                </button>
              )}
            </div>
            {t.feedback && (
              <div
                className={`mt-2 rounded-2xl px-4 py-3 text-sm ${
                  t.feedback.ok ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"
                }`}
              >
                <div className="font-semibold">
                  {t.feedback.ok ? "✅ ¡Muy bien!" : "💡 Mejor dicho:"} <span className="float-right">{t.feedback.score}/100</span>
                </div>
                {t.feedback.corrected && <div className="mt-1 italic">“{t.feedback.corrected}”</div>}
                {t.feedback.explanation && <div className="mt-1">{t.feedback.explanation}</div>}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="self-start rounded-3xl bg-white px-4 py-3 text-muted shadow-pill">
            {busy === "listening" ? "Transcribiendo…" : "Pensando…"}
          </div>
        )}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <div ref={bottom} />
      </div>

      <div className="sticky bottom-0 flex flex-col items-center gap-4 bg-surface pt-3">
        <button
          onClick={toggleMic}
          disabled={!!busy}
          aria-label={recording ? "Detener grabación" : "Hablar"}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-lg disabled:opacity-50"
        >
          {recording && <span className="pulse-ring absolute inset-0 rounded-full bg-brand" />}
          <span className="relative text-3xl">{recording ? "■" : "🎙️"}</span>
        </button>
        <p className="text-sm text-muted">{recording ? "Toca para enviar" : "Toca y habla en inglés"}</p>
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            unlockAudio();
            send(text);
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="…o escribe tu respuesta"
            className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 shadow-pill outline-none focus:ring-2 focus:ring-brand"
          />
          <button disabled={!!busy || !text.trim()} className="rounded-full bg-brand px-5 font-semibold text-white disabled:opacity-50">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
