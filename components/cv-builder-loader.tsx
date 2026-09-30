"use client";

import dynamic from "next/dynamic";

/**
 * The builder reads localStorage during initialization, so it is rendered
 * on the client only. This avoids a server/client mismatch and a flash of
 * sample content before the saved CV appears.
 */
const CvBuilder = dynamic(() => import("./cv-builder").then((m) => m.CvBuilder), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 text-sm text-slate-400">
      Loading your CV…
    </div>
  ),
});

export function CvBuilderLoader() {
  return <CvBuilder />;
}
