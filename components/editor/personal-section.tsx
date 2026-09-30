"use client";

import { useRef } from "react";
import type { CvStore } from "@/lib/use-cv-store";
import { Field, TextArea } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Section } from "./section";

/** Downscale an image file to a small JPEG data URL so it fits comfortably in localStorage. */
async function fileToDataUrl(file: File, maxSize = 512): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function PersonalSection({ store }: { store: CvStore }) {
  const { personal } = store.data;
  const fileInput = useRef<HTMLInputElement>(null);

  const onPhotoChange = async (file: File | undefined) => {
    if (!file) return;
    try {
      store.updatePersonal("photo", await fileToDataUrl(file));
    } catch {
      // Unsupported image; leave the current photo untouched.
    }
  };

  return (
    <Section title="Personal details" icon={<Icon.User size={16} />} defaultOpen>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            {personal.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
              <img src={personal.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-slate-300">
                <Icon.Camera size={28} />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={<Icon.Upload size={14} />} onClick={() => fileInput.current?.click()}>
                {personal.photo ? "Change photo" : "Upload photo"}
              </Button>
              {personal.photo ? (
                <Button size="sm" variant="danger" onClick={() => store.updatePersonal("photo", "")}>
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400">Square images look best. Stored locally in your browser.</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void onPhotoChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Full name"
            placeholder="Alex Morgan"
            value={personal.fullName}
            onChange={(e) => store.updatePersonal("fullName", e.target.value)}
          />
          <Field
            label="Job title"
            placeholder="Senior Frontend Engineer"
            value={personal.title}
            onChange={(e) => store.updatePersonal("title", e.target.value)}
          />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={personal.email}
            onChange={(e) => store.updatePersonal("email", e.target.value)}
          />
          <Field
            label="Phone"
            type="tel"
            placeholder="+1 555 000 0000"
            value={personal.phone}
            onChange={(e) => store.updatePersonal("phone", e.target.value)}
          />
          <Field
            label="Location"
            placeholder="City, Country"
            value={personal.location}
            onChange={(e) => store.updatePersonal("location", e.target.value)}
          />
          <Field
            label="Website"
            placeholder="yourname.dev"
            value={personal.website}
            onChange={(e) => store.updatePersonal("website", e.target.value)}
          />
        </div>

        <TextArea
          label="Professional summary"
          rows={5}
          placeholder="Two or three sentences about who you are, what you do best, and what you're looking for."
          value={personal.summary}
          onChange={(e) => store.updatePersonal("summary", e.target.value)}
        />
      </div>
    </Section>
  );
}
