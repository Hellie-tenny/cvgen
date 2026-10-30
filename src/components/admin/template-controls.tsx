import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
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
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field
      label={label}
      aside={
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}
          {unit}
        </span>
      }
    >
      <input
        type="range"
        min={min}
        max={max}
        step={1}
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
