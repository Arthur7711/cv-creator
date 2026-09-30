"use client";

import { useState } from "react";
import { useCvStore } from "@/lib/use-cv-store";
import { EditorPanel } from "@/components/editor/editor-panel";
import { ScaledPreview } from "@/components/preview/cv-preview";
import { Toolbar } from "@/components/toolbar";

export function CvBuilder() {
  const store = useCvStore();
  const [view, setView] = useState<"edit" | "preview">("edit");

  return (
    <div
      className="flex min-h-dvh flex-col bg-slate-100 text-slate-900 print:min-h-0 print:bg-white"
      style={{ "--accent": store.settings.accent } as React.CSSProperties}
    >
      <Toolbar store={store} view={view} onViewChange={setView} />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row print:block print:max-w-none">
        <aside
          className={`w-full shrink-0 px-4 pt-4 lg:w-[460px] lg:pb-8 print:hidden ${
            view === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <EditorPanel store={store} />
        </aside>

        <section
          className={`min-w-0 flex-1 px-4 py-4 lg:px-8 lg:py-6 print:block print:p-0 ${
            view === "preview" ? "block" : "hidden lg:block"
          }`}
          aria-label="CV preview"
        >
          <div className="lg:sticky lg:top-20">
            <ScaledPreview data={store.data} settings={store.settings} />
            <p className="mt-4 text-center text-[11px] text-slate-400 print:hidden">
              A4 preview · Export PDF opens your browser’s print dialog — choose “Save as PDF”.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
