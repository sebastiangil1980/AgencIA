import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function elevenLabs(text: string) {
  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5",
      }),
    },
  );
}

async function cartesia(text: string) {
  return fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.CARTESIA_API_KEY!,
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: process.env.CARTESIA_MODEL_ID || "sonic-2",
      transcript: text,
      voice: { mode: "id", id: process.env.CARTESIA_VOICE_ID },
      language: "en",
      output_format: { container: "mp3", sample_rate: 44100, bit_rate: 128000 },
    }),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { text } = (await req.json()) as { text: string };
  if (!text) return NextResponse.json({ error: "Falta el texto" }, { status: 400 });

  const provider = process.env.TTS_PROVIDER || "elevenlabs";
  const canEleven = Boolean(process.env.ELEVENLABS_API_KEY);
  const canCartesia = Boolean(process.env.CARTESIA_API_KEY && process.env.CARTESIA_VOICE_ID);

  let res: Response | null = null;
  if (provider === "cartesia" && canCartesia) res = await cartesia(text);
  else if (canEleven) res = await elevenLabs(text);
  else if (canCartesia) res = await cartesia(text);

  // 204 = sin proveedor configurado: el cliente usa la voz del navegador
  if (!res) return new NextResponse(null, { status: 204 });
  if (!res.ok) {
    return NextResponse.json({ error: `TTS: ${await res.text()}` }, { status: 502 });
  }
  return new NextResponse(res.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
