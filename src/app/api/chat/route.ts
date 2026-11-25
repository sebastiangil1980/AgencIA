import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildSystemPrompt, getScenario, type Level } from "@/lib/tutor";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });

  const body = (await req.json()) as { scenarioId: string; level: Level; messages: Msg[] };
  const scenario = getScenario(body.scenarioId);
  const history = (body.messages ?? []).slice(-20);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(scenario, body.level ?? "intermediate", session.user?.name ?? undefined),
        },
        { role: "assistant", content: scenario.opener },
        ...history,
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `OpenAI: ${await res.text()}` }, { status: 502 });
  }
  const data = await res.json();
  try {
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content ?? "", feedback: null });
  }
}
