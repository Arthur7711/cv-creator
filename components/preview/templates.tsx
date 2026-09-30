import { dateRange, displayUrl, ensureProtocol } from "@/lib/format";
import {
  Description,
  EmptyPage,
  Row,
  SkillBar,
  SkillDots,
  hasContent,
  icons,
  readableOn,
  type TemplateProps,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Modern: colored sidebar + main column                               */
/* ------------------------------------------------------------------ */

function SideTitle({ children, color }: { children: string; color: string }) {
  return (
    <h3 className="mb-2 text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color, opacity: 0.85 }}>
      {children}
    </h3>
  );
}

function MainTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <h2
      className="mb-3 flex items-center gap-3 text-[11px] font-bold tracking-[0.16em] uppercase"
      style={{ color: accent }}
    >
      {children}
      <span className="h-px flex-1 bg-slate-200" />
    </h2>
  );
}

function ClassicTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <h2
      className="mb-3 border-b pb-1 text-[11.5px] font-bold tracking-[0.14em] uppercase"
      style={{ color: accent, borderColor: accent }}
    >
      {children}
    </h2>
  );
}

function MinimalBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[120px_1fr] gap-6 border-t border-slate-200 py-5">
      <h2 className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">{label}</h2>
      <div>{children}</div>
    </section>
  );
}

