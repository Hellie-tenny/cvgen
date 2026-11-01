import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_SECTION_TITLES, LIMITS, type SectionSetting } from "@/lib/template-design";
import { Field, inputClass } from "./admin-ui";

/* Form controls for the template editor. */

/** A titled card that groups related settings. */
export function ControlGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-background border border-border rounded-lg p-5">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Colour picker plus an editable #rrggbb code. */
export function ColorControl({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <Field label={label} hint={hint}>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
        />
        <input
          type="text"
          value={text}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value.toLowerCase());
          }}
          onBlur={() => setText(value)}
          className={cn(inputClass, "font-mono")}
        />
      </span>
    </Field>
  );
}

/** Slider with the current value shown. */
export function RangeControl({
  label,
  value,
  min,
  max,
  unit = "pt",
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field
      label={label}
      aside={
        <span className="text-xs tabular-nums text-muted-foreground">
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      }
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
    </Field>
  );
}

/** A small set of mutually exclusive choices shown as buttons. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 p-1 bg-muted/60 rounded-lg w-fit max-w-full">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors max-sm:min-h-10",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm cursor-pointer max-sm:min-h-10">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-foreground"
      />
      {label}
    </label>
  );
}

const smallIconButton =
  "flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none max-sm:h-9 max-sm:w-9";

/**
 * The CV's sections: reorder, show or hide, rename, and (sidebar layouts) choose the column.
 * Single column: one list; the contact details live in the header, so they are not in the list.
 * Sidebar layouts: two lists, one per column, each with its own order.
 */
export function SectionsControl({
  sections,
  sidebar,
  onChange,
}: {
  sections: SectionSetting[];
  sidebar: boolean;
  onChange: (sections: SectionSetting[]) => void;
}) {
  const update = (key: SectionSetting["key"], patch: Partial<SectionSetting>) =>
    onChange(sections.map((section) => (section.key === key ? { ...section, ...patch } : section)));

  // A section's neighbour is the next one in the same list (same column, or any non-contact section in single column).
  const sameList = (a: SectionSetting, b: SectionSetting) =>
    sidebar ? a.column === b.column : a.key !== "contact" && b.key !== "contact";

  const move = (key: SectionSetting["key"], direction: -1 | 1) => {
    const index = sections.findIndex((section) => section.key === key);
    let target = index + direction;
    while (target >= 0 && target < sections.length && !sameList(sections[index], sections[target])) target += direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const canMove = (section: SectionSetting, direction: -1 | 1) => {
    const index = sections.findIndex((s) => s.key === section.key);
    for (let i = index + direction; i >= 0 && i < sections.length; i += direction) {
      if (sameList(section, sections[i])) return true;
    }
    return false;
  };

  const lists: { name: string; rows: SectionSetting[]; column: SectionSetting["column"] }[] = sidebar
    ? [
        { name: "Sidebar", rows: sections.filter((s) => s.column === "sidebar"), column: "sidebar" },
        { name: "Main column", rows: sections.filter((s) => s.column === "main"), column: "main" },
      ]
    : [{ name: "Sections, top to bottom", rows: sections.filter((s) => s.key !== "contact"), column: "main" }];

  return (
    <div className="space-y-5">
      {lists.map((list) => (
        <div key={list.name} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{list.name}</p>
          {list.rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
          {list.rows.map((section) => (
            <div
              key={section.key}
              className={cn("flex items-center gap-1.5 rounded-md border border-border p-1.5", !section.visible && "opacity-60")}
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  className={smallIconButton}
                  onClick={() => move(section.key, -1)}
                  disabled={!canMove(section, -1)}
                  aria-label={`Move ${DEFAULT_SECTION_TITLES[section.key]} up`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={smallIconButton}
                  onClick={() => move(section.key, 1)}
                  disabled={!canMove(section, 1)}
                  aria-label={`Move ${DEFAULT_SECTION_TITLES[section.key]} down`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                value={section.title}
                maxLength={LIMITS.sectionTitle}
                placeholder={DEFAULT_SECTION_TITLES[section.key]}
                onChange={(e) => update(section.key, { title: e.target.value })}
                aria-label={`Heading for the ${DEFAULT_SECTION_TITLES[section.key]} section`}
                className={cn(inputClass, "min-w-0 flex-1")}
              />

              <button
                type="button"
                className={smallIconButton}
                onClick={() => update(section.key, { visible: !section.visible })}
                aria-label={`${section.visible ? "Hide" : "Show"} the ${DEFAULT_SECTION_TITLES[section.key]} section`}
                aria-pressed={section.visible}
                title={section.visible ? "Shown. Tap to hide" : "Hidden. Tap to show"}
              >
                {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              {sidebar && (
                <button
                  type="button"
                  className={smallIconButton}
                  onClick={() => update(section.key, { column: section.column === "sidebar" ? "main" : "sidebar" })}
                  aria-label={`Move ${DEFAULT_SECTION_TITLES[section.key]} to the ${section.column === "sidebar" ? "main column" : "sidebar"}`}
                  title={section.column === "sidebar" ? "Move to main column" : "Move to sidebar"}
                >
                  {section.column === "sidebar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
