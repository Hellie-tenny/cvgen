import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useOutletContext } from "react-router-dom";
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
import {
  Check,
  X,
  Loader2,
  Mail,
  AlertCircle,
  ChevronRight,
  Trash2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { db } from "@/firebase/config";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Linkify } from "@/utils/linkify";
import { formatAddressLines } from "@/utils/parse-listing";
import { SITE_URL } from "@/utils/site";
import {
  btn,
  dangerText,
  inputClass,
  EXIT_MS,
  Field,
  Notice,
  PageHeader,
  wait,
  type AdminContext,
} from "../components/admin/admin-ui";

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
  notifyByEmail: boolean;
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
  closingDate: string;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const TABS: { id: ListingStatus; label: string; empty: string }[] = [
  { id: "pending", label: "Pending", empty: "Nothing waiting for review." },
  { id: "approved", label: "Approved", empty: "No approved listings yet." },
  { id: "rejected", label: "Rejected", empty: "No rejected listings." },
];

const formatDate = (ts: Timestamp | null | undefined) =>
  ts ? ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

function buildApprovalMailto(listing: JobListing): string {
  const subject = `Your job listing "${listing.jobTitle}" is now live`;
  const greeting = listing.contactName ? `Hi ${listing.contactName},` : "Hi,";
  const body = `${greeting}

Good news — your listing for "${listing.jobTitle}" at ${listing.companyName} has been approved and is now live on Etiquette.

You can view it here: ${SITE_URL}/jobs/${listing.id}

It will stay up until your chosen closing date, after which it's automatically taken down.

Tip: sharing that link on WhatsApp or Facebook is the quickest way to get more people to see your listing and apply.

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

/** One labelled fact in the expanded view. Renders nothing when there's no value. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

export default function AdminJobs() {
  const { pendingCount } = useOutletContext<AdminContext>();
  const [activeTab, setActiveTab] = useState<ListingStatus>("pending");
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  // Rows that are fading out because they were just moved or deleted.
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());

  // Only one listing is open at a time, so the queue stays easy to scan.
  const [openId, setOpenId] = useState<string | null>(null);
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

  const startLeaving = (id: string) => {
    setLeavingIds((prev) => new Set(prev).add(id));
    return wait(EXIT_MS);
  };

  const stopLeaving = (id: string) =>
    setLeavingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const switchTab = (tab: ListingStatus) => {
    setActiveTab(tab);
    setLeavingIds(new Set());
    setOpenId(null);
    setEditingId(null);
    setEditDraft(null);
    setActionError("");
  };

  const toggleOpen = (id: string) => {
    if (editingId) return; // finish or cancel the edit first
    setOpenId((current) => (current === id ? null : id));
  };

  const handleStatusChange = async (id: string, status: ListingStatus) => {
    setActioningId(id);
    setActionError("");
    try {
      await startLeaving(id);
      await updateDoc(doc(db, "jobListings", id), { status });
      setOpenId(null);
    } catch (err) {
      console.error("Error updating listing:", err);
      setActionError(err instanceof Error ? err.message : "Something went wrong updating that listing.");
    } finally {
      stopLeaving(id);
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    const confirmed = window.confirm(`Delete "${jobTitle}" permanently? This can't be undone.`);
    if (!confirmed) return;

    setActioningId(id);
    setActionError("");
    try {
      await startLeaving(id);
      await deleteDoc(doc(db, "jobListings", id));
      setOpenId(null);
    } catch (err) {
      console.error("Error deleting listing:", err);
      setActionError(err instanceof Error ? err.message : "Something went wrong deleting that listing.");
    } finally {
      stopLeaving(id);
      setActioningId(null);
    }
  };

  const startEdit = (listing: JobListing) => {
    setOpenId(listing.id);
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
        contactAddress: formatAddressLines(editDraft.contactAddress).join("\n"),
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

  const setField = (field: keyof EditDraft, value: string) =>
    setEditDraft((draft) => (draft ? { ...draft, [field]: value } : draft));

  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div>
      <Helmet>
        <title>Job listings — Admin</title>
      </Helmet>

      <PageHeader title="Job listings" description="Review submissions before they go live on the jobs page." />

      <div className="flex gap-1 p-1 bg-background border border-border rounded-lg mb-6 w-fit" role="tablist">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.id === "pending" && pendingCount > 0 && (
                <span
                  key={pendingCount}
                  className={cn(
                    "anim-pop ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold",
                    active ? "bg-background text-foreground" : "bg-amber-500 text-white"
                  )}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actionError && (
        <Notice>
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </Notice>
      )}

      {loading && (
        <div className="space-y-2" aria-busy="true" aria-label="Loading listings">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[66px] rounded-lg" />
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-muted-foreground text-center py-16">{activeTabInfo.empty}</p>
      )}

      <div>
        {listings.map((listing) => {
          const isOpen = openId === listing.id;
          const isEditing = editingId === listing.id;
          const busy = actioningId === listing.id;
          const canNotify = listing.contactEmail && listing.notifyByEmail !== false;
          const optedOut = listing.contactEmail && listing.notifyByEmail === false;

          const leaving = leavingIds.has(listing.id);

          return (
            // Outer grid animates the row's height to 0 as it leaves; the padding supplies the gap between rows.
            <div
              key={listing.id}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-[260ms] ease-out",
                leaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-2">
            <div className="bg-background border border-border rounded-lg">
              {/* ── Compact row: what you need to triage at a glance ── */}
              <div className="flex items-center gap-2 pr-3">
                <button
                  type="button"
                  onClick={() => toggleOpen(listing.id)}
                  aria-expanded={isOpen}
                  className="flex-1 min-w-0 flex items-center gap-3 p-4 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{listing.jobTitle}</span>
                    <span className="block text-sm text-muted-foreground truncate">
                      {listing.companyName}
                      {listing.location && ` · ${listing.location}`}
                    </span>
                    <span className="block md:hidden text-xs text-muted-foreground mt-0.5">
                      Posted {formatDate(listing.createdAt)}
                      {listing.closingDate && ` · Closes ${formatDate(listing.closingDate)}`}
                    </span>
                  </span>
                </button>

                <div className="hidden md:block shrink-0 text-xs text-muted-foreground text-right leading-relaxed">
                  <p>Posted {formatDate(listing.createdAt)}</p>
                  {listing.closingDate && <p>Closes {formatDate(listing.closingDate)}</p>}
                </div>

                {activeTab === "pending" && !isOpen && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(listing.id, "rejected")}
                      disabled={busy}
                      className={btn("secondary", "sm")}
                      aria-label={`Reject ${listing.jobTitle}`}
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(listing.id, "approved")}
                      disabled={busy}
                      className={btn("approve", "sm")}
                      aria-label={`Approve ${listing.jobTitle}`}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── Expanded: full review, actions and edit form ── */}
              {isOpen && (
                <div className="anim-expand border-t border-border p-5">
                  {isEditing && editDraft ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Company name">
                          <input
                            type="text"
                            value={editDraft.companyName}
                            onChange={(e) => setField("companyName", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Job title">
                          <input
                            type="text"
                            value={editDraft.jobTitle}
                            onChange={(e) => setField("jobTitle", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Location">
                          <input
                            type="text"
                            value={editDraft.location}
                            onChange={(e) => setField("location", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Employment type">
                          <select
                            value={editDraft.employmentType}
                            onChange={(e) => setField("employmentType", e.target.value)}
                            className={inputClass}
                          >
                            {EMPLOYMENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Closing date">
                          <input
                            type="date"
                            value={editDraft.closingDate}
                            onChange={(e) => setField("closingDate", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Contact name">
                          <input
                            type="text"
                            value={editDraft.contactName}
                            onChange={(e) => setField("contactName", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Contact email">
                          <input
                            type="email"
                            value={editDraft.contactEmail}
                            onChange={(e) => setField("contactEmail", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Postal address / P.O. Box">
                          <textarea
                            value={editDraft.contactAddress}
                            onChange={(e) => setField("contactAddress", e.target.value)}
                            rows={3}
                            className={`${inputClass} resize-none`}
                          />
                        </Field>
                      </div>

                      <Field label="Description">
                        <textarea
                          value={editDraft.description}
                          onChange={(e) => setField("description", e.target.value)}
                          rows={8}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>

                      <Field label="How to apply (optional)">
                        <textarea
                          value={editDraft.howToApplyNotes}
                          onChange={(e) => setField("howToApplyNotes", e.target.value)}
                          rows={4}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(listing.id)}
                          disabled={savingEdit}
                          className={btn("primary")}
                        >
                          {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save changes
                        </button>
                        <button type="button" onClick={cancelEdit} disabled={savingEdit} className={btn("secondary")}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                        <Fact label="Employment type">{listing.employmentType}</Fact>
                        <Fact label="Location">{listing.location}</Fact>
                        <Fact label="Posted">{formatDate(listing.createdAt)}</Fact>
                        <Fact label="Closes">{formatDate(listing.closingDate)}</Fact>
                        {(listing.contactEmail || listing.contactName) && (
                          <Fact label="Contact">
                            {listing.contactEmail && (
                              <>
                                <a href={`mailto:${listing.contactEmail}`} className="underline underline-offset-2">
                                  {listing.contactEmail}
                                </a>
                                {listing.contactName && ` (${listing.contactName})`}
                                {optedOut && (
                                  <span className="block text-xs text-muted-foreground">
                                    Opted out of approval emails
                                  </span>
                                )}
                              </>
                            )}
                            {!listing.contactEmail && listing.contactName}
                          </Fact>
                        )}
                        <Fact label="Postal address">
                          {listing.contactAddress && formatAddressLines(listing.contactAddress).join(", ")}
                        </Fact>
                      </dl>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p className="text-sm whitespace-pre-wrap">{listing.description}</p>
                      </div>

                      {listing.howToApplyNotes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">How to apply</p>
                          <div className="text-sm bg-muted/50 border border-border rounded-lg p-3 whitespace-pre-line">
                            <Linkify text={listing.howToApplyNotes} />
                          </div>
                        </div>
                      )}

                      {/* Actions: status changes on the left, edit/delete on the right */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                        {activeTab === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "approved")}
                              disabled={busy}
                              className={btn("approve")}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "rejected")}
                              disabled={busy}
                              className={btn("secondary")}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === "approved" && (
                          <>
                            {canNotify && (
                              <a href={buildApprovalMailto(listing)} className={btn("primary")}>
                                <Mail className="h-4 w-4" />
                                Notify poster
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "pending")}
                              disabled={busy}
                              className={btn("secondary")}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Move to pending
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "rejected")}
                              disabled={busy}
                              className={btn("secondary")}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === "rejected" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "approved")}
                              disabled={busy}
                              className={btn("approve")}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(listing.id, "pending")}
                              disabled={busy}
                              className={btn("secondary")}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Move to pending
                            </button>
                          </>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => startEdit(listing)}
                            disabled={busy}
                            className={btn("ghost")}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(listing.id, listing.jobTitle)}
                            disabled={busy}
                            className={cn(btn("ghost"), dangerText, "hover:text-red-700 hover:bg-red-600/10")}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