export function ModernTemplate({ data, settings }: TemplateProps) {
  if (!hasContent(data)) return <EmptyPage />;
  const { personal } = data;
  const accent = settings.accent;
  const onAccent = readableOn(accent);
  const sideMuted = onAccent === "#ffffff" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.15)";

  return (
    <div className="grid min-h-[297mm] grid-cols-[35%_1fr]">
      <aside className="flex flex-col gap-6 px-7 py-9" style={{ backgroundColor: accent, color: onAccent }}>
        {settings.showPhoto && personal.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img
            src={personal.photo}
            alt=""
            className="h-28 w-28 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 4px ${sideMuted}` }}
          />
        ) : null}
        <div>
          <h1 className="text-[24px] leading-[1.15] font-bold tracking-tight">{personal.fullName}</h1>
          {personal.title ? (
            <p className="mt-1.5 text-[12px] font-medium" style={{ opacity: 0.9 }}>
              {personal.title}
            </p>
          ) : null}
        </div>

        {personal.email || personal.phone || personal.location || personal.website ? (
          <div>
            <SideTitle color={onAccent}>Contact</SideTitle>
            <ul className="flex flex-col gap-1.5 text-[10.5px] leading-snug">
              {personal.email ? (
                <li className="flex items-start gap-2 break-all">
                  <span className="mt-[2px] shrink-0">{icons.mail}</span>
                  {personal.email}
                </li>
              ) : null}
              {personal.phone ? (
                <li className="flex items-start gap-2">
                  <span className="mt-[2px] shrink-0">{icons.phone}</span>
                  {personal.phone}
                </li>
              ) : null}
              {personal.location ? (
                <li className="flex items-start gap-2">
                  <span className="mt-[2px] shrink-0">{icons.pin}</span>
                  {personal.location}
                </li>
              ) : null}
              {personal.website ? (
                <li className="flex items-start gap-2 break-all">
                  <span className="mt-[2px] shrink-0">{icons.globe}</span>
                  <a href={ensureProtocol(personal.website)}>{displayUrl(personal.website)}</a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {data.links.length ? (
          <div>
            <SideTitle color={onAccent}>Links</SideTitle>
            <ul className="flex flex-col gap-1.5 text-[10.5px] leading-snug">
              {data.links.map((l) => (
                <li key={l.id} className="flex items-start gap-2 break-all">
                  <span className="mt-[2px] shrink-0">{icons.link}</span>
                  <span>
                    {l.label ? <span className="font-semibold">{l.label}: </span> : null}
                    <a href={ensureProtocol(l.url)}>{displayUrl(l.url)}</a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.skills.length ? (
          <div>
            <SideTitle color={onAccent}>Skills</SideTitle>
            <ul className="flex flex-col gap-2 text-[10.5px]">
              {data.skills.map((s) => (
                <li key={s.id} className="flex flex-col gap-1">
                  <span className="font-medium">{s.name}</span>
                  {settings.showSkillLevels ? <SkillBar level={s.level} color={onAccent} muted={sideMuted} /> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.languages.length ? (
          <div>
            <SideTitle color={onAccent}>Languages</SideTitle>
            <ul className="flex flex-col gap-1.5 text-[10.5px]">
              {data.languages.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span className="font-medium">{l.name}</span>
                  <span style={{ opacity: 0.8 }}>{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      <main className="flex flex-col gap-6 px-8 py-9 text-slate-700">
        {personal.summary ? (
          <section>
            <MainTitle accent={accent}>Profile</MainTitle>
            <p className="text-[11px] leading-relaxed">{personal.summary}</p>
          </section>
        ) : null}

        {data.experience.length ? (
          <section>
            <MainTitle accent={accent}>Experience</MainTitle>
            <div className="flex flex-col gap-4">
              {data.experience.map((e) => (
                <article key={e.id} className="cv-entry">
                  <Row>
                    <h3 className="text-[12.5px] font-bold text-slate-900">{e.role}</h3>
                    <span className="shrink-0 text-[10px] font-medium text-slate-500">
                      {dateRange(e.start, e.end, e.current)}
                    </span>
                  </Row>
                  <p className="text-[11px] font-medium" style={{ color: accent }}>
                    {[e.company, e.location].filter(Boolean).join(" · ")}
                  </p>
                  <Description text={e.description} className="mt-1.5 text-[11px] leading-relaxed" />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.education.length ? (
          <section>
            <MainTitle accent={accent}>Education</MainTitle>
            <div className="flex flex-col gap-3.5">
              {data.education.map((e) => (
                <article key={e.id} className="cv-entry">
                  <Row>
                    <h3 className="text-[12.5px] font-bold text-slate-900">{e.degree}</h3>
                    <span className="shrink-0 text-[10px] font-medium text-slate-500">{dateRange(e.start, e.end)}</span>
                  </Row>
                  <p className="text-[11px] font-medium" style={{ color: accent }}>
                    {[e.school, e.location].filter(Boolean).join(" · ")}
                  </p>
                  <Description text={e.description} className="mt-1 text-[11px] leading-relaxed" />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.projects.length ? (
          <section>
            <MainTitle accent={accent}>Projects</MainTitle>
            <div className="flex flex-col gap-3.5">
              {data.projects.map((p) => (
                <article key={p.id} className="cv-entry">
                  <Row>
                    <h3 className="text-[12.5px] font-bold text-slate-900">{p.name}</h3>
                    {p.link ? (
                      <a href={ensureProtocol(p.link)} className="shrink-0 text-[10px] font-medium" style={{ color: accent }}>
                        {displayUrl(p.link)}
                      </a>
                    ) : null}
                  </Row>
                  <Description text={p.description} className="mt-1 text-[11px] leading-relaxed" />
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Classic: centered header, single column                             */
/* ------------------------------------------------------------------ */

export function ClassicTemplate({ data, settings }: TemplateProps) {
  if (!hasContent(data)) return <EmptyPage />;
  const { personal } = data;
  const accent = settings.accent;

  const contact = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website ? displayUrl(personal.website) : "",
    ...data.links.map((l) => displayUrl(l.url)),
  ].filter(Boolean);

  return (
    <div className="flex min-h-[297mm] flex-col gap-6 px-12 py-11 text-slate-700">
      <header className="flex flex-col items-center gap-3 text-center">
        {settings.showPhoto && personal.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img src={personal.photo} alt="" className="h-24 w-24 rounded-full object-cover" style={{ boxShadow: `0 0 0 3px ${accent}` }} />
        ) : null}
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-slate-900">{personal.fullName}</h1>
          {personal.title ? (
            <p className="mt-1 text-[13px] font-medium" style={{ color: accent }}>
              {personal.title}
            </p>
          ) : null}
        </div>
        {contact.length ? (
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10.5px] text-slate-500">
            {contact.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 ? <span style={{ color: accent }}>•</span> : null}
                {c}
              </span>
            ))}
          </p>
        ) : null}
        <div className="h-[3px] w-full" style={{ backgroundColor: accent }} />
      </header>

      {personal.summary ? (
        <section>
          <ClassicTitle accent={accent}>Summary</ClassicTitle>
          <p className="text-[11px] leading-relaxed">{personal.summary}</p>
        </section>
      ) : null}

      {data.experience.length ? (
        <section>
          <ClassicTitle accent={accent}>Professional Experience</ClassicTitle>
          <div className="flex flex-col gap-4">
            {data.experience.map((e) => (
              <article key={e.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12.5px] font-bold text-slate-900">
                    {e.role}
                    {e.company ? <span className="font-normal text-slate-600"> — {e.company}</span> : null}
                  </h3>
                  <span className="shrink-0 text-[10px] font-medium text-slate-500">{dateRange(e.start, e.end, e.current)}</span>
                </Row>
                {e.location ? <p className="text-[10.5px] text-slate-500 italic">{e.location}</p> : null}
                <Description text={e.description} className="mt-1.5 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.education.length ? (
        <section>
          <ClassicTitle accent={accent}>Education</ClassicTitle>
          <div className="flex flex-col gap-3.5">
            {data.education.map((e) => (
              <article key={e.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12.5px] font-bold text-slate-900">
                    {e.degree}
                    {e.school ? <span className="font-normal text-slate-600"> — {e.school}</span> : null}
                  </h3>
                  <span className="shrink-0 text-[10px] font-medium text-slate-500">{dateRange(e.start, e.end)}</span>
                </Row>
                {e.location ? <p className="text-[10.5px] text-slate-500 italic">{e.location}</p> : null}
                <Description text={e.description} className="mt-1 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.projects.length ? (
        <section>
          <ClassicTitle accent={accent}>Projects</ClassicTitle>
          <div className="flex flex-col gap-3">
            {data.projects.map((p) => (
              <article key={p.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12.5px] font-bold text-slate-900">{p.name}</h3>
                  {p.link ? (
                    <a href={ensureProtocol(p.link)} className="shrink-0 text-[10px] text-slate-500">
                      {displayUrl(p.link)}
                    </a>
                  ) : null}
                </Row>
                <Description text={p.description} className="mt-1 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.skills.length || data.languages.length ? (
        <section className="grid grid-cols-2 gap-8">
          {data.skills.length ? (
            <div>
              <ClassicTitle accent={accent}>Skills</ClassicTitle>
              <ul className="flex flex-col gap-1.5 text-[11px]">
                {data.skills.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3">
                    <span>{s.name}</span>
                    {settings.showSkillLevels ? <SkillDots level={s.level} color={accent} muted="#e2e8f0" /> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.languages.length ? (
            <div>
              <ClassicTitle accent={accent}>Languages</ClassicTitle>
              <ul className="flex flex-col gap-1.5 text-[11px]">
                {data.languages.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span>{l.name}</span>
                    <span className="text-slate-500">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal: label column + content column                              */
/* ------------------------------------------------------------------ */

export function MinimalTemplate({ data, settings }: TemplateProps) {
  if (!hasContent(data)) return <EmptyPage />;
  const { personal } = data;
  const accent = settings.accent;

  const contact = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website ? displayUrl(personal.website) : "",
  ].filter(Boolean);

  return (
    <div className="flex min-h-[297mm] flex-col px-12 py-12 text-slate-700">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[32px] leading-none font-light tracking-tight text-slate-900">{personal.fullName}</h1>
          {personal.title ? (
            <p className="mt-2.5 text-[13px] font-medium" style={{ color: accent }}>
              {personal.title}
            </p>
          ) : null}
          {contact.length ? (
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-slate-500">
              {contact.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>
          ) : null}
          {data.links.length ? (
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px]">
              {data.links.map((l) => (
                <a key={l.id} href={ensureProtocol(l.url)} className="underline decoration-slate-300 underline-offset-2">
                  {l.label || displayUrl(l.url)}
                </a>
              ))}
            </p>
          ) : null}
        </div>
        {settings.showPhoto && personal.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img src={personal.photo} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
        ) : null}
      </header>

      {personal.summary ? (
        <MinimalBlock label="Profile">
          <p className="text-[11px] leading-relaxed">{personal.summary}</p>
        </MinimalBlock>
      ) : null}

      {data.experience.length ? (
        <MinimalBlock label="Experience">
          <div className="flex flex-col gap-4">
            {data.experience.map((e) => (
              <article key={e.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12px] font-semibold text-slate-900">{e.role}</h3>
                  <span className="shrink-0 text-[10px] text-slate-400 tabular-nums">{dateRange(e.start, e.end, e.current)}</span>
                </Row>
                <p className="text-[11px] text-slate-500">{[e.company, e.location].filter(Boolean).join(", ")}</p>
                <Description text={e.description} className="mt-1.5 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </MinimalBlock>
      ) : null}

      {data.education.length ? (
        <MinimalBlock label="Education">
          <div className="flex flex-col gap-3">
            {data.education.map((e) => (
              <article key={e.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12px] font-semibold text-slate-900">{e.degree}</h3>
                  <span className="shrink-0 text-[10px] text-slate-400 tabular-nums">{dateRange(e.start, e.end)}</span>
                </Row>
                <p className="text-[11px] text-slate-500">{[e.school, e.location].filter(Boolean).join(", ")}</p>
                <Description text={e.description} className="mt-1 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </MinimalBlock>
      ) : null}

      {data.projects.length ? (
        <MinimalBlock label="Projects">
          <div className="flex flex-col gap-3">
            {data.projects.map((p) => (
              <article key={p.id} className="cv-entry">
                <Row>
                  <h3 className="text-[12px] font-semibold text-slate-900">{p.name}</h3>
                  {p.link ? (
                    <a href={ensureProtocol(p.link)} className="shrink-0 text-[10px] text-slate-400">
                      {displayUrl(p.link)}
                    </a>
                  ) : null}
                </Row>
                <Description text={p.description} className="mt-1 text-[11px] leading-relaxed" />
              </article>
            ))}
          </div>
        </MinimalBlock>
      ) : null}

      {data.skills.length ? (
        <MinimalBlock label="Skills">
          <ul className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <li
                key={s.id}
                className="rounded-md border px-2 py-0.5 text-[10.5px]"
                style={{ borderColor: `${accent}55`, color: "#1e293b" }}
              >
                {s.name}
                {settings.showSkillLevels ? (
                  <span className="ml-1.5 text-[9px]" style={{ color: accent }}>
                    {"●".repeat(s.level)}
                    <span className="opacity-30">{"●".repeat(5 - s.level)}</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </MinimalBlock>
      ) : null}

      {data.languages.length ? (
        <MinimalBlock label="Languages">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
            {data.languages.map((l) => (
              <li key={l.id}>
                <span className="font-medium text-slate-900">{l.name}</span>
                {l.level ? <span className="text-slate-500"> · {l.level}</span> : null}
              </li>
            ))}
          </ul>
        </MinimalBlock>
      ) : null}
    </div>
  );
}
