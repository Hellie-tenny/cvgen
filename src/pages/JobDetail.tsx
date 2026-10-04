import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { MapPin, Briefcase, Mail, Loader2, CalendarDays, ListChecks } from "lucide-react";
import { db } from "@/firebase/config";
import { ShareButton } from "../components/ShareButton";
import { Linkify } from "@/utils/linkify";
import { extractRequirements, daysUntil, formatAddressLines } from "@/utils/parse-listing";
import { buildJobPostingJsonLd } from "@/utils/job-posting-schema";
import { SITE_URL, toJsonLd } from "@/utils/site";

interface JobListing {
  companyName: string;
  contactEmail: string;
  contactAddress: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  howToApplyNotes: string;
  status: string;
  createdAt: Timestamp | null;
  closingDate: Timestamp | null;
}

export default function JobDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const snap = await getDoc(doc(db, "jobListings", id));
        const data = snap.exists() ? (snap.data() as JobListing) : null;
        const isExpired = data?.closingDate && data.closingDate.toDate() <= new Date();

        if (!data || data.status !== "approved" || isExpired) {
          setNotFound(true);
        } else {
          setListing(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-2xl mx-auto p-4 py-24 text-center">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="text-2xl font-bold mb-3">Listing not found</h1>
        <p className="text-muted-foreground mb-8">
          This listing may have closed or is no longer available.
        </p>
        <Link to="/jobs" className="text-red-500 hover:underline">
          ← Back to job listings
        </Link>
      </div>
    );
  }

  const pageUrl = `${SITE_URL}/jobs/${id}`;
  const shareTitle = `${listing.jobTitle} at ${listing.companyName}`;
  const shareText = `${shareTitle} — hiring now on Etiquette.`;
  const metaDescription = listing.description.slice(0, 155);
  const ogImage = `${SITE_URL}/og-image.png`;

  // Google's job-search structured data (null if the listing has no posted date).
  const jobJsonLd = buildJobPostingJsonLd({ id: id ?? "", ...listing });

  // Pull a Requirements/Qualifications section out of the description so it can be highlighted.
  // If none is found, the description is shown exactly as written.
  const parsed = extractRequirements(listing.description);
  const bodyText = parsed ? parsed.rest : listing.description;

  const closing = listing.closingDate ? listing.closingDate.toDate() : null;
  const daysLeft = closing ? daysUntil(closing) : null;
  const closingSoon = daysLeft !== null && daysLeft <= 3;
  const daysLeftLabel =
    daysLeft === null ? "" : daysLeft <= 0 ? "Closes today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;

  return (
    <div className="max-w-2xl mx-auto p-4 py-12">
      <Helmet>
        <title>{shareTitle} — Etiquette</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph — what WhatsApp, Facebook, LinkedIn etc. read for link previews */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Etiquette" />

        {/* Twitter/X card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="canonical" href={pageUrl} />
        {jobJsonLd && <script type="application/ld+json">{toJsonLd(jobJsonLd)}</script>}
      </Helmet>

      <div className="flex items-center justify-between gap-3">
        <Link to="/jobs" className="text-sm text-red-500 hover:underline">
          ← Back to job listings
        </Link>
        <ShareButton url={pageUrl} title={shareTitle} text={shareText} />
      </div>

      <h1 className="text-3xl font-bold mt-4 mb-2">{listing.jobTitle}</h1>
      <p className="text-lg text-muted-foreground mb-4">{listing.companyName}</p>

      {/* Key details up front, so the important facts don't get buried in the description */}
      <div className="grid sm:grid-cols-2 gap-px bg-red-500/20 border border-red-500/20 rounded-lg overflow-hidden mb-6">
        <div className="bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Position</p>
          <p className="font-semibold flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-red-500 shrink-0" /> {listing.jobTitle}
          </p>
        </div>

        {closing && (
          <div className={`p-4 ${closingSoon ? "bg-red-500/10" : "bg-background"}`}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Closing date</p>
            <p className="font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-red-500 shrink-0" />
                {closing.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  closingSoon ? "bg-red-500 text-white" : "bg-red-500/10 text-red-500"
                }`}
              >
                {daysLeftLabel}
              </span>
            </p>
          </div>
        )}

        {listing.employmentType && (
          <div className="bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Employment type</p>
            <p className="font-medium">{listing.employmentType}</p>
          </div>
        )}

        {listing.location && (
          <div className="bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Location</p>
            <p className="font-medium flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-red-500 shrink-0" /> {listing.location}
            </p>
          </div>
        )}
      </div>

      {parsed && (
        <div className="p-5 mb-6 bg-red-500/5 border border-red-500/20 border-l-4 border-l-red-500 rounded-lg">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <ListChecks className="h-5 w-5 text-red-500" /> Requirements &amp; qualifications
          </h2>
          <div className="space-y-2 text-sm text-foreground/90 leading-relaxed">
            {parsed.requirements.map((block, i) =>
              block.type === "ul" ? (
                <ul key={i} className="list-disc pl-5 space-y-1">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{block.text}</p>
              )
            )}
          </div>
        </div>
      )}

      {bodyText && (
        <div className="prose-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-8">{bodyText}</div>
      )}

      <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-lg space-y-4">
        <h2 className="font-semibold">How to apply</h2>

        {listing.howToApplyNotes && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            <Linkify text={listing.howToApplyNotes} />
          </p>
        )}

        {listing.contactEmail && (
          <p className="text-sm flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-red-500" />
            <a href={`mailto:${listing.contactEmail}`} className="text-red-500 hover:underline">
              {listing.contactEmail}
            </a>
          </p>
        )}

        {listing.contactAddress && (
          <div className="text-sm flex items-start gap-1.5">
            <MapPin className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Postal address</p>
              <address className="not-italic text-foreground/90 leading-snug">
                {formatAddressLines(listing.contactAddress).map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>
        )}

        <Link
          to={`/cover-letter?jobId=${id}`}
          className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Apply with a cover letter →
        </Link>
      </div>
    </div>
  );
}
