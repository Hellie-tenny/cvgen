import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { doc, getDoc, type FirestoreError, type Timestamp } from "firebase/firestore";
import { MapPin, Briefcase, CalendarDays } from "lucide-react";
import { db } from "@/firebase/config";
import { daysUntil } from "@/utils/parse-listing";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { SaveJobButton } from "@/components/SaveJobButton";
import { Skeleton } from "@/components/ui/skeleton";

interface SavedListing {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  closingDate: Timestamp | null;
}

export default function SavedJobs() {
  const { saved, remove } = useSavedJobs();
  const [listings, setListings] = useState<Record<string, SavedListing>>({});
  const [loading, setLoading] = useState(true);

  // Re-fetch only when the set of saved IDs changes (not on every re-render).
  const idsKey = saved.map((j) => j.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split(",") : [];

    if (ids.length === 0) {
      setListings({});
      setLoading(false);
      return;
    }

    (async () => {
      const found: Record<string, SavedListing> = {};
      const gone: string[] = [];
      const now = new Date();

      await Promise.all(
        ids.map(async (id) => {
          try {
            const snap = await getDoc(doc(db, "jobListings", id));
            const data = snap.exists() ? (snap.data() as Omit<SavedListing, "id"> & { status?: string }) : null;
            const expired = data?.closingDate && data.closingDate.toDate() <= now;
            if (!data || data.status !== "approved" || expired) {
              gone.push(id);
            } else {
              found[id] = { id, ...data };
            }
          } catch (err) {
            // The rules only let the public read approved listings, and reading
            // a deleted doc is also denied, so "permission-denied" means this
            // listing is gone. Any other error (e.g. offline) keeps the ID
            // saved so a flaky connection never wipes someone's list.
            if ((err as FirestoreError).code === "permission-denied") gone.push(id);
          }
        })
      );

      if (cancelled) return;
      setListings(found);
      setLoading(false);
      // Closed or deleted listings are cleaned out of the saved list.
      remove(gone);
    })();

    return () => {
      cancelled = true;
    };
  }, [idsKey, remove]);

  const visible = saved.map((j) => listings[j.id]).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto p-4 py-12">
      <Helmet>
        <title>Saved Jobs — Etiquette</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Link to="/jobs" className="text-sm text-brand hover:underline">
        ← Back to job listings
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-3">Saved Jobs</h1>
      <p className="text-muted-foreground mb-10">
        Jobs you've saved on this device. Listings are removed from here automatically once they close.
      </p>

      {loading && saved.length > 0 && (
        <div className="flex flex-col divide-y divide-border" aria-busy="true" aria-label="Loading saved jobs">
          {saved.slice(0, 3).map((j) => (
            <div key={j.id} className="py-6 flex flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          No saved jobs yet. Tap the bookmark on any listing to keep it here.{" "}
          <Link to="/jobs" className="text-brand hover:underline">
            Browse jobs
          </Link>
        </p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {visible.map((listing) => {
          const closing = listing.closingDate ? listing.closingDate.toDate() : null;
          const daysLeft = closing ? daysUntil(closing) : null;
          const closingSoon = daysLeft !== null && daysLeft <= 3;
          const daysLeftLabel =
            daysLeft === null ? "" : daysLeft <= 0 ? "Closes today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;

          return (
            <Link
              key={listing.id}
              to={`/jobs/${listing.id}`}
              className="py-6 flex flex-col gap-2 hover:bg-brand/5 -mx-4 px-4 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{listing.jobTitle}</h2>
                  <p className="text-sm text-muted-foreground">{listing.companyName}</p>
                </div>
                <SaveJobButton jobId={listing.id} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {listing.location}
                  </span>
                )}
                {listing.employmentType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {listing.employmentType}
                  </span>
                )}
                {closing && (
                  <span
                    className={`flex items-center gap-1 ${closingSoon ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" /> Closes{" "}
                    {closing.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {daysLeftLabel}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
