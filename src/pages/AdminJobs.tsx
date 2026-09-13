import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Check, X, LogOut, Loader2, Mail, MapPin, Briefcase, AlertCircle } from "lucide-react";
import { db, auth } from "@/firebase/config";
import Header from "../components/Header";

type ListingStatus = "pending" | "approved" | "rejected";

interface JobListing {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  howToApplyNotes: string;
  status: ListingStatus;
  createdAt: Timestamp | null;
}

const TABS: { id: ListingStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminJobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ListingStatus>("pending");
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "jobListings"),
      where("status", "==", activeTab),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setListings(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as JobListing)
        );
        setLoading(false);
      },
      (err) => {
        console.error("Error loading listings:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeTab]);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    setActioningId(id);
    setActionError("");
    try {
      await updateDoc(doc(db, "jobListings", id), { status });
    } catch (err) {
      console.error("Error updating listing:", err);
      setActionError(
        err instanceof Error ? err.message : "Something went wrong updating that listing."
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <div>
      <Helmet>
        <title>Job Listings — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <div className="max-w-3xl mx-auto p-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-background border border-border rounded-lg mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-red-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && listings.length === 0 && (
          <p className="text-muted-foreground text-center py-16">
            No {activeTab} listings.
          </p>
        )}

        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-semibold text-lg">{listing.jobTitle}</h2>
                  <p className="text-sm text-muted-foreground">{listing.companyName}</p>
                </div>
                {listing.createdAt && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {listing.createdAt.toDate().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
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
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {listing.contactEmail}
                  {listing.contactName && ` (${listing.contactName})`}
                </span>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
                {listing.description}
              </p>

              {listing.howToApplyNotes && (
                <div className="text-sm bg-background border border-border rounded-lg p-3 mb-3">
                  <span className="font-medium">How to apply: </span>
                  {listing.howToApplyNotes}
                </div>
              )}

              {activeTab === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDecision(listing.id, "approved")}
                    disabled={actioningId === listing.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(listing.id, "rejected")}
                    disabled={actioningId === listing.id}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
