import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LogOut, Loader2, AlertCircle, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, CheckCircle2 } from "lucide-react";
import { db, auth } from "@/firebase/config";
import Header from "../components/Header";
import { ArticleBody } from "../components/ArticleBody";
import { ARTICLE_CATEGORIES, isReservedSlug, readTimeFor, slugify, type ArticleDoc } from "@/utils/articles";
import { SITE_URL } from "@/utils/site";

interface ArticleRow extends ArticleDoc {
  slug: string;
}

interface ArticleDraft {
  title: string;
  slug: string;
  description: string;
  category: string;
  body: string;
}

type EditorState = { kind: "new" } | { kind: "edit"; slug: string; status: ArticleDoc["status"] } | null;

const emptyDraft: ArticleDraft = {
  title: "",
  slug: "",
  description: "",
  category: ARTICLE_CATEGORIES[0],
  body: "",
};

// A new article is kept in this browser as you write, so a refresh or a closed tab doesn't lose a long piece.
const NEW_DRAFT_KEY = "admin-article-new-draft";

function loadNewDraft(): { draft: ArticleDraft; slugTouched: boolean } {
  try {
    const raw = window.localStorage.getItem(NEW_DRAFT_KEY);
    if (!raw) return { draft: emptyDraft, slugTouched: false };
    const parsed = JSON.parse(raw);
    return { draft: { ...emptyDraft, ...(parsed.draft ?? {}) }, slugTouched: !!parsed.slugTouched };
  } catch {
    return { draft: emptyDraft, slugTouched: false };
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_BODY_CHARS = 200;
const MAX_DESCRIPTION_CHARS = 160;

const formatDate = (ts: Timestamp | null | undefined) =>
  ts ? ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState("");

  const [editor, setEditor] = useState<EditorState>(null);
  const [draft, setDraft] = useState<ArticleDraft>(emptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "articles"),
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ slug: d.id, ...(d.data() as ArticleDoc) }));
        rows.sort((a, b) => (b.updatedAt?.toMillis() ?? Date.now()) - (a.updatedAt?.toMillis() ?? Date.now()));
        setArticles(rows);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading articles:", err);
        setListError("Couldn't load articles. Check that the Firestore rules for articles are deployed.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Keep the in-progress NEW article in this browser.
  useEffect(() => {
    if (editor?.kind !== "new") return;
    try {
      window.localStorage.setItem(NEW_DRAFT_KEY, JSON.stringify({ draft, slugTouched }));
    } catch {
      /* storage full or blocked — not critical */
    }
  }, [draft, slugTouched, editor]);

  const update = (patch: Partial<ArticleDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleTitleChange = (title: string) => {
    // The web address follows the title until you edit it yourself (new articles only).
    if (editor?.kind === "new" && !slugTouched) update({ title, slug: slugify(title) });
    else update({ title });
  };

  const startNew = () => {
    const saved = loadNewDraft();
    setDraft(saved.draft);
    setSlugTouched(saved.slugTouched);
    setEditor({ kind: "new" });
    setPreview(false);
    setFormError("");
    setNotice("");
  };

  const startEdit = (row: ArticleRow) => {
    setDraft({
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category || ARTICLE_CATEGORIES[0],
      body: row.body,
    });
    setSlugTouched(true);
    setEditor({ kind: "edit", slug: row.slug, status: row.status });
    setPreview(false);
    setFormError("");
    setNotice("");
  };

  const closeEditor = () => {
    setEditor(null);
    setPreview(false);
    setFormError("");
  };

  const clearNewDraft = () => {
    if (!window.confirm("Clear everything you've written in this article? This can't be undone.")) return;
    setDraft(emptyDraft);
    setSlugTouched(false);
    setFormError("");
    try {
      window.localStorage.removeItem(NEW_DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const validate = (forPublish: boolean): string => {
    if (!draft.title.trim()) return "Add a title.";
    const slug = draft.slug.trim();
    if (!SLUG_PATTERN.test(slug)) {
      return "The web address can only use lowercase letters, numbers and single hyphens (e.g. common-interview-questions).";
    }
    if (editor?.kind === "new" && isReservedSlug(slug)) return "That web address is already used by a built-in article.";
    if (forPublish) {
      if (!draft.description.trim()) return "Add a short description — it's what shows in Google results and on the blog list.";
      if (draft.description.trim().length > MAX_DESCRIPTION_CHARS + 40) {
        return `The description is too long (${draft.description.trim().length} characters). Aim for ${MAX_DESCRIPTION_CHARS} or fewer.`;
      }
      if (draft.body.trim().length < MIN_BODY_CHARS) {
        return `The article is too short to publish (under ${MIN_BODY_CHARS} characters). Save it as a draft for now.`;
      }
    }
    return "";
  };

  const save = async (target: ArticleDoc["status"]) => {
    const problem = validate(target === "published");
    if (problem) {
      setFormError(problem);
      return;
    }

    setSaving(true);
    setFormError("");
    const slug = draft.slug.trim();
    const ref = doc(db, "articles", slug);
    const fields = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      body: draft.body.trim(),
    };

    try {
      if (editor?.kind === "new") {
        const existing = await getDoc(ref);
        if (existing.exists()) {
          setFormError("An article with that web address already exists. Change the web address.");
          setSaving(false);
          return;
        }
        await setDoc(ref, {
          ...fields,
          status: target,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          publishedAt: target === "published" ? serverTimestamp() : null,
        });
        try {
          window.localStorage.removeItem(NEW_DRAFT_KEY);
        } catch {
          /* ignore */
        }
      } else if (editor?.kind === "edit") {
        const current = articles.find((a) => a.slug === slug);
        await updateDoc(ref, {
          ...fields,
          status: target,
          updatedAt: serverTimestamp(),
          // The first publish date is kept if an article is unpublished and published again.
          ...(target === "published" && !current?.publishedAt ? { publishedAt: serverTimestamp() } : {}),
        });
      }

      setNotice(
        target === "published"
          ? `Published — it's live at ${SITE_URL}/blog/${slug}. To help Google find it sooner, paste that address into Search Console → URL Inspection → Request indexing.`
          : "Saved as a draft. It isn't visible on the blog."
      );
      closeEditor();
    } catch (err) {
      console.error("Error saving article:", err);
      setFormError("Couldn't save. Check your connection and that the Firestore rules for articles are deployed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ArticleRow) => {
    if (!window.confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    try {
      await deleteDoc(doc(db, "articles", row.slug));
      setNotice(`Deleted "${row.title}".`);
    } catch (err) {
      console.error("Error deleting article:", err);
      setListError("Couldn't delete that article. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const inputClass =
    "w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
  const descriptionLength = draft.description.trim().length;

  return (
    <div>
      <Helmet>
        <title>Articles — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <div className="max-w-3xl mx-auto p-4 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Articles</h1>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Job listings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {notice && (
          <div className="flex items-start gap-2 p-3 bg-background border border-border rounded-lg text-sm mb-4">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
            <span className="break-words">{notice}</span>
          </div>
        )}

        {listError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{listError}</span>
          </div>
        )}

        {!editor && (
          <>
            <button
              type="button"
              onClick={startNew}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mb-6"
            >
              <Plus className="h-4 w-4" />
              New article
            </button>

            {loading && (
              <div className="flex justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loading && articles.length === 0 && !listError && (
              <p className="text-muted-foreground text-center py-16">No articles yet. Write the first one above.</p>
            )}

            <div className="flex flex-col gap-3">
              {articles.map((row) => (
                <div key={row.slug} className="border border-border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold break-words">{row.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {row.category || "—"} · Updated {formatDate(row.updatedAt)} · {readTimeFor(row.body)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        row.status === "published" ? "bg-red-500 text-white" : "bg-border text-muted-foreground"
                      }`}
                    >
                      {row.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-border rounded-md hover:bg-red-500/5 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {row.status === "published" && (
                      <Link
                        to={`/blog/${row.slug}`}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-border rounded-md hover:bg-red-500/5 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {editor && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{editor.kind === "new" ? "New article" : "Edit article"}</h2>
              <div className="flex items-center gap-3">
                {editor.kind === "new" && (
                  <button
                    type="button"
                    onClick={clearNewDraft}
                    className="flex items-center gap-1.5 text-sm text-destructive/70 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeEditor}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to list
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. How to Answer “Tell Me About Yourself”"
                className={inputClass}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => update({ category: e.target.value })}
                  className={inputClass}
                >
                  {ARTICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Web address {editor.kind === "edit" && "(can't be changed after saving)"}
                </label>
                <input
                  type="text"
                  value={draft.slug}
                  disabled={editor.kind === "edit"}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: slugify(e.target.value) });
                  }}
                  className={`${inputClass} disabled:opacity-60`}
                />
                <p className="text-xs text-muted-foreground break-all">
                  {SITE_URL}/blog/{draft.slug || "…"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Short description (shown on the blog list and in Google results)
                </label>
                <span
                  className={`text-xs ${descriptionLength > MAX_DESCRIPTION_CHARS ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {descriptionLength}/{MAX_DESCRIPTION_CHARS}
                </span>
              </div>
              <textarea
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Article</label>
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {preview ? "Back to editing" : "Preview"}
                </button>
              </div>

              {preview ? (
                <div className="border border-border rounded-md p-5">
                  <h1 className="text-3xl font-bold mb-6 leading-tight">{draft.title || "Untitled"}</h1>
                  {draft.body.trim() ? (
                    <ArticleBody text={draft.body} />
                  ) : (
                    <p className="text-muted-foreground text-sm">Nothing written yet.</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={draft.body}
                  onChange={(e) => update({ body: e.target.value })}
                  rows={20}
                  className={`${inputClass} font-mono resize-y leading-relaxed`}
                />
              )}

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">Formatting help</summary>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  <li>A blank line starts a new paragraph.</li>
                  <li>
                    <code>## Heading</code> and <code>### Smaller heading</code>
                  </li>
                  <li>
                    <code>- item</code> for bullets, <code>1. step</code> for a numbered list
                  </li>
                  <li>
                    <code>&gt; text</code> for a highlighted sample answer or callout
                  </li>
                  <li>
                    <code>**bold**</code> for bold. Web addresses become clickable links automatically.
                  </li>
                </ul>
              </details>
            </div>

            {formError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {editor.kind === "edit" && editor.status === "published" ? (
                <>
                  <button
                    type="button"
                    onClick={() => save("published")}
                    disabled={saving}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => save("draft")}
                    disabled={saving}
                    className="border border-border hover:bg-red-500/5 disabled:opacity-40 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Unpublish (back to draft)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => save("published")}
                    disabled={saving}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {saving ? "Saving..." : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => save("draft")}
                    disabled={saving}
                    className="border border-border hover:bg-red-500/5 disabled:opacity-40 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Save draft
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
