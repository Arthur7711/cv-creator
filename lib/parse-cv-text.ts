import type { ExtractedCv } from "./cv-schema";

/**
 * Heuristic CV parser used when AI extraction is unavailable.
 * It works from plain text pulled out of a PDF, so it relies on common
 * résumé conventions: section headings, date ranges, bullet points.
 */

type SectionKey =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "links"
  | "contact"
  | "other";

// Whitespace is optional inside headings because letter-spaced headings
// ("P R O F E S S I O N A L  E X P E R I E N C E") collapse to a single word.
const SECTION_PATTERNS: [SectionKey, RegExp][] = [
  ["summary", /^(professional\s*|career\s*|personal\s*)?(summary|profile|about(\s*me)?|objective|overview|bio)$/i],
  ["experience", /^((work|professional|employment|relevant)\s*)?(experience|history)$|^(career|employment|work)$/i],
  ["education", /^(education(\s*and\s*training)?|academic\s*background|academics|qualifications)$/i],
  ["skills", /^((technical|core|key|professional|hard|soft)\s*)?(skills|competencies|competences|technologies|expertise|tech\s*stack|tools)(\s*&\s*\w+)?$/i],
  ["languages", /^languages?(\s*skills)?$/i],
  ["projects", /^((personal|side|key|selected|notable|open[\s-]?source)\s*)?projects$/i],
  ["links", /^(links|social|profiles|online|find\s*me\s*online|websites?)$/i],
  ["contact", /^(contact(\s*(details|information|info))?|get\s*in\s*touch)$/i],
  ["other", /^(certifications?|certificates?|awards?|honou?rs|interests|hobbies|references|publications|volunteering|volunteer\s*work|activities|courses|training)$/i],
];

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const YEAR = "(?:19|20)\\d{2}";
const DATE = `(?:${MONTH}\\s+${YEAR}|\\d{1,2}[./]${YEAR}|${YEAR})`;
const END = `(?:${DATE}|present|current|now|today|ongoing)`;
const RANGE_RE = new RegExp(`(${DATE})\\s*(?:-|–|—|to|until|till)\\s*(${END})`, "i");
const SINGLE_DATE_RE = new RegExp(`\\b${DATE}\\b`, "i");
const CURRENT_RE = /present|current|now|today|ongoing/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/i;
const PHONE_RE = /(?:\(?\+\d{1,3}\)?[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?/;
const TLDS =
  "com|net|org|io|dev|me|co|app|xyz|info|ai|design|tech|site|online|page|studio|edu|gov|biz|pro|name|blog|link|space|works|codes|ly|gg|sh|to|tv|cc|de|uk|fr|nl|eu|us|ca|au|in|ru|am|es|it|pl|se|no|dk|fi|ch|at|be|pt|br|cz|ie|jp|kr|cn|ua|ge|kz|tr|il|za|mx|ar|cl|nz|sg|hk|tw|id|my|ph|vn|th|hu|ro|bg|gr|rs|hr|si|sk|lt|lv|ee|by|md";
const URL_SOURCE = `(?:https?:\\/\\/)?(?:www\\.)?[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})\\b(?:\\/[^\\s,;|)]*)?`;
const URL_RE = new RegExp(URL_SOURCE, "i");
const URL_RE_G = new RegExp(URL_SOURCE, "gi");
const GLYPHS_RE = /[●○◐◑◒◓■□▪▫★☆✓✔]+/g;
const BULLET_RE = /^[-•·▪◦●○*‣]\s*/;
const TITLE_WORDS =
  /\b(engineer|developer|designer|manager|director|lead|architect|analyst|consultant|specialist|scientist|administrator|intern|associate|officer|head|founder|cto|ceo|coo|vp|president|coordinator|assistant|teacher|nurse|accountant|marketer|writer|editor|product|researcher|technician|freelancer)\b/i;
const DEGREE_RE = /\b(b\.?\s?sc|m\.?\s?sc|b\.?\s?a|m\.?\s?a|b\.?\s?eng|m\.?\s?eng|bachelor|master|ph\.?\s?d|doctor|mba|diploma|associate|certificate|degree|bsc|msc|beng|meng|llb|llm|md)\b/i;
const SCHOOL_RE = /\b(university|college|school|institute|academy|polytechnic|faculty|conservatory)\b/i;
const LANG_LEVELS =
  "native|mother\\s+tongue|bilingual|fluent|proficient|advanced|upper[\\s-]intermediate|intermediate|conversational|basic|beginner|elementary|limited|full\\s+professional(?:\\s+proficiency)?|professional(?:\\s+working)?(?:\\s+proficiency)?|working\\s+knowledge|c[12]|b[12]|a[12]";
const LANG_LEVEL_RE = new RegExp(`\\b(?:${LANG_LEVELS})\\b`, "i");
const LANG_LEVEL_SPLIT_RE = new RegExp(`\\b(${LANG_LEVELS})\\b`, "gi");
const SOCIAL_HOSTS: [RegExp, string][] = [
  [/linkedin\.com/i, "LinkedIn"],
  [/github\.com/i, "GitHub"],
  [/gitlab\.com/i, "GitLab"],
  [/twitter\.com|x\.com/i, "Twitter"],
  [/dribbble\.com/i, "Dribbble"],
  [/behance\.net/i, "Behance"],
  [/medium\.com/i, "Medium"],
  [/stackoverflow\.com/i, "Stack Overflow"],
  [/youtube\.com/i, "YouTube"],
  [/instagram\.com/i, "Instagram"],
];

/** "C O N TA C T" (letter-spaced headings) -> "CONTACT". */
function collapseLetterSpacing(line: string): string {
  const tokens = line.split(" ");
  if (tokens.length < 4) return line;
  const singles = tokens.filter((t) => t.length === 1).length;
  if (singles / tokens.length < 0.6 || tokens.some((t) => t.length > 2)) return line;
  return tokens.join("");
}

function normalizeLine(line: string): string {
  const cleaned = line
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*[|]\s*/g, " | ")
    .trim();
  return cleaned
    .split(" | ")
    .map(collapseLetterSpacing)
    .join(" | ");
}

/** Exposed so the PDF text extractor can recognise label columns. */
export function isSectionHeading(line: string): boolean {
  return detectSection(normalizeLine(line)) !== null;
}

function stripBullet(line: string): string {
  return line.replace(BULLET_RE, "").trim();
}

function isBullet(line: string): boolean {
  return BULLET_RE.test(line);
}

function detectSection(line: string): SectionKey | null {
  const candidate = line.replace(/[:\-–—_]+$/, "").replace(/^[#\d.\s]+/, "").trim();
  if (!candidate || candidate.length > 40) return null;
  for (const [key, re] of SECTION_PATTERNS) {
    if (re.test(candidate)) return key;
  }
  return null;
}

type Section = { key: SectionKey; lines: string[] };

function splitSections(lines: string[]): Section[] {
  const sections: Section[] = [{ key: "header", lines: [] }];
  // Two headings side by side ("SKILLS | LANGUAGES") open two sections; the
  // lines that follow are split at their first " | " between the two.
  let dual: Section | null = null;
  for (const line of lines) {
    const key = detectSection(line);
    if (key) {
      sections.push({ key, lines: [] });
      dual = null;
      continue;
    }
    const pieces = line.split(" | ");
    if (pieces.length === 2) {
      const [a, b] = pieces.map(detectSection);
      if (a && b) {
        sections.push({ key: a, lines: [] });
        dual = { key: b, lines: [] };
        sections.push(dual);
        continue;
      }
    }
    if (dual && pieces.length >= 2) {
      sections[sections.length - 2].lines.push(pieces[0]);
      dual.lines.push(pieces.slice(1).join(" | "));
      continue;
    }
    if (dual) {
      sections[sections.length - 2].lines.push(line);
      continue;
    }
    sections[sections.length - 1].lines.push(line);
  }
  return sections;
}

function sectionText(sections: Section[], key: SectionKey): string[] {
  return sections.filter((s) => s.key === key).flatMap((s) => s.lines);
}

function looksLikeLocation(line: string): boolean {
  if (line.length > 50 || /\d|@|http|www/.test(line)) return false;
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) return false;
  return parts.every((p) => /^[A-Za-zÀ-ÿ.'\s-]{2,}$/.test(p) && p.split(" ").length <= 3);
}

/** One or two capitalised words such as "Berlin" or "New York". */
function looksLikePlaceName(part: string): boolean {
  return /^(?:remote|[A-ZÀ-Ý][a-zà-ÿ]+(?:\s[A-ZÀ-Ý][a-zà-ÿ]+)?)$/.test(part) && !TITLE_WORDS.test(part);
}

function looksLikeName(line: string): boolean {
  if (line.length > 40 || /\d|@|http|www|\||,/.test(line)) return false;
  const words = line.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 4) return false;
  if (TITLE_WORDS.test(line)) return false;
  return words.every((w) => /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'-]*$/.test(w));
}

function toTitleCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s'-])([a-zà-ÿ])/g, (m) => m.toUpperCase());
}

function splitParts(text: string): string[] {
  return text
    .split(/\s*(?:\||•|·|–|—|,|\bat\b|\s-\s)\s*/i)
    .map((p) => p.replace(/^[\s,|•·–—-]+|[\s,|•·–—-]+$/g, "").trim())
    .filter((p) => p.length > 1);
}

/** Short, title-like line that could be part of an entry header (role, company, place). */
function isHeaderCandidate(line: string, maxWords = 7): boolean {
  if (isBullet(line) || line.length > 70 || /[.!?;:]$/.test(line) || RANGE_RE.test(line)) return false;
  if (/%|\d{2,}/.test(line)) return false;
  return line.split(/\s+/).length <= maxWords;
}

function isPlaceLine(line: string): boolean {
  return looksLikeLocation(line) || looksLikePlaceName(line);
}

/**
 * Turn description lines into bullet points. PDF bullet glyphs are often lost,
 * so a line starting with a capital letter starts a new point and a line
 * starting in lowercase continues the previous one (a wrapped line).
 */
function joinDescription(lines: string[]): string {
  const items: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const continues = items.length > 0 && !isBullet(line) && /^[a-zà-ÿ(]/.test(line);
    if (continues) items[items.length - 1] += ` ${line}`;
    else items.push(stripBullet(line));
  }
  if (items.length <= 1) return items[0] ?? "";
  return items.map((i) => `- ${i}`).join("\n");
}

type Entry = { header: string[]; body: string[]; dateLine: string };

/** Group a section's lines into entries anchored on date ranges. */
function groupEntries(lines: string[]): Entry[] {
  const dateIdx = lines.map((l, i) => (RANGE_RE.test(l) || (SINGLE_DATE_RE.test(l) && l.length < 40) ? i : -1)).filter((i) => i >= 0);
  if (dateIdx.length === 0) {
    // No dates: fall back to blank-line-free grouping by short title lines.
    const entries: Entry[] = [];
    for (const line of lines) {
      const short = !isBullet(line) && line.length <= 60 && !/[.!?]$/.test(line);
      if (short || entries.length === 0) entries.push({ header: [line], body: [], dateLine: "" });
      else entries[entries.length - 1].body.push(line);
    }
    return entries;
  }

  const starts: number[] = [];
  let prevEnd = -1;
  for (const d of dateIdx) {
    let start = d;
    let pulled = 0;
    // Lines above the date line are pulled in only when they are very short
    // (a bare role, company or place), so trailing bullets of the previous
    // entry are not mistaken for a header.
    while (start - 1 > prevEnd && pulled < 2) {
      if (!isHeaderCandidate(lines[start - 1], 5)) break;
      start--;
      pulled++;
    }
    starts.push(start);
    prevEnd = d;
  }

  const entries: Entry[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : lines.length;
    const d = dateIdx[i];
    const header = lines.slice(start, d + 1);
    let bodyStart = d + 1;
    // If the date line stood alone, pull up to two short title lines after it;
    // a place line ("Madrid, Spain") directly below is always part of the header.
    while (bodyStart < end && header.length < 3) {
      const candidate = lines[bodyStart];
      const take = header.length === 1 ? isHeaderCandidate(candidate) : isPlaceLine(candidate);
      if (!take) break;
      header.push(candidate);
      bodyStart++;
    }
    entries.push({ header, body: lines.slice(bodyStart, end), dateLine: lines[d] });
  }
  return entries;
}

function parseDates(entry: Entry): { start: string; end: string; current: boolean } {
  const m = entry.dateLine.match(RANGE_RE);
  if (m) {
    const current = CURRENT_RE.test(m[2]);
    return { start: m[1], end: current ? "" : m[2], current };
  }
  const single = entry.dateLine.match(SINGLE_DATE_RE);
  return { start: single ? single[0] : "", end: "", current: false };
}

function headerParts(entry: Entry): string[] {
  const text = entry.header
    .map((l) => l.replace(RANGE_RE, "").replace(SINGLE_DATE_RE, ""))
    .join(" | ");
  return splitParts(text).filter((p) => !/^(present|current|now)$/i.test(p));
}

function parseExperience(lines: string[]): ExtractedCv["experience"] {
  return groupEntries(lines)
    .map((entry) => {
      const parts = headerParts(entry);
      const dates = parseDates(entry);
      const roleIdx = parts.findIndex((p) => TITLE_WORDS.test(p));
      const role = roleIdx >= 0 ? parts[roleIdx] : parts[0] ?? "";
      const rest = parts.filter((_, i) => i !== (roleIdx >= 0 ? roleIdx : 0));
      const locIdx = rest.findIndex((p) => looksLikeLocation(p) || /^remote$/i.test(p));
      const location = locIdx >= 0 ? rest[locIdx] : rest.length > 1 ? rest[1] : "";
      const company = rest.find((p, i) => i !== locIdx) ?? "";
      return { role, company, location, ...dates, description: joinDescription(entry.body) };
    })
    .filter((e) => e.role || e.company);
}

function parseEducation(lines: string[]): ExtractedCv["education"] {
  return groupEntries(lines)
    .map((entry) => {
      const parts = headerParts(entry);
      const dates = parseDates(entry);
      const degreeIdx = parts.findIndex((p) => DEGREE_RE.test(p));
      const schoolIdx = parts.findIndex((p, i) => i !== degreeIdx && SCHOOL_RE.test(p));
      const degree = degreeIdx >= 0 ? parts[degreeIdx] : parts[0] ?? "";
      const usedDegree = degreeIdx >= 0 ? degreeIdx : 0;
      const usedSchool = schoolIdx >= 0 ? schoolIdx : parts.findIndex((_, i) => i !== usedDegree);
      const school = usedSchool >= 0 ? parts[usedSchool] : "";
      const location =
        parts.find((p, i) => i !== usedDegree && i !== usedSchool && (looksLikeLocation(p) || looksLikePlaceName(p))) ??
        "";
      return { degree, school, location, start: dates.start, end: dates.end, description: joinDescription(entry.body) };
    })
    .filter((e) => e.degree || e.school);
}

function parseSkills(lines: string[]): ExtractedCv["skills"] {
  const LEVEL_WORDS: [RegExp, number][] = [
    [/expert|advanced|proficient/i, 5],
    [/intermediate|good|solid/i, 3],
    [/basic|familiar|beginner|learning/i, 2],
  ];
  const levelSuffix = /\s*[(\-–:]\s*(expert|advanced|proficient|intermediate|good|solid|basic|familiar|beginner|learning|\d+\+?\s*(?:yrs?|years?))\)?\s*$/i;
  const tokens = lines
    .map(stripBullet)
    .map((l) => l.replace(GLYPHS_RE, " "))
    .map((l) => l.replace(/^[^:]{2,30}:\s*/, "")) // drop "Languages: " style category prefixes
    .flatMap((l) => l.split(/\s*(?:[•·|;]|,(?![^()]*\)))\s*|\s{2,}/))
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && t.length <= 40 && !/[.!?]$/.test(t) && /[a-z0-9]/i.test(t));
  const seen = new Set<string>();
  const skills: ExtractedCv["skills"] = [];
  for (const t of tokens) {
    const suffix = t.match(levelSuffix)?.[1] ?? "";
    const name = t.replace(levelSuffix, "").trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    const years = suffix.match(/\d+/);
    const level = years
      ? Math.min(5, Math.max(1, Math.ceil(Number(years[0]) / 2)))
      : LEVEL_WORDS.find(([re]) => re.test(suffix))?.[1] ?? 3;
    skills.push({ name, level });
    if (skills.length >= 30) break;
  }
  return skills;
}

function cleanLanguageName(s: string): string {
  return s
    .replace(/[()\-–:|,;•·]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLanguages(lines: string[]): ExtractedCv["languages"] {
  const result: ExtractedCv["languages"] = [];
  for (const raw of lines) {
    const line = stripBullet(raw).replace(GLYPHS_RE, " ");
    if (!LANG_LEVEL_RE.test(line)) {
      // No proficiency words: each separated token is a language.
      for (const token of line.split(/\s*[,•·;|]\s*/)) {
        const name = cleanLanguageName(token);
        if (name) result.push({ name, level: "" });
      }
      continue;
    }
    // "English · Native German · B2 Dutch · A2" -> pairs of (name, level).
    const parts = line.split(LANG_LEVEL_SPLIT_RE);
    for (let i = 0; i < parts.length; i += 2) {
      const name = cleanLanguageName(parts[i]);
      const level = parts[i + 1] ? toTitleCase(parts[i + 1]) : "";
      if (name) result.push({ name, level });
      else if (level && result.length) result[result.length - 1].level ||= level;
    }
  }
  return result.filter((l) => l.name.length > 1 && l.name.length <= 30);
}

function parseProjects(lines: string[]): ExtractedCv["projects"] {
  const projects: ExtractedCv["projects"] = [];
  for (const line of lines) {
    const short = !isBullet(line) && line.length <= 70 && !/[.!?]$/.test(line);
    if (short || projects.length === 0) {
      const url = line.match(URL_RE)?.[0] ?? "";
      const name = line
        .replace(URL_RE, "")
        .replace(RANGE_RE, "")
        .replace(/^[\s|•·–—-]+|[\s|•·–—-]+$/g, "")
        .trim();
      projects.push({ name: name || url, link: url, description: "" });
    } else {
      const p = projects[projects.length - 1];
      p.description = joinDescription([p.description, line].filter(Boolean));
      if (!p.link) p.link = line.match(URL_RE)?.[0] ?? "";
    }
  }
  return projects.filter((p) => p.name);
}

export function parseCvText(raw: string, extraUrls: string[] = []): ExtractedCv {
  const lines = raw
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const sections = splitSections(lines);
  const header = sectionText(sections, "header");
  const contactLines = [...header, ...sectionText(sections, "contact"), ...sectionText(sections, "links")];
  const fullText = lines.join("\n");

  // Contact details
  const email = fullText.match(EMAIL_RE)?.[0] ?? "";
  const phone =
    contactLines
      .filter((l) => !RANGE_RE.test(l))
      .map((l) => l.replace(EMAIL_RE, "").match(PHONE_RE)?.[0]?.trim() ?? "")
      .find((p) => p.replace(/\D/g, "").length >= 8) ?? "";

  // Link annotations are only useful when their URL is not already visible as
  // text somewhere (e.g. a project link), otherwise they would be duplicated.
  const hiddenUrls = extraUrls.filter((u) => {
    const bare = u.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
    const escaped = bare.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    return !new RegExp(`${escaped}(?![\\w/.-])`, "i").test(fullText);
  });
  const urlSource = [...contactLines, ...hiddenUrls].join("\n").replace(new RegExp(EMAIL_RE.source, "gi"), " ");
  const urls = Array.from(
    new Set(
      Array.from(urlSource.matchAll(URL_RE_G), (m) => m[0])
        .filter((u) => !/^mailto:/i.test(u))
        .map((u) => u.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/[.,;)/]+$/, "")),
    ),
  );
  const links: ExtractedCv["links"] = [];
  let website = "";
  for (const url of urls) {
    const social = SOCIAL_HOSTS.find(([re]) => re.test(url));
    if (social) links.push({ label: social[1], url });
    else if (!website) website = url;
  }

  // Name, title, location from the top of the document
  const topLines = header.slice(0, 10);
  const nameLine = topLines.find(looksLikeName) ?? "";
  const fullName = toTitleCase(nameLine);
  const cityCountry = /\b([A-ZÀ-Ý][a-zà-ÿ]+(?:\s[A-ZÀ-Ý][a-zà-ÿ]+)?),\s([A-ZÀ-Ý][a-zà-ÿ]+(?:\s[A-ZÀ-Ý][a-zà-ÿ]+)?)\b/;
  const location =
    contactLines.find(looksLikeLocation) ??
    contactLines
      .flatMap((l) => l.split(/\s*[•·|–—]\s*/))
      .map((s) => s.trim())
      .find(looksLikeLocation) ??
    contactLines.map((l) => l.replace(EMAIL_RE, "").match(cityCountry)?.[0] ?? "").find(Boolean) ??
    "";
  const title =
    topLines.find((l) => l !== nameLine && TITLE_WORDS.test(l) && l.length <= 60 && !EMAIL_RE.test(l)) ??
    topLines.find(
      (l) =>
        l !== nameLine &&
        l.length <= 60 &&
        !EMAIL_RE.test(l) &&
        !PHONE_RE.test(l) &&
        !URL_RE.test(l) &&
        !looksLikeLocation(l) &&
        !looksLikeName(l),
    ) ??
    "";

  const summaryLines = sectionText(sections, "summary");
  const summary =
    summaryLines.length > 0
      ? summaryLines.map(stripBullet).join(" ")
      : header
          .filter((l) => l.length > 60 && !EMAIL_RE.test(l))
          .join(" ");

  return {
    personal: { fullName, title, email, phone, location, website, summary },
    experience: parseExperience(sectionText(sections, "experience")),
    education: parseEducation(sectionText(sections, "education")),
    skills: parseSkills(sectionText(sections, "skills")),
    languages: parseLanguages(sectionText(sections, "languages")),
    projects: parseProjects(sectionText(sections, "projects")),
    links,
  };
}
