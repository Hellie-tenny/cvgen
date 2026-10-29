import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  Shared building blocks for the admin screens, so every admin page looks and behaves the same.

  Colour rules inside admin:
    - neutral dark  = the main action on a screen (Save, Publish, New article)
    - green         = Approve / Published
    - amber         = Pending / needs attention
    - red           = Delete / Reject / errors only
  Brand red is deliberately not used here, so it never reads as "danger" or "approve".
*/

// Passed to admin pages through <Outlet context={...} />
export interface AdminContext {
  pendingCount: number;
}

export const inputClass =
  "w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

type ButtonVariant = "primary" | "approve" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "sm";

const baseButton =
  "inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/85",
  approve: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "border border-border hover:bg-muted",
  danger: "border border-red-600/30 text-red-600 dark:text-red-400 hover:bg-red-600/10",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-4 py-2",
  sm: "px-2.5 py-1.5",
};

/** Class string for an admin button: <button className={btn("primary")}> */
export const btn = (variant: ButtonVariant = "secondary", size: ButtonSize = "md") =>
  cn(baseButton, variants[variant], sizes[size]);

/** Text colour for destructive text that stays readable in dark mode. */
export const dangerText = "text-red-600 dark:text-red-400";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** A labelled form field. The label wraps the control, so clicking the label focuses it. */
export function Field({
  label,
  aside,
  hint,
  className,
  children,
}: {
  label: string;
  aside?: ReactNode;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {aside}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const statusStyles = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
  published: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-600/10 text-red-700 dark:text-red-400",
  draft: "bg-muted text-muted-foreground",
} as const;

export function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={cn("shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize", statusStyles[status])}>
      {status}
    </span>
  );
}

/** Error or success message box. */
export function Notice({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border text-sm mb-4",
        tone === "error"
          ? "bg-destructive/10 border-destructive/30 text-red-700 dark:text-red-400"
          : "bg-emerald-600/10 border-emerald-600/30 text-emerald-800 dark:text-emerald-300"
      )}
    >
      {children}
    </div>
  );
}
