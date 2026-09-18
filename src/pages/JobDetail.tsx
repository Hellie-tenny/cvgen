import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { MapPin, Briefcase, Mail, Loader2 } from "lucide-react";
import { db } from "@/firebase/config";
import { ShareButton } from "../components/ShareButton";

const SITE_URL = "https://ettiquette-cv.web.app";

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
      </Helmet>

      <div className="flex items-center justify-between gap-3">
        <Link to="/jobs" className="text-sm text-red-500 hover:underline">
          ← Back to job listings
        </Link>
        <ShareButton url={pageUrl} title={shareTitle} text={shareText} />
      </div>

      <h1 className="text-3xl font-bold mt-4 mb-2">{listing.jobTitle}</h1>
      <p className="text-lg text-muted-foreground mb-4">{listing.companyName}</p>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
        {listing.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {listing.location}
          </span>
        )}
        {listing.employmentType && (
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" /> {listing.employmentType}
          </span>
        )}
        {listing.closingDate && (
          <span className="flex items-center gap-1.5">
            Apply by{" "}
            {listing.closingDate.toDate().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="prose-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-8">
        {listing.description}
      </div>

      <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-lg space-y-4">
        <h2 className="font-semibold">How to apply</h2>

        {listing.howToApplyNotes && (
          <p className="text-sm text-muted-foreground">{listing.howToApplyNotes}</p>
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
          <p className="text-sm flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="text-foreground/90">{listing.contactAddress}</span>
          </p>
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
