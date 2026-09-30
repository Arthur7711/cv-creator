"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";

type SectionProps = {
  title: string;
  icon: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ title, icon, count, defaultOpen = false, action, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            {icon}
          </span>
          <span className="truncate text-sm font-semibold text-slate-800">{title}</span>
          {typeof count === "number" && count > 0 ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {count}
            </span>
          ) : null}
          <Icon.ChevronDown
            size={16}
            className={`ml-auto shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {action}
      </header>
      {open ? <div className="border-t border-slate-100 px-4 py-4">{children}</div> : null}
    </section>
  );
}

type ItemCardProps = {
  title: string;
  subtitle?: string;
  isFirst: boolean;
  isLast: boolean;
  defaultOpen?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
};

export function ItemCard({
  title,
  subtitle,
  isFirst,
  isLast,
  defaultOpen = false,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: ItemCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60">
      <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
        >
          <Icon.ChevronDown
            size={14}
            className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : "-rotate-90"}`}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800">{title || "Untitled"}</span>
            {subtitle ? <span className="block truncate text-xs text-slate-500">{subtitle}</span> : null}
          </span>
        </button>
        <IconButton label="Move up" onClick={onMoveUp} disabled={isFirst}>
          <Icon.ArrowUp size={15} />
        </IconButton>
        <IconButton label="Move down" onClick={onMoveDown} disabled={isLast}>
          <Icon.ArrowDown size={15} />
        </IconButton>
        <IconButton label="Remove" variant="danger" onClick={onRemove}>
          <Icon.Trash size={15} />
        </IconButton>
      </div>
      {open ? <div className="border-t border-slate-200/70 px-3 pt-3 pb-3">{children}</div> : null}
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
      {children}
    </p>
  );
}
