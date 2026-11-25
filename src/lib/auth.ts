import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const env = process.env;
const providers: Provider[] = [];

if (env.APPLE_ID && env.APPLE_SECRET) {
  providers.push(AppleProvider({ clientId: env.APPLE_ID, clientSecret: env.APPLE_SECRET }));
}
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
  );
}
if (env.AZURE_AD_CLIENT_ID && env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID || "common",
    }),
  );
}

// Acceso por correo. En producción, reemplazar por un proveedor de enlace mágico
// (EmailProvider + base de datos) o por correo + contraseña con hash.
providers.push(
  CredentialsProvider({
    id: "email",
    name: "Correo electrónico",
    credentials: {
      email: { label: "Correo", type: "email" },
      name: { label: "Nombre", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
      const name = credentials?.name?.trim() || email.split("@")[0];
      return { id: email, email, name };
    },
  }),
);

export const enabledProviders = {
  apple: Boolean(env.APPLE_ID && env.APPLE_SECRET),
  google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  microsoft: Boolean(env.AZURE_AD_CLIENT_ID && env.AZURE_AD_CLIENT_SECRET),
};

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  secret: env.NEXTAUTH_SECRET,
};
