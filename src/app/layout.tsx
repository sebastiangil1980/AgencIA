import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "AgencIA English",
  description: "Aprende inglés conversando con IA",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EBEAEE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
