import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, enabledProviders } from "@/lib/auth";
import Logo from "@/components/Logo";
import ProgressBar from "@/components/ProgressBar";
import AuthButtons from "@/components/AuthButtons";

export default async function Welcome() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/onboarding");

  return (
    <div className="flex flex-1 flex-col">
      <ProgressBar value={1} />
      <div className="mt-[38%] mb-12">
        <Logo />
      </div>
      <AuthButtons enabled={enabledProviders} />
      <div className="mt-10 space-y-3 px-1 text-center text-[15px] leading-snug text-muted">
        <p>
          Al continuar, aceptas que AgencIA English comparta tus mensajes y tu voz con servicios de
          IA de terceros para impulsar tus conversaciones.
        </p>
        <p>
          OpenAI, ElevenLabs y Cartesia procesan tus mensajes, transcripciones de voz, contexto de
          conversación, nombre y género para ofrecer conversaciones, voces y comentarios con IA.
        </p>
      </div>
    </div>
  );
}
