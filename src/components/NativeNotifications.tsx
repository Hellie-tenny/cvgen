import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PluginListenerHandle } from "@capacitor/core";
import { remindersSupported, syncDeadlineReminders } from "@/utils/deadline-reminders";

/** Renders nothing. In the Android app it keeps reminders in sync and opens the job when a reminder is tapped. */
export function NativeNotifications() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!remindersSupported()) return;

    syncDeadlineReminders().catch((error) => console.error("Reminder sync failed:", error));

    let cancelled = false;
    let handle: PluginListenerHandle | undefined;
    LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
      const jobId = event.notification.extra?.jobId;
      if (typeof jobId === "string") navigate(`/jobs/${jobId}`);
    }).then((h) => {
      if (cancelled) h.remove();
      else handle = h;
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [navigate]);

  return null;
}
