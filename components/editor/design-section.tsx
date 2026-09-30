"use client";

import type { CvStore } from "@/lib/use-cv-store";
import { ACCENT_PRESETS, type FontId, type TemplateId } from "@/lib/cv-types";
import { Toggle } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { Section } from "./section";

const templates: { id: TemplateId; name: string; description: string }[] = [
  { id: "modern", name: "Modern", description: "Two columns with a colored sidebar" },
  { id: "classic", name: "Classic", description: "Centered header, traditional layout" },
  { id: "minimal", name: "Minimal", description: "Clean, airy, and typographic" },
];

const fonts: { id: FontId; name: string }[] = [
  { id: "sans", name: "Sans" },
  { id: "serif", name: "Serif" },
];

export function DesignSection({ store }: { store: CvStore }) {
  const { settings } = store;
  return (
    <Section title="Design" icon={<Icon.Palette size={16} />} defaultOpen>
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Template</p>
          <div className="grid grid-cols-3 gap-2">
            {templates.map((t) => {
              const active = settings.template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => store.updateSettings("template", t.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 ring-2 ring-[var(--accent)]/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <TemplateThumb id={t.id} />
                  <span className="text-xs font-semibold text-slate-800">{t.name}</span>
                  <span className="text-[10px] leading-tight text-slate-400">{t.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Accent color</p>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_PRESETS.map((color) => {
              const active = settings.accent.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  aria-pressed={active}
                  onClick={() => store.updateSettings("accent", color)}
                  style={{ backgroundColor: color }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:scale-110 ${
                    active ? "ring-2 ring-slate-900/70 ring-offset-2" : ""
                  }`}
                >
                  {active ? <Icon.Check size={14} /> : null}
                </button>
              );
            })}
            <label
              className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-300 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
              title="Custom color"
            >
              <Icon.Plus size={14} />
              <input
                type="color"
                value={settings.accent}
                onChange={(e) => store.updateSettings("accent", e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom accent color"
              />
            </label>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Typeface</p>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {fonts.map((f) => {
              const active = settings.font === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => store.updateSettings("font", f.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    f.id === "serif" ? "font-serif" : ""
                  } ${active ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Toggle
            label="Show photo"
            checked={settings.showPhoto}
            onChange={(v) => store.updateSettings("showPhoto", v)}
          />
          <Toggle
            label="Show skill levels"
            checked={settings.showSkillLevels}
            onChange={(v) => store.updateSettings("showSkillLevels", v)}
          />
        </div>
      </div>
    </Section>
  );
}

function TemplateThumb({ id }: { id: TemplateId }) {
  const bar = "rounded-sm bg-slate-300";
  if (id === "modern") {
    return (
      <div className="flex h-14 w-full gap-1 overflow-hidden rounded-md border border-slate-200 bg-white p-1">
        <div className="w-1/3 rounded-sm bg-[var(--accent)]/70" />
        <div className="flex flex-1 flex-col gap-1 pt-1">
          <div className={`${bar} h-1.5 w-3/4`} />
          <div className={`${bar} h-1 w-1/2`} />
          <div className={`${bar} mt-1 h-1 w-full`} />
          <div className={`${bar} h-1 w-5/6`} />
        </div>
      </div>
    );
  }
  if (id === "classic") {
    return (
      <div className="flex h-14 w-full flex-col items-center gap-1 overflow-hidden rounded-md border border-slate-200 bg-white p-1.5">
        <div className={`${bar} h-1.5 w-1/2`} />
        <div className="h-0.5 w-full bg-[var(--accent)]/70" />
        <div className={`${bar} h-1 w-full`} />
        <div className={`${bar} h-1 w-5/6`} />
        <div className={`${bar} h-1 w-full`} />
      </div>
    );
  }
  return (
    <div className="flex h-14 w-full flex-col gap-1 overflow-hidden rounded-md border border-slate-200 bg-white p-1.5">
      <div className={`${bar} h-2 w-2/5`} />
      <div className="h-px w-full bg-slate-200" />
      <div className={`${bar} h-1 w-full`} />
      <div className={`${bar} h-1 w-4/5`} />
      <div className={`${bar} h-1 w-full`} />
    </div>
  );
}
