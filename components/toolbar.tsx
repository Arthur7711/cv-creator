"use client";

import { useRef, useState } from "react";
import type { CvStore } from "@/lib/use-cv-store";
import { normalizeDocument } from "@/lib/use-cv-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

type View = "edit" | "preview";

type ToolbarProps = {
  store: CvStore;
  view: View;
  onViewChange: (view: View) => void;
};

export function Toolbar({ store, view, onViewChange }: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3500);
  };

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

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const doc = normalizeDocument(JSON.parse(await file.text()));
      if (!doc) throw new Error("invalid");
      store.importDocument(doc);
      flash("CV imported.");
    } catch {
      flash("That file doesn't look like a CV export.");
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear all CV content? This cannot be undone.")) {
      store.clearAll();
      flash("Cleared. Start typing to build your CV.");
    }
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
          {message ? (
            <span className="mr-2 hidden text-xs text-slate-500 md:inline" role="status">
              {message}
            </span>
          ) : null}
          <Button variant="ghost" size="sm" icon={<Icon.Sparkles size={14} />} onClick={store.loadSample} title="Load example content">
            <span className="hidden sm:inline">Sample</span>
          </Button>
          <Button variant="ghost" size="sm" icon={<Icon.Eraser size={14} />} onClick={clearAll} title="Clear all content">
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          <Button variant="ghost" size="sm" icon={<Icon.Upload size={14} />} onClick={() => fileInput.current?.click()} title="Import a JSON backup">
            <span className="hidden sm:inline">Import</span>
          </Button>
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
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void importJson(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </header>
  );
}
