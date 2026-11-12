import { LANGUAGES, type LanguageCode } from "@/lib/languages";
export function LanguageSelector({ id, value, onChange, disabled, label }: { id: string; value?: LanguageCode; onChange?: (c: LanguageCode) => void; disabled?: boolean; label?: string }) {
  return (
    <select id={id} aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value as LanguageCode)}
      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60">
      {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native} ({l.name})</option>)}
    </select>
  );
}

export function LanguageStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Supported languages">
      {LANGUAGES.map((l) => <li key={l.code} className="rounded-full border border-current/25 px-3 py-1 text-sm">{l.native}</li>)}
    </ul>
  );
}
