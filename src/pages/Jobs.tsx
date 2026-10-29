import { useEffect, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot, type Timestamp } from "firebase/firestore";
import { MapPin, Briefcase, CalendarDays } from "lucide-react";
import { db } from "@/firebase/config";
import { daysUntil } from "@/utils/parse-listing";
import { Skeleton } from "@/components/ui/skeleton";
import { Canonical } from "../components/Canonical";

interface JobListing {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  createdAt: Timestamp | null;
  closingDate: Timestamp | null;
}

export default function Jobs() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "jobListings"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = new Date();
        const results = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as JobListing)
          // Firestore's TTL cleanup can lag up to ~24h behind a listing's
          // closing date, so filter expired ones out here too rather than
          // relying on deletion alone.
          .filter((listing) => !listing.closingDate || listing.closingDate.toDate() > now);
        setListings(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading jobs:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 py-12">
      <Helmet>
        <title>Job Listings — Etiquette</title>
        <meta
          name="description"
          content="Browse job openings and apply with a tailored, AI-written cover letter generated in seconds — free, no sign-up required."
        />
      </Helmet>
      <Canonical path="/jobs" />

      <h1 className="text-3xl sm:text-4xl font-bold mb-3">Job Listings</h1>
      <p className="text-muted-foreground mb-10">
        Browse open roles. When you find one, use our{" "}
        <Link to="/cover-letter" className="text-brand hover:underline">
          AI Cover Letter tool
        </Link>{" "}
        to apply with a letter tailored to that specific job.
      </p>

      {loading && (
        <div className="flex flex-col divide-y divide-border" aria-busy="true" aria-label="Loading jobs">
          {[0, 1, 2].map((i) => (
            <div key={i} className="py-6 flex flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          No open listings right now — check back soon, or{" "}
          <Link to="/post-job" className="text-brand hover:underline">
            post one
          </Link>
          .
        </p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {listings.map((listing, index) => {
          const closing = listing.closingDate ? listing.closingDate.toDate() : null;
          const daysLeft = closing ? daysUntil(closing) : null;
          const closingSoon = daysLeft !== null && daysLeft <= 3;
          const daysLeftLabel =
            daysLeft === null ? "" : daysLeft <= 0 ? "Closes today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;

          return (
          <Link
            key={listing.id}
            to={`/jobs/${listing.id}`}
            className="anim-rise py-6 flex flex-col gap-2 hover:bg-brand/5 -mx-4 px-4 rounded-lg transition-colors"
            style={{ "--delay": `${Math.min(index, 8) * 45}ms` } as CSSProperties}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{listing.jobTitle}</h2>
                <p className="text-sm text-muted-foreground">{listing.companyName}</p>
              </div>
              {listing.createdAt && (
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {listing.createdAt.toDate().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
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
                <span className={`flex items-center gap-1 ${closingSoon ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
                  <CalendarDays className="h-3.5 w-3.5" /> Closes{" "}
                  {closing.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                  {daysLeftLabel}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          </Link>
          );
        })}
      </div>
      <p className="mt-10 pt-6 border-t text-sm text-muted-foreground">
        Hiring?{" "}
        <Link to="/post-job" className="text-brand hover:underline">
          Post a job
        </Link>{" "}
        — it's free.
      </p>
    </div>
  );
}
