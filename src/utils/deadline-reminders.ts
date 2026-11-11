import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getSavedJobs, removeSavedJobs } from "@/hooks/use-saved-jobs";
import { fetchSavedListings } from "@/utils/saved-listings";

// Deadline reminders are local notifications scheduled on the phone itself, so
// they need no server, and they only exist inside the installed Android app.
// On the website every function here quietly does nothing.

export interface ReminderJob {
  id: string;
  jobTitle: string;
  companyName: string;
  closingDate: Date | null;
}

// One reminder per saved job: 3 days before it closes at 9:00 am. If that
// moment has already passed when the job is saved, fall back to 1 day before.
// If that has passed too, no reminder is scheduled.
const REMINDER_DAYS_BEFORE = [3, 1];
const REMINDER_HOUR = 9;
const CHANNEL_ID = "deadlines";

export const remindersSupported = () => Capacitor.isNativePlatform();

// Notification IDs must be 32-bit integers, so derive one from the listing's
// string ID. The same job always maps to the same number, which lets us cancel
// or replace its reminder later without keeping a lookup table.
function notificationId(jobId: string): number {
  let hash = 5381;
  for (let i = 0; i < jobId.length; i++) hash = ((hash << 5) + hash + jobId.charCodeAt(i)) | 0;
  return (hash & 0x7fffffff) || 1;
}

export function pickReminderTime(closing: Date, now = new Date()): Date | null {
  for (const days of REMINDER_DAYS_BEFORE) {
    const at = new Date(closing.getFullYear(), closing.getMonth(), closing.getDate() - days, REMINDER_HOUR, 0, 0);
    if (at.getTime() > now.getTime()) return at;
  }
  return null;
}

export type ReminderPermission = "granted" | "denied" | "prompt" | "unsupported";

export async function getReminderPermission(): Promise<ReminderPermission> {
  if (!remindersSupported()) return "unsupported";
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === "granted" || display === "denied") return display;
    return "prompt";
  } catch {
    return "unsupported";
  }
}

async function ensurePermission(askIfNeeded: boolean): Promise<boolean> {
  const current = await getReminderPermission();
  if (current === "granted") return true;
  if (current === "prompt" && askIfNeeded) {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  }
  return false;
}

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Capacitor.getPlatform() !== "android") return;
  // A dedicated channel lets people mute just these reminders in Android settings.
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Closing-date reminders",
    description: "Reminders before a saved job closes",
    importance: 3,
  });
  channelReady = true;
}

/** Schedule (or reschedule) the reminder for one job. `askPermission` should be true only right after the person saves a job. */
export async function scheduleReminder(job: ReminderJob, { askPermission }: { askPermission: boolean }) {
  if (!remindersSupported() || !job.closingDate) return;
  try {
    if (!(await ensurePermission(askPermission))) return;
    await ensureChannel();

    const id = notificationId(job.id);
    await LocalNotifications.cancel({ notifications: [{ id }] }); // replace any older schedule

    const at = pickReminderTime(job.closingDate);
    if (!at) return;

    const closes = job.closingDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: `Closing soon: ${job.jobTitle}`,
          body: `${job.companyName} · applications close ${closes}.`,
          channelId: CHANNEL_ID,
          schedule: { at, allowWhileIdle: true },
          extra: { jobId: job.id },
        },
      ],
    });
  } catch (error) {
    console.error("Could not schedule reminder:", error);
  }
}

export async function cancelReminders(jobIds: string[]) {
  if (!remindersSupported() || jobIds.length === 0) return;
  try {
    await LocalNotifications.cancel({ notifications: jobIds.map((id) => ({ id: notificationId(id) })) });
  } catch (error) {
    console.error("Could not cancel reminders:", error);
  }
}

/**
 * Runs when the app opens. Reschedules every saved job from its live closing
 * date (an admin may have changed it) and drops jobs that have closed.
 */
export async function syncDeadlineReminders() {
  if (!remindersSupported()) return;
  const ids = getSavedJobs().map((j) => j.id);
  if (ids.length === 0) return;

  const { found, gone } = await fetchSavedListings(ids);
  removeSavedJobs(gone);
  await cancelReminders(gone);

  for (const listing of Object.values(found)) {
    await scheduleReminder(
      {
        id: listing.id,
        jobTitle: listing.jobTitle,
        companyName: listing.companyName,
        closingDate: listing.closingDate ? listing.closingDate.toDate() : null,
      },
      { askPermission: false }
    );
  }
}
