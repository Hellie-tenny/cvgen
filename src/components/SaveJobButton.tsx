import { Bookmark } from "lucide-react";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { cancelReminders, scheduleReminder, type ReminderJob } from "@/utils/deadline-reminders";

interface SaveJobButtonProps {
  jobId: string;
  /** "icon" = compact bookmark (for list cards); "full" = labelled button (for the detail page) */
  variant?: "icon" | "full";
  /** Listing details, used to schedule a closing-date reminder in the Android app. */
  job?: ReminderJob;
}

export function SaveJobButton({ jobId, variant = "icon", job }: SaveJobButtonProps) {
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(jobId);
  const label = saved ? "Remove from saved jobs" : "Save job";

  const handleClick = (e: React.MouseEvent) => {
    // On list cards this button sits inside a <Link>; don't navigate.
    e.preventDefault();
    e.stopPropagation();
    toggle(jobId);
    if (saved) cancelReminders([jobId]);
    else if (job) scheduleReminder(job, { askPermission: true });
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background text-sm font-medium rounded-md transition-colors"
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-brand text-brand" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className="p-1.5 -m-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-brand text-brand" : ""}`} />
    </button>
  );
}
