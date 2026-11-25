# AgencIA English

App web (pensada para móvil) para aprender inglés **conversando por voz con IA**.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Interfaz | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Inicio de sesión | NextAuth: Apple, Google, Microsoft (Entra ID) y correo |
| Conversación y correcciones | OpenAI Chat Completions (`gpt-4o-mini` por defecto) |
| Voz a texto | OpenAI Transcriptions (`gpt-4o-mini-transcribe`) |
| Texto a voz | ElevenLabs o Cartesia (si no hay clave, usa la voz del navegador) |

## Flujo

1. **Bienvenida** (`/`): botones Apple / Google / Microsoft / correo.
2. **Onboarding** (`/onboarding`): nivel, objetivo y trato, con barra de progreso.
3. **Práctica** (`/practice`): eliges un escenario (charla casual, entrevista, restaurante…).
4. **Conversación**: tocas el micrófono, hablas en inglés → se transcribe → la IA responde en personaje,
   con voz, y te muestra una corrección en español con puntuación 0-100.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa tus claves
npm run dev                  # http://localhost:3000
```

Como mínimo necesitas `NEXTAUTH_SECRET` y `OPENAI_API_KEY`. Cada botón de inicio de sesión se activa
cuando sus variables están en `.env.local`. El acceso por correo funciona sin configuración, pero es
solo para desarrollo: en producción, sustitúyelo por un enlace mágico o contraseña con base de datos.

## Estructura

```
src/app/page.tsx              Bienvenida
src/app/login/                Acceso por correo
src/app/onboarding/           Preguntas iniciales
src/app/practice/             Escenarios
src/components/Conversation   Chat de voz
src/app/api/chat              OpenAI: respuesta + corrección (JSON)
src/app/api/transcribe        OpenAI: voz a texto
src/app/api/tts               ElevenLabs / Cartesia: texto a voz
src/lib/tutor.ts              Escenarios y prompt del tutor
```
