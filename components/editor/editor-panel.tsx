"use client";

import type { CvStore } from "@/lib/use-cv-store";
import { PersonalSection } from "./personal-section";
import { DesignSection } from "./design-section";
import {
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  LinksSection,
  ProjectsSection,
  SkillsSection,
} from "./list-sections";

export function EditorPanel({ store }: { store: CvStore }) {
  return (
    <div className="flex flex-col gap-3">
      <DesignSection store={store} />
      <PersonalSection store={store} />
      <ExperienceSection store={store} />
      <EducationSection store={store} />
      <SkillsSection store={store} />
      <ProjectsSection store={store} />
      <LanguagesSection store={store} />
      <LinksSection store={store} />
      <p className="px-2 pt-2 pb-6 text-center text-[11px] text-slate-400">
        Everything is saved automatically in this browser. Use Export JSON to back it up.
      </p>
    </div>
  );
}
