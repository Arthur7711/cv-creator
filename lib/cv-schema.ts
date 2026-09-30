import { z } from "zod";
import { type CvData, emptyData, uid } from "./cv-types";

/**
 * Shape of a CV as extracted from an uploaded document.
 * It mirrors CvData without the per-item ids, which are added on import.
 */
export const ExtractedCvSchema = z.object({
  personal: z.object({
    fullName: z.string().describe("The candidate's full name"),
    title: z.string().describe("Current job title or headline, e.g. 'Senior Frontend Engineer'"),
    email: z.string(),
    phone: z.string(),
    location: z.string().describe("City and country, e.g. 'Berlin, Germany'"),
    website: z.string().describe("Personal website or portfolio URL, without the protocol"),
    summary: z.string().describe("Professional summary or profile paragraph, verbatim from the CV"),
  }),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string().describe("Start date as written, e.g. 'Jan 2021' or '2021'"),
      end: z.string().describe("End date as written; empty if current"),
      current: z.boolean(),
      description: z
        .string()
        .describe("Responsibilities and achievements. Put each bullet point on its own line prefixed with '- '"),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string().describe("Degree and field, e.g. 'B.Sc. Computer Science'"),
      school: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      description: z.string().describe("Honors, thesis, coursework; bullets prefixed with '- '"),
    }),
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z
        .number()
        .int()
        .min(1)
        .max(5)
        .describe("Proficiency 1-5. Use 3 when the CV gives no indication"),
    }),
  ),
  languages: z.array(
    z.object({
      name: z.string(),
      level: z.string().describe("Proficiency as written, e.g. 'Native', 'C1', 'Fluent'"),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      link: z.string(),
      description: z.string(),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string().describe("e.g. 'LinkedIn', 'GitHub', 'Portfolio'"),
      url: z.string(),
    }),
  ),
});

export type ExtractedCv = z.infer<typeof ExtractedCvSchema>;

const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

/** Convert extracted content into app data, adding ids and dropping empty rows. */
export function toCvData(extracted: ExtractedCv): CvData {
  const base = emptyData();
  return {
    personal: {
      ...base.personal,
      fullName: clean(extracted.personal.fullName),
      title: clean(extracted.personal.title),
      email: clean(extracted.personal.email),
      phone: clean(extracted.personal.phone),
      location: clean(extracted.personal.location),
      website: clean(extracted.personal.website),
      summary: clean(extracted.personal.summary),
    },
    experience: extracted.experience
      .filter((e) => clean(e.role) || clean(e.company))
      .map((e) => ({
        id: uid(),
        role: clean(e.role),
        company: clean(e.company),
        location: clean(e.location),
        start: clean(e.start),
        end: e.current ? "" : clean(e.end),
        current: Boolean(e.current),
        description: clean(e.description),
      })),
    education: extracted.education
      .filter((e) => clean(e.degree) || clean(e.school))
      .map((e) => ({
        id: uid(),
        degree: clean(e.degree),
        school: clean(e.school),
        location: clean(e.location),
        start: clean(e.start),
        end: clean(e.end),
        description: clean(e.description),
      })),
    skills: extracted.skills
      .filter((s) => clean(s.name))
      .map((s) => ({
        id: uid(),
        name: clean(s.name),
        level: Math.min(5, Math.max(1, Math.round(Number(s.level) || 3))),
      })),
    languages: extracted.languages
      .filter((l) => clean(l.name))
      .map((l) => ({ id: uid(), name: clean(l.name), level: clean(l.level) })),
    projects: extracted.projects
      .filter((p) => clean(p.name))
      .map((p) => ({ id: uid(), name: clean(p.name), link: clean(p.link), description: clean(p.description) })),
    links: extracted.links
      .filter((l) => clean(l.url))
      .map((l) => ({ id: uid(), label: clean(l.label), url: clean(l.url) })),
  };
}
