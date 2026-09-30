export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
};

export type EducationItem = {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  description: string;
};

export type SkillItem = {
  id: string;
  name: string;
  level: number; // 1-5
};

export type LanguageItem = {
  id: string;
  name: string;
  level: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  link: string;
  description: string;
};

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type Personal = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  photo: string; // data URL or empty
};

export type CvData = {
  personal: Personal;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  links: LinkItem[];
};

export type ListKey = Exclude<keyof CvData, "personal">;

export type TemplateId = "modern" | "classic" | "minimal";
export type FontId = "sans" | "serif";

export type CvSettings = {
  template: TemplateId;
  accent: string;
  font: FontId;
  showPhoto: boolean;
  showSkillLevels: boolean;
};

export type CvDocument = {
  version: 1;
  data: CvData;
  settings: CvSettings;
};

export const ACCENT_PRESETS = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0f172a",
];

export const DEFAULT_SETTINGS: CvSettings = {
  template: "modern",
  accent: ACCENT_PRESETS[0],
  font: "sans",
  showPhoto: true,
  showSkillLevels: true,
};

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function emptyData(): CvData {
  return {
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      photo: "",
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    links: [],
  };
}

export function sampleData(): CvData {
  return {
    personal: {
      fullName: "Alex Morgan",
      title: "Senior Frontend Engineer",
      email: "alex.morgan@example.com",
      phone: "+1 (555) 123-4567",
      location: "Berlin, Germany",
      website: "alexmorgan.dev",
      summary:
        "Frontend engineer with 8+ years of experience building fast, accessible web applications. I lead design-system work, mentor engineers, and care deeply about the details that make products feel effortless.",
      photo: "",
    },
    experience: [
      {
        id: uid(),
        role: "Senior Frontend Engineer",
        company: "Northwind Labs",
        location: "Berlin",
        start: "2021",
        end: "",
        current: true,
        description:
          "- Led migration of a 200k-line React codebase to Next.js, cutting page load time by 45%\n- Built and maintained the company design system used by 6 product teams\n- Mentored 4 engineers; two were promoted to senior within a year",
      },
      {
        id: uid(),
        role: "Frontend Engineer",
        company: "Bright Analytics",
        location: "Amsterdam",
        start: "2018",
        end: "2021",
        current: false,
        description:
          "- Shipped a real-time dashboard used by 30k daily users\n- Introduced end-to-end testing, reducing production regressions by 60%\n- Collaborated closely with design to define interaction patterns",
      },
      {
        id: uid(),
        role: "Web Developer",
        company: "Studio Kite",
        location: "Remote",
        start: "2016",
        end: "2018",
        current: false,
        description:
          "- Delivered 20+ marketing sites and e-commerce storefronts for clients\n- Optimized Core Web Vitals across all client projects",
      },
    ],
    education: [
      {
        id: uid(),
        degree: "B.Sc. Computer Science",
        school: "University of Amsterdam",
        location: "Amsterdam",
        start: "2012",
        end: "2016",
        description: "Graduated with honors. Thesis on rendering performance in browser engines.",
      },
    ],
    skills: [
      { id: uid(), name: "React / Next.js", level: 5 },
      { id: uid(), name: "TypeScript", level: 5 },
      { id: uid(), name: "CSS / Tailwind", level: 5 },
      { id: uid(), name: "Node.js", level: 4 },
      { id: uid(), name: "GraphQL", level: 3 },
      { id: uid(), name: "Testing (Playwright, Vitest)", level: 4 },
    ],
    languages: [
      { id: uid(), name: "English", level: "Native" },
      { id: uid(), name: "German", level: "B2" },
      { id: uid(), name: "Dutch", level: "A2" },
    ],
    projects: [
      {
        id: uid(),
        name: "Prism UI",
        link: "github.com/alexmorgan/prism-ui",
        description: "Open-source component library with 2k+ GitHub stars, built with React and Radix.",
      },
      {
        id: uid(),
        name: "Tempo",
        link: "tempo.app",
        description: "A minimalist time-tracking app for freelancers. 5k monthly active users.",
      },
    ],
    links: [
      { id: uid(), label: "LinkedIn", url: "linkedin.com/in/alexmorgan" },
      { id: uid(), label: "GitHub", url: "github.com/alexmorgan" },
    ],
  };
}

export function newListItem(key: ListKey): CvData[ListKey][number] {
  switch (key) {
    case "experience":
      return {
        id: uid(),
        role: "",
        company: "",
        location: "",
        start: "",
        end: "",
        current: false,
        description: "",
      } satisfies ExperienceItem;
    case "education":
      return {
        id: uid(),
        degree: "",
        school: "",
        location: "",
        start: "",
        end: "",
        description: "",
      } satisfies EducationItem;
    case "skills":
      return { id: uid(), name: "", level: 3 } satisfies SkillItem;
    case "languages":
      return { id: uid(), name: "", level: "" } satisfies LanguageItem;
    case "projects":
      return { id: uid(), name: "", link: "", description: "" } satisfies ProjectItem;
    case "links":
      return { id: uid(), label: "", url: "" } satisfies LinkItem;
  }
}
