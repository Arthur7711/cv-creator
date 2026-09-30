"use client";

import type { CvStore } from "@/lib/use-cv-store";
import type { ListKey } from "@/lib/cv-types";
import { Field, TextArea, inputClass } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { EmptyHint, ItemCard, Section } from "./section";

function AddButton({ store, listKey, label }: { store: CvStore; listKey: ListKey; label: string }) {
  return (
    <Button size="sm" icon={<Icon.Plus size={14} />} onClick={() => store.addItem(listKey)}>
      {label}
    </Button>
  );
}

const descriptionHint = "Start a line with “-” to make a bullet point.";

export function ExperienceSection({ store }: { store: CvStore }) {
  const items = store.data.experience;
  return (
    <Section
      title="Work experience"
      icon={<Icon.Briefcase size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="experience" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>No positions yet. Add your most recent role first.</EmptyHint>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              title={item.role || item.company}
              subtitle={item.role && item.company ? item.company : undefined}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              defaultOpen={!item.role && !item.company}
              onMoveUp={() => store.moveItem("experience", item.id, -1)}
              onMoveDown={() => store.moveItem("experience", item.id, 1)}
              onRemove={() => store.removeItem("experience", item.id)}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Job title"
                  placeholder="Product Designer"
                  value={item.role}
                  onChange={(e) => store.updateItem("experience", item.id, { role: e.target.value })}
                />
                <Field
                  label="Company"
                  placeholder="Acme Inc."
                  value={item.company}
                  onChange={(e) => store.updateItem("experience", item.id, { company: e.target.value })}
                />
                <Field
                  label="Location"
                  placeholder="Remote"
                  value={item.location}
                  onChange={(e) => store.updateItem("experience", item.id, { location: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Start"
                    placeholder="Jan 2021"
                    value={item.start}
                    onChange={(e) => store.updateItem("experience", item.id, { start: e.target.value })}
                  />
                  <Field
                    label="End"
                    placeholder="Dec 2023"
                    value={item.current ? "" : item.end}
                    disabled={item.current}
                    onChange={(e) => store.updateItem("experience", item.id, { end: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-[var(--accent)]"
                    checked={item.current}
                    onChange={(e) => store.updateItem("experience", item.id, { current: e.target.checked })}
                  />
                  I currently work here
                </label>
                <TextArea
                  className="sm:col-span-2"
                  label="Description"
                  rows={5}
                  hint={descriptionHint}
                  placeholder={"- Led a team of 5 engineers\n- Reduced build times by 40%"}
                  value={item.description}
                  onChange={(e) => store.updateItem("experience", item.id, { description: e.target.value })}
                />
              </div>
            </ItemCard>
          ))}
        </div>
      )}
    </Section>
  );
}

export function EducationSection({ store }: { store: CvStore }) {
  const items = store.data.education;
  return (
    <Section
      title="Education"
      icon={<Icon.GraduationCap size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="education" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>Add degrees, bootcamps, or certifications.</EmptyHint>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              title={item.degree || item.school}
              subtitle={item.degree && item.school ? item.school : undefined}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              defaultOpen={!item.degree && !item.school}
              onMoveUp={() => store.moveItem("education", item.id, -1)}
              onMoveDown={() => store.moveItem("education", item.id, 1)}
              onRemove={() => store.removeItem("education", item.id)}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Degree"
                  placeholder="B.Sc. Computer Science"
                  value={item.degree}
                  onChange={(e) => store.updateItem("education", item.id, { degree: e.target.value })}
                />
                <Field
                  label="School"
                  placeholder="University of Somewhere"
                  value={item.school}
                  onChange={(e) => store.updateItem("education", item.id, { school: e.target.value })}
                />
                <Field
                  label="Location"
                  placeholder="City"
                  value={item.location}
                  onChange={(e) => store.updateItem("education", item.id, { location: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Start"
                    placeholder="2016"
                    value={item.start}
                    onChange={(e) => store.updateItem("education", item.id, { start: e.target.value })}
                  />
                  <Field
                    label="End"
                    placeholder="2020"
                    value={item.end}
                    onChange={(e) => store.updateItem("education", item.id, { end: e.target.value })}
                  />
                </div>
                <TextArea
                  className="sm:col-span-2"
                  label="Details"
                  rows={3}
                  hint={descriptionHint}
                  placeholder="Honors, thesis, relevant coursework…"
                  value={item.description}
                  onChange={(e) => store.updateItem("education", item.id, { description: e.target.value })}
                />
              </div>
            </ItemCard>
          ))}
        </div>
      )}
    </Section>
  );
}

export function SkillsSection({ store }: { store: CvStore }) {
  const items = store.data.skills;
  return (
    <Section
      title="Skills"
      icon={<Icon.Zap size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="skills" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>List the tools and strengths you want to be known for.</EmptyHint>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="Skill, e.g. TypeScript"
                value={item.name}
                onChange={(e) => store.updateItem("skills", item.id, { name: e.target.value })}
              />
              <div className="flex shrink-0 items-center gap-1" role="radiogroup" aria-label="Skill level">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={item.level === level}
                    aria-label={`Level ${level}`}
                    title={`Level ${level} of 5`}
                    onClick={() => store.updateItem("skills", item.id, { level })}
                    className={`h-3.5 w-3.5 rounded-full transition ${
                      level <= item.level ? "bg-[var(--accent)]" : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <RowControls
                isFirst={i === 0}
                isLast={i === items.length - 1}
                onMoveUp={() => store.moveItem("skills", item.id, -1)}
                onMoveDown={() => store.moveItem("skills", item.id, 1)}
                onRemove={() => store.removeItem("skills", item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function LanguagesSection({ store }: { store: CvStore }) {
  const items = store.data.languages;
  return (
    <Section
      title="Languages"
      icon={<Icon.Globe size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="languages" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>Add languages and your proficiency (e.g. Native, C1, Conversational).</EmptyHint>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="Language"
                value={item.name}
                onChange={(e) => store.updateItem("languages", item.id, { name: e.target.value })}
              />
              <input
                className={`${inputClass} max-w-40`}
                placeholder="Level"
                value={item.level}
                onChange={(e) => store.updateItem("languages", item.id, { level: e.target.value })}
              />
              <RowControls
                isFirst={i === 0}
                isLast={i === items.length - 1}
                onMoveUp={() => store.moveItem("languages", item.id, -1)}
                onMoveDown={() => store.moveItem("languages", item.id, 1)}
                onRemove={() => store.removeItem("languages", item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function ProjectsSection({ store }: { store: CvStore }) {
  const items = store.data.projects;
  return (
    <Section
      title="Projects"
      icon={<Icon.Folder size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="projects" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>Side projects, open source, or notable client work.</EmptyHint>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              title={item.name}
              subtitle={item.link || undefined}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              defaultOpen={!item.name}
              onMoveUp={() => store.moveItem("projects", item.id, -1)}
              onMoveDown={() => store.moveItem("projects", item.id, 1)}
              onRemove={() => store.removeItem("projects", item.id)}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Project name"
                  placeholder="My Project"
                  value={item.name}
                  onChange={(e) => store.updateItem("projects", item.id, { name: e.target.value })}
                />
                <Field
                  label="Link"
                  placeholder="github.com/you/project"
                  value={item.link}
                  onChange={(e) => store.updateItem("projects", item.id, { link: e.target.value })}
                />
                <TextArea
                  className="sm:col-span-2"
                  label="Description"
                  rows={3}
                  hint={descriptionHint}
                  placeholder="What it does, what you built, and the impact."
                  value={item.description}
                  onChange={(e) => store.updateItem("projects", item.id, { description: e.target.value })}
                />
              </div>
            </ItemCard>
          ))}
        </div>
      )}
    </Section>
  );
}

export function LinksSection({ store }: { store: CvStore }) {
  const items = store.data.links;
  return (
    <Section
      title="Links"
      icon={<Icon.Link size={16} />}
      count={items.length}
      action={<AddButton store={store} listKey="links" label="Add" />}
    >
      {items.length === 0 ? (
        <EmptyHint>LinkedIn, GitHub, portfolio, Dribbble…</EmptyHint>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                className={`${inputClass} max-w-36`}
                placeholder="Label"
                value={item.label}
                onChange={(e) => store.updateItem("links", item.id, { label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="linkedin.com/in/you"
                value={item.url}
                onChange={(e) => store.updateItem("links", item.id, { url: e.target.value })}
              />
              <RowControls
                isFirst={i === 0}
                isLast={i === items.length - 1}
                onMoveUp={() => store.moveItem("links", item.id, -1)}
                onMoveDown={() => store.moveItem("links", item.id, 1)}
                onRemove={() => store.removeItem("links", item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function RowControls({
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        aria-label="Move up"
        title="Move up"
        disabled={isFirst}
        onClick={onMoveUp}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Icon.ArrowUp size={14} />
      </button>
      <button
        type="button"
        aria-label="Move down"
        title="Move down"
        disabled={isLast}
        onClick={onMoveDown}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Icon.ArrowDown size={14} />
      </button>
      <button
        type="button"
        aria-label="Remove"
        title="Remove"
        onClick={onRemove}
        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
      >
        <Icon.Trash size={14} />
      </button>
    </div>
  );
}
