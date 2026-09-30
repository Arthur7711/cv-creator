"use client";

import { useEffect, useRef, useState } from "react";
import type { CvStore } from "@/lib/use-cv-store";
import { normalizeDocument } from "@/lib/use-cv-store";
import type { CvData } from "@/lib/cv-types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { hasContent } from "@/components/preview/shared";

type View = "edit" | "preview";

type ToolbarProps = {
  store: CvStore;
  view: View;
  onViewChange: (view: View) => void;
};

type ParseResponse = { data: CvData; source: "ai" | "heuristic"; warning?: string } | { error: string };

export function Toolbar({ store, view, onViewChange }: ToolbarProps) {
  const jsonInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "info" | "warn" | "error" } | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), message.tone === "info" ? 4000 : 9000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const flash = (text: string, tone: "info" | "warn" | "error" = "info") => setMessage({ text, tone });

  const exportPdf = () => {
    const name = store.data.personal.fullName.trim();
    const previousTitle = document.title;
    document.title = name ? `${name} - CV` : "CV";
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    // Make sure the preview is mounted on small screens before printing.
    onViewChange("preview");
    window.setTimeout(() => window.print(), 50);
  };

  const exportJson = () => {
    const doc = store.exportDocument();
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = store.data.personal.fullName.trim().replace(/\s+/g, "-").toLowerCase();
    a.href = url;
    a.download = `${name || "cv"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmReplace = () =>
    !hasContent(store.data) || window.confirm("Replace the current CV content with the imported data?");

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const doc = normalizeDocument(JSON.parse(await file.text()));
      if (!doc) throw new Error("invalid");
      if (!confirmReplace()) return;
      store.importDocument(doc);
      flash("CV imported from JSON.");
    } catch {
      flash("That file doesn't look like a CV export.", "error");
    }
  };

  const importPdf = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const body = (await res.json()) as ParseResponse;
      if (!res.ok || "error" in body) {
        flash("error" in body ? body.error : "Could not read that PDF.", "error");
        return;
      }
      if (!hasContent(body.data)) {
        flash("No CV content could be recognised in that PDF.", "error");
        return;
      }
      if (!confirmReplace()) return;
      store.importDocument({ version: 1, data: body.data, settings: store.settings });
      onViewChange("edit");
      if (body.warning) flash(body.warning, "warn");
      else flash("CV imported from PDF. Review the sections and adjust anything that looks off.");
    } catch {
      flash("Could not reach the import service.", "error");
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear all CV content? This cannot be undone.")) {
      store.clearAll();
      flash("Cleared. Start typing to build your CV.");
    }
  };

  const toneClass = {
    info: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-sm">
            <Icon.FileText size={17} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">CV Creator</p>
            <p className="hidden text-[11px] text-slate-400 sm:block">Build, preview, export</p>
          </div>
        </div>

        <div className="ml-2 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 lg:hidden">
          <button
            type="button"
            onClick={() => onViewChange("edit")}
            aria-pressed={view === "edit"}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              view === "edit" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            <Icon.Edit size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onViewChange("preview")}
            aria-pressed={view === "preview"}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              view === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            <Icon.Eye size={13} /> Preview
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" icon={<Icon.Sparkles size={14} />} onClick={store.loadSample} title="Load example content">
            <span className="hidden sm:inline">Sample</span>
          </Button>
          <Button variant="ghost" size="sm" icon={<Icon.Eraser size={14} />} onClick={clearAll} title="Clear all content">
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={<Icon.Upload size={14} />}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="Import a CV"
            >
              <span className="hidden sm:inline">Import</span>
              <Icon.ChevronDown size={12} className="opacity-60" />
            </Button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-30 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              >
                <MenuItem
                  icon={<Icon.FileText size={16} />}
                  title="From PDF résumé"
                  description="Extract everything from an existing CV"
                  onClick={() => {
                    setMenuOpen(false);
                    pdfInput.current?.click();
                  }}
                />
                <MenuItem
                  icon={<Icon.Download size={16} />}
                  title="From JSON backup"
                  description="Restore a file exported from this app"
                  onClick={() => {
                    setMenuOpen(false);
                    jsonInput.current?.click();
                  }}
                />
              </div>
            ) : null}
          </div>

          <Button variant="ghost" size="sm" icon={<Icon.Download size={14} />} onClick={exportJson} title="Download a JSON backup">
            <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button
            variant="primary"
            icon={<Icon.FileText size={16} />}
            onClick={exportPdf}
            className="ml-1"
            title="Opens the print dialog. Choose “Save as PDF” as the destination."
          >
            Export PDF
          </Button>

          <input
            ref={jsonInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void importJson(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={pdfInput}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              void importPdf(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {message ? (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center px-4">
          <div
            role="status"
            className={`pointer-events-auto flex max-w-xl items-start gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-lg ${toneClass[message.tone]}`}
          >
            <span className="flex-1">{message.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">
              <Icon.X size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {busy ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" role="alert" aria-busy>
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl">
            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-[var(--accent)]" />
            <p className="text-sm font-medium text-slate-800">Reading your CV…</p>
            <p className="text-xs text-slate-500">This usually takes a few seconds.</p>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MenuItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-50"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </button>
  );
}
