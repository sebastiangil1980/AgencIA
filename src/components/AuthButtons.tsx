"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "./BrandIcons";

type Enabled = { apple: boolean; google: boolean; microsoft: boolean };

export default function AuthButtons({ enabled }: { enabled: Enabled }) {
  const [notice, setNotice] = useState("");

  const go = (id: "apple" | "google" | "azure-ad", on: boolean, label: string) => {
    if (!on) {
      setNotice(`${label} aún no está configurado. Añade sus claves en .env (ver .env.example).`);
      return;
    }
    signIn(id, { callbackUrl: "/onboarding" });
  };

  return (
    <div className="flex flex-col gap-4">
      <button className="pill bg-black text-white" onClick={() => go("apple", enabled.apple, "Apple")}>
        <AppleIcon /> Continuar con Apple
      </button>
      <button className="pill bg-white text-black" onClick={() => go("google", enabled.google, "Google")}>
        <GoogleIcon /> Continuar con Google
      </button>
      <button
        className="pill bg-white text-black"
        onClick={() => go("azure-ad", enabled.microsoft, "Microsoft")}
      >
        <MicrosoftIcon /> Continuar con Microsoft
      </button>

      {notice && <p className="text-center text-sm text-red-600">{notice}</p>}

      <Link href="/login?mode=signup" className="mt-6 text-center text-[19px] text-muted underline underline-offset-4">
        Continuar con correo electrónico
      </Link>
      <p className="mt-2 text-center text-[19px] text-muted">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
