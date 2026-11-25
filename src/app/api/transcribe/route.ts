import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });

  const incoming = await req.formData();
  const audio = incoming.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Falta el audio" }, { status: 400 });
  }

  const form = new FormData();
  // El nombre (extensión) le dice a OpenAI el formato: el iPhone graba en mp4, Chrome en webm
  const filename = audio instanceof File && audio.name ? audio.name : "speech.webm";
  form.append("file", audio, filename);
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  form.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    return NextResponse.json({ error: `OpenAI: ${await res.text()}` }, { status: 502 });
  }
  const data = (await res.json()) as { text: string };
  return NextResponse.json({ text: data.text });
}
