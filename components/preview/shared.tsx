import type { ReactNode } from "react";
import type { CvData, CvSettings } from "@/lib/cv-types";
import { parseDescription } from "@/lib/format";

export type TemplateProps = {
  data: CvData;
  settings: CvSettings;
};

/** Pick white or near-black text for readability on the given hex color. */
export function readableOn(hex: string): string {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return "#ffffff";
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111827" : "#ffffff";
}

export function Description({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parseDescription(text);
  if (blocks.length === 0) return null;
  return (
    <div className={`cv-desc ${className}`}>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i}>{block.text}</p>
        ) : (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export function hasContent(data: CvData): boolean {
  const p = data.personal;
  return Boolean(
    p.fullName ||
      p.title ||
      p.summary ||
      data.experience.length ||
      data.education.length ||
      data.skills.length ||
      data.projects.length,
  );
}

export function EmptyPage() {
  return (
    <div className="flex h-[297mm] flex-col items-center justify-center gap-2 text-center text-slate-300">
      <p className="text-lg font-medium text-slate-400">Your CV will appear here</p>
      <p className="text-sm">Fill in your details on the left to get started.</p>
    </div>
  );
}

export function SkillDots({ level, color, muted }: { level: number; color: string; muted: string }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="block h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: n <= level ? color : muted }}
        />
      ))}
    </span>
  );
}

export function SkillBar({ level, color, muted }: { level: number; color: string; muted: string }) {
  return (
    <span className="block h-[4px] w-full overflow-hidden rounded-full" style={{ backgroundColor: muted }}>
      <span className="block h-full rounded-full" style={{ width: `${(level / 5) * 100}%`, backgroundColor: color }} />
    </span>
  );
}

export function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-baseline justify-between gap-4 ${className}`}>{children}</div>;
}

export const icons = {
  mail: (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
};
