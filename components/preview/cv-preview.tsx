"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CvData, CvSettings } from "@/lib/cv-types";
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "./templates";

export const A4_WIDTH_PX = 794; // 210mm at 96dpi
export const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

/** The bare A4 document. Rendered on screen (scaled) and used as-is for printing. */
export function CvPage({ data, settings }: { data: CvData; settings: CvSettings }) {
  const Template = templates[settings.template] ?? ModernTemplate;
  return (
    <div
      className={`cv-page ${settings.font === "serif" ? "font-serif" : "font-sans"}`}
      style={{ "--cv-accent": settings.accent } as React.CSSProperties}
    >
      <Template data={data} settings={settings} />
    </div>
  );
}

/** Fits the A4 page into the available width with a CSS transform. */
export function ScaledPreview({ data, settings }: { data: CvData; settings: CvSettings }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT_PX);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;

    const update = () => {
      const available = container.clientWidth;
      setScale(Math.min(1, available / A4_WIDTH_PX));
      setPageHeight(page.offsetHeight || A4_HEIGHT_PX);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="cv-preview-container w-full">
      <div
        className="cv-preview-sizer relative mx-auto"
        style={{ width: A4_WIDTH_PX * scale, height: pageHeight * scale }}
      >
        <div
          id="cv-print-root"
          ref={pageRef}
          className="cv-print-root absolute top-0 left-0 origin-top-left shadow-[0_2px_8px_rgba(15,23,42,0.08),0_24px_48px_-12px_rgba(15,23,42,0.18)]"
          style={{ width: A4_WIDTH_PX, transform: `scale(${scale})` }}
        >
          <CvPage data={data} settings={settings} />
        </div>
      </div>
    </div>
  );
}
