export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-[13px] w-full overflow-hidden rounded-full bg-black/10">
      <div
        className="h-full rounded-full bg-brand transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}
