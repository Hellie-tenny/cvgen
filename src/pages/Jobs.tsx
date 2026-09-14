import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot, type Timestamp } from "firebase/firestore";
import { MapPin, Briefcase, Loader2 } from "lucide-react";
import { db } from "@/firebase/config";

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

      <div className="flex items-center justify-between gap-3 flex-wrap p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-8">
        <p className="text-sm text-foreground/90">
          Hiring? If you're a recruiter looking to advertise a vacancy, post your job listing here — it's free.
        </p>
        <Link
          to="/post-job"
          className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Post a Job →
        </Link>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-3">Job Listings</h1>
      <p className="text-muted-foreground mb-10">
        Browse open roles. When you find one, use our{" "}
        <Link to="/cover-letter" className="text-red-500 hover:underline">
          AI Cover Letter tool
        </Link>{" "}
        to apply with a letter tailored to that specific job.
      </p>

      {loading && (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          No open listings right now — check back soon, or{" "}
          <Link to="/post-job" className="text-red-500 hover:underline">
            post one
          </Link>
          .
        </p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/jobs/${listing.id}`}
            className="py-6 flex flex-col gap-2 hover:bg-red-500/5 -mx-4 px-4 rounded-lg transition-colors"
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
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
