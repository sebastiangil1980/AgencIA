export function LogoMark({ size = 48 }: { size?: number }) {
  // Marca original: burbuja de diálogo con onda de voz
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 5C13 5 5 12.6 5 22c0 5 2.3 9.4 6 12.5V43l8-4.4c1.6.3 3.3.4 5 .4 11 0 19-7.6 19-17S35 5 24 5Z"
        stroke="#6A0DF5"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M15 22v0M20 17v10M25 13v18M30 17v10M35 22v0" stroke="#6A0DF5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <LogoMark size={50} />
      <span className="whitespace-nowrap text-[32px] font-extrabold tracking-tight text-brand">
        AgencIA <span className="font-black">English</span>
      </span>
    </div>
  );
}
