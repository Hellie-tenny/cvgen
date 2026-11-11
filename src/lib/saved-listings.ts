import { doc, getDoc, type FirestoreError, type Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export interface SavedListing {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  closingDate: Timestamp | null;
}

/**
 * Looks up saved listings by ID. `found` are still open; `gone` are IDs we
 * positively know no longer exist or have closed. An ID that fails for any
 * other reason (e.g. offline) is in neither list, so it stays saved.
 */
export async function fetchSavedListings(ids: string[]) {
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
        // The rules only let the public read approved listings, and reading a
        // deleted doc is also denied, so "permission-denied" means it's gone.
        if ((err as FirestoreError).code === "permission-denied") gone.push(id);
      }
    })
  );

  return { found, gone };
}
