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
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  Check,
  X,
  LogOut,
  Loader2,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Trash2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { db, auth } from "@/firebase/config";
import Header from "../components/Header";

type ListingStatus = "pending" | "approved" | "rejected";

interface JobListing {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactAddress: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  howToApplyNotes: string;
  status: ListingStatus;
  createdAt: Timestamp | null;
  closingDate: Timestamp | null;
}

interface EditDraft {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactAddress: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  howToApplyNotes: string;
  closingDate: string; // yyyy-mm-dd for the date input
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const TABS: { id: ListingStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const SITE_URL = "https://ettiquette-cv.web.app";

function buildApprovalMailto(listing: JobListing): string {
  const subject = `Your job listing "${listing.jobTitle}" is now live`;
  const greeting = listing.contactName ? `Hi ${listing.contactName},` : "Hi,";
  const body = `${greeting}

Good news — your listing for "${listing.jobTitle}" at ${listing.companyName} has been approved and is now live on Etiquette.

You can view it here: ${SITE_URL}/jobs/${listing.id}

It will stay up until your chosen closing date, after which it's automatically taken down.

Thanks for posting with us!`;

  return `mailto:${listing.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function toEditDraft(listing: JobListing): EditDraft {
  return {
    companyName: listing.companyName,
    contactName: listing.contactName,
    contactEmail: listing.contactEmail,
    contactAddress: listing.contactAddress,
    jobTitle: listing.jobTitle,
    location: listing.location,
    employmentType: listing.employmentType,
    description: listing.description,
    howToApplyNotes: listing.howToApplyNotes,
    closingDate: listing.closingDate ? listing.closingDate.toDate().toISOString().split("T")[0] : "",
  };
}

export default function AdminJobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ListingStatus>("pending");
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Listings for the active tab
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
        setListings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as JobListing));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading listings:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeTab]);

  // Pending count, tracked independently so the badge stays accurate
  // regardless of which tab is currently open.
  useEffect(() => {
    const q = query(collection(db, "jobListings"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => setPendingCount(snapshot.size));
    return unsubscribe;
  }, []);

  const handleStatusChange = async (id: string, status: ListingStatus) => {
    setActioningId(id);
    setActionError("");
    try {
      await updateDoc(doc(db, "jobListings", id), { status });
    } catch (err) {
      console.error("Error updating listing:", err);
      setActionError(err instanceof Error ? err.message : "Something went wrong updating that listing.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `Delete "${jobTitle}" permanently? This can't be undone.`
    );
    if (!confirmed) return;

    setActioningId(id);
    setActionError("");
    try {
      await deleteDoc(doc(db, "jobListings", id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      setActionError(err instanceof Error ? err.message : "Something went wrong deleting that listing.");
    } finally {
      setActioningId(null);
    }
  };

  const startEdit = (listing: JobListing) => {
    setEditingId(listing.id);
    setEditDraft(toEditDraft(listing));
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;

    if (
      !editDraft.companyName.trim() ||
      (!editDraft.contactEmail.trim() && !editDraft.contactAddress.trim()) ||
      !editDraft.jobTitle.trim() ||
      editDraft.description.trim().length < 30 ||
      !editDraft.closingDate
    ) {
      setActionError(
        "Company, job title, description (30+ chars), closing date, and at least one contact method are required."
      );
      return;
    }

    setSavingEdit(true);
    setActionError("");
    try {
      await updateDoc(doc(db, "jobListings", id), {
        companyName: editDraft.companyName.trim(),
        contactName: editDraft.contactName.trim(),
        contactEmail: editDraft.contactEmail.trim(),
        contactAddress: editDraft.contactAddress.trim(),
        jobTitle: editDraft.jobTitle.trim(),
        location: editDraft.location.trim(),
        employmentType: editDraft.employmentType,
        description: editDraft.description.trim(),
        howToApplyNotes: editDraft.howToApplyNotes.trim(),
        closingDate: Timestamp.fromDate(new Date(editDraft.closingDate)),
      });
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      console.error("Error saving listing:", err);
      setActionError(err instanceof Error ? err.message : "Something went wrong saving that listing.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const inputClass =
    "w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

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
                activeTab === tab.id ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && pendingCount > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                    activeTab === "pending" ? "bg-white text-red-500" : "bg-red-500 text-white"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
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
          <p className="text-muted-foreground text-center py-16">No {activeTab} listings.</p>
        )}

        <div className="space-y-4">
          {listings.map((listing) => {
            const isEditing = editingId === listing.id;

            return (
              <div key={listing.id} className="border border-border rounded-lg p-5">
                {isEditing && editDraft ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Company name</label>
                        <input
                          type="text"
                          value={editDraft.companyName}
                          onChange={(e) => setEditDraft({ ...editDraft, companyName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Contact name</label>
                        <input
                          type="text"
                          value={editDraft.contactName}
                          onChange={(e) => setEditDraft({ ...editDraft, contactName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Contact email</label>
                        <input
                          type="email"
                          value={editDraft.contactEmail}
                          onChange={(e) => setEditDraft({ ...editDraft, contactEmail: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Postal address / P.O. Box</label>
                        <input
                          type="text"
                          value={editDraft.contactAddress}
                          onChange={(e) => setEditDraft({ ...editDraft, contactAddress: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Job title</label>
                        <input
                          type="text"
                          value={editDraft.jobTitle}
                          onChange={(e) => setEditDraft({ ...editDraft, jobTitle: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Location</label>
                        <input
                          type="text"
                          value={editDraft.location}
                          onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Employment type</label>
                        <select
                          value={editDraft.employmentType}
                          onChange={(e) => setEditDraft({ ...editDraft, employmentType: e.target.value })}
                          className={inputClass}
                        >
                          {EMPLOYMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Closing date</label>
                        <input
                          type="date"
                          value={editDraft.closingDate}
                          onChange={(e) => setEditDraft({ ...editDraft, closingDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                      <textarea
                        value={editDraft.description}
                        onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                        rows={6}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">How to apply (optional)</label>
                      <textarea
                        value={editDraft.howToApplyNotes}
                        onChange={(e) => setEditDraft({ ...editDraft, howToApplyNotes: e.target.value })}
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => saveEdit(listing.id)}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      {listing.closingDate && (
                        <span className="flex items-center gap-1">
                          Closes{" "}
                          {listing.closingDate.toDate().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {listing.contactEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {listing.contactEmail}
                          {listing.contactName && ` (${listing.contactName})`}
                        </span>
                      )}
                      {listing.contactAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {listing.contactAddress}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">{listing.description}</p>

                    {listing.howToApplyNotes && (
                      <div className="text-sm bg-background border border-border rounded-lg p-3 mb-3">
                        <span className="font-medium">How to apply: </span>
                        {listing.howToApplyNotes}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeTab === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "approved")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "rejected")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {activeTab === "approved" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "pending")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Move to pending
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "rejected")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </button>
                          {listing.contactEmail && (
                            <a
                              href={buildApprovalMailto(listing)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background text-sm font-medium rounded-md transition-colors"
                            >
                              <Mail className="h-4 w-4" />
                              Notify poster
                            </a>
                          )}
                        </>
                      )}

                      {activeTab === "rejected" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "pending")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Move to pending
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(listing.id, "approved")}
                            disabled={actioningId === listing.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => startEdit(listing)}
                        disabled={actioningId === listing.id}
                        className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background disabled:opacity-40 text-sm font-medium rounded-md transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(listing.id, listing.jobTitle)}
                        disabled={actioningId === listing.id}
                        className="flex items-center gap-1.5 px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40 text-sm font-medium rounded-md transition-colors ml-auto"
                      >
                        {actioningId === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
