import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { pdf } from "@react-pdf/renderer";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "@/firebase/config";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { sampleCVData, type CVData } from "@/lib/cv-types";
import {
  ALIGNMENTS,
  DESIGN_PRESETS,
  LIMITS,
  contrastRatio,
  normalizeDesign,
  type TemplateDesign,
} from "@/lib/template-design";
import { CustomCVPreview } from "../components/cv-builder/custom-cv-preview";
import { CustomCVDocument } from "../components/cv-builder/custom-cv-pdf";
import { DesignThumb } from "../components/cv-builder/design-thumb";
import { ScaledPreview } from "../components/cv-builder/scaled-preview";
import {
  btn,
  dangerText,
  Field,
  inputClass,
  Notice,
  PageHeader,
  StatusBadge,
} from "../components/admin/admin-ui";
import {
  ColorControl,
  ControlGroup,
  RangeControl,
  SegmentedControl,
  ToggleControl,
} from "../components/admin/template-controls";

type TemplateStatus = "draft" | "published";

interface TemplateRow {
  id: string;
  name: string;
  description: string;
  status: TemplateStatus;
  design: TemplateDesign;
  createdAt: Timestamp | null;
}

interface EditorState {
  id: string | null;
  name: string;
  description: string;
  status: TemplateStatus;
  design: TemplateDesign;
  /** JSON of the starting values, to tell whether anything changed */
  initial: string;
}

// The CV shown in the editor preview and in the test PDF
const SAMPLE: CVData = { ...sampleCVData, template: "custom" };

const snapshotOf = (name: string, description: string, design: TemplateDesign) =>
  JSON.stringify({ name, description, design });

const startNew = (): EditorState => {
  const design = DESIGN_PRESETS[0].design;
  return { id: null, name: "", description: "", status: "draft", design, initial: snapshotOf("", "", design) };
};

async function downloadTestPdf(design: TemplateDesign) {
  const blob = await pdf(<CustomCVDocument data={SAMPLE} design={design} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "template-test.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminTemplates() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [view, setView] = useState<"design" | "preview">("design");
  const [saving, setSaving] = useState<TemplateStatus | null>(null);
  const [testingPdf, setTestingPdf] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const q = query(collection(db, "cvTemplates"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        setRows(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: typeof data.name === "string" ? data.name : "Untitled",
              description: typeof data.description === "string" ? data.description : "",
              status: data.status === "published" ? "published" : "draft",
              design: normalizeDesign(data.design),
              createdAt: data.createdAt ?? null,
            } as TemplateRow;
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error("Error loading templates:", err);
        setError("Couldn't load templates. Check that the cvTemplates rules are set up.");
        setLoading(false);
      }
    );
  }, []);

  const dirty = editor ? snapshotOf(editor.name, editor.description, editor.design) !== editor.initial : false;

  // ── editor helpers ────────────────────────────────────────────────────────────────────────────────────────
  const patch = <G extends keyof TemplateDesign>(group: G, values: Partial<TemplateDesign[G]>) =>
    setEditor((e) => (e ? { ...e, design: { ...e.design, [group]: { ...e.design[group], ...values } } } : e));

  const openEditor = (row: TemplateRow) => {
    setNotice("");
    setError("");
    setView("design");
    setEditor({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      design: row.design,
      initial: snapshotOf(row.name, row.description, row.design),
    });
  };

  const closeEditor = () => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setEditor(null);
    setError("");
  };

  const save = async (status: TemplateStatus) => {
    if (!editor) return;
    if (!editor.name.trim()) {
      setError("Give the template a name.");
      return;
    }

    setSaving(status);
    setError("");
    try {
      const payload = {
        name: editor.name.trim().slice(0, 60),
        description: editor.description.trim().slice(0, 140),
        status,
        design: normalizeDesign(editor.design),
        updatedAt: serverTimestamp(),
      };
      if (editor.id) {
        await updateDoc(doc(db, "cvTemplates", editor.id), payload);
      } else {
        await addDoc(collection(db, "cvTemplates"), { ...payload, createdAt: serverTimestamp() });
      }
      setNotice(
        status === "published"
          ? `“${payload.name}” is live in the CV builder.`
          : `Saved “${payload.name}” as a draft. It isn't visible to visitors.`
      );
      setEditor(null);
    } catch (err) {
      console.error("Error saving template:", err);
      setError(err instanceof Error ? err.message : "Something went wrong saving that template.");
    } finally {
      setSaving(null);
    }
  };

  const testPdf = async () => {
    if (!editor) return;
    setTestingPdf(true);
    setError("");
    try {
      await downloadTestPdf(normalizeDesign(editor.design));
    } catch (err) {
      console.error("Error generating test PDF:", err);
      setError("Couldn't generate the test PDF.");
    } finally {
      setTestingPdf(false);
    }
  };

  // ── list actions ──────────────────────────────────────────────────────────────────────────────────────────
  const run = async (id: string, action: () => Promise<void>) => {
    setActioningId(id);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (err) {
      console.error("Template action failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActioningId(null);
    }
  };

  const togglePublished = (row: TemplateRow) => {
    if (
      row.status === "published" &&
      !window.confirm(
        `Unpublish “${row.name}”? It disappears from the builder. People who chose it will see the Modern template instead.`
      )
    )
      return;
    return run(row.id, async () => {
      await updateDoc(doc(db, "cvTemplates", row.id), {
        status: row.status === "published" ? "draft" : "published",
        updatedAt: serverTimestamp(),
      });
    });
  };

  const duplicate = (row: TemplateRow) =>
    run(row.id, async () => {
      await addDoc(collection(db, "cvTemplates"), {
        name: `${row.name} (copy)`.slice(0, 60),
        description: row.description,
        status: "draft",
        design: row.design,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNotice(`Duplicated “${row.name}” as a draft.`);
    });

  const remove = (row: TemplateRow) => {
    const extra =
      row.status === "published" ? " It is live, so people who chose it will see the Modern template instead." : "";
    if (!window.confirm(`Delete “${row.name}” permanently? This can't be undone.${extra}`)) return;
    return run(row.id, () => deleteDoc(doc(db, "cvTemplates", row.id)));
  };

  // ── editor view ───────────────────────────────────────────────────────────────────────────────────────────
  if (editor) {
    const { design } = editor;
    const { colors, typography, spacing, layout } = design;
    const sidebar = layout.columns !== "single";

    const warnings: string[] = [];
    if (contrastRatio(colors.foreground, colors.background) < 4.5)
      warnings.push("Body text is hard to read against the page background.");
    if (contrastRatio(colors.primary, colors.background) < 3)
      warnings.push("The primary colour is too close to the page background for headings.");
    if (sidebar && layout.sidebarStyle === "tinted" && contrastRatio(colors.foreground, colors.muted) < 4.5)
      warnings.push("Text is hard to read on the tinted sidebar colour.");
    if (!sidebar && contrastRatio(colors.secondary, colors.background) < 3)
      warnings.push("Dates and contact details (secondary colour) are very faint.");

    return (
      <div>
        <Helmet>
          <title>{editor.id ? "Edit template" : "New template"} — Admin</title>
        </Helmet>

        <button
          type="button"
          onClick={closeEditor}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All templates
        </button>

        <PageHeader
          title={editor.id ? "Edit template" : "New template"}
          description={
            editor.status === "published"
              ? "This template is live. Saving changes updates it for everyone straight away."
              : "Drafts are only visible here."
          }
        />

        {error && (
          <Notice>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </Notice>
        )}

        {/* Phones: switch between the settings and the preview */}
        <div className="lg:hidden mb-4 flex gap-1 p-1 bg-background border border-border rounded-lg w-fit" role="tablist">
          {(["design", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={view === tab}
              onClick={() => setView(tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors max-sm:min-h-10",
                view === tab ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
          <div className={cn("space-y-4", view === "design" ? "block" : "hidden", "lg:block")}>
            <ControlGroup title="Basics">
              <Field label="Name">
                <input
                  type="text"
                  value={editor.name}
                  maxLength={60}
                  placeholder="e.g. Executive"
                  onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Short description (optional)" hint="Shown under the name in the template picker.">
                <input
                  type="text"
                  value={editor.description}
                  maxLength={140}
                  placeholder="e.g. Two columns with a dark sidebar"
                  onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                  className={inputClass}
                />
              </Field>
              {!editor.id && (
                <Field label="Start from" hint="Replaces the design settings below with a starting point you can adjust.">
                  <select
                    defaultValue={DESIGN_PRESETS[0].id}
                    onChange={(e) => {
                      const preset = DESIGN_PRESETS.find((p) => p.id === e.target.value);
                      if (preset) setEditor({ ...editor, design: preset.design });
                    }}
                    className={inputClass}
                  >
                    {DESIGN_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </ControlGroup>

            <ControlGroup title="Layout">
              <SegmentedControl
                label="Columns"
                value={layout.columns}
                options={[
                  { value: "single", label: "Single column" },
                  { value: "sidebar-left", label: "Sidebar left" },
                  { value: "sidebar-right", label: "Sidebar right" },
                ]}
                onChange={(columns) => patch("layout", { columns })}
                hint={sidebar ? "Contact, skills and education go in the sidebar; the name sits at the top of the main column." : undefined}
              />
              {sidebar ? (
                <SegmentedControl
                  label="Sidebar style"
                  value={layout.sidebarStyle}
                  options={[
                    { value: "tinted", label: "Soft tint" },
                    { value: "filled", label: "Bold colour" },
                  ]}
                  onChange={(sidebarStyle) => patch("layout", { sidebarStyle })}
                />
              ) : (
                <>
                  <SegmentedControl
                    label="Header"
                    value={layout.headerStyle}
                    options={[
                      { value: "plain", label: "Plain" },
                      { value: "band", label: "Colour banner" },
                    ]}
                    onChange={(headerStyle) => patch("layout", { headerStyle })}
                  />
                  {layout.headerStyle === "plain" && (
                    <ToggleControl
                      label="Line under the header"
                      checked={layout.showDividers}
                      onChange={(showDividers) => patch("layout", { showDividers })}
                    />
                  )}
                </>
              )}
              <SegmentedControl
                label="Name alignment"
                value={layout.headerAlignment}
                options={ALIGNMENTS.map((value) => ({ value, label: value === "left" ? "Left" : "Centre" }))}
                onChange={(headerAlignment) => patch("layout", { headerAlignment })}
              />
              <SegmentedControl
                label="Section titles"
                value={layout.sectionTitleStyle}
                options={[
                  { value: "plain", label: "Plain" },
                  { value: "uppercase", label: "Uppercase" },
                  { value: "underline", label: "Underlined" },
                ]}
                onChange={(sectionTitleStyle) => patch("layout", { sectionTitleStyle })}
              />
              <SegmentedControl
                label="Skills"
                value={layout.skillStyle}
                options={[
                  { value: "bar", label: "Bars" },
                  { value: "tag", label: "Tags" },
                  { value: "inline", label: "Simple list" },
                ]}
                onChange={(skillStyle) => patch("layout", { skillStyle })}
                hint="Tags and the simple list show skill names only, without levels."
              />
              <SegmentedControl
                label="Experience"
                value={layout.experienceStyle}
                options={[
                  { value: "timeline", label: "Timeline" },
                  { value: "standard", label: "Standard" },
                  { value: "compact", label: "Compact" },
                ]}
                onChange={(experienceStyle) => patch("layout", { experienceStyle })}
              />
            </ControlGroup>

            <ControlGroup title="Colours">
              <div className="grid sm:grid-cols-2 gap-4">
                <ColorControl label="Primary" hint="Headings, company names, skill bars" value={colors.primary} onChange={(primary) => patch("colors", { primary })} />
                <ColorControl label="Page background" value={colors.background} onChange={(background) => patch("colors", { background })} />
                <ColorControl label="Body text" value={colors.foreground} onChange={(foreground) => patch("colors", { foreground })} />
                <ColorControl label="Secondary text" hint="Dates, contact details" value={colors.secondary} onChange={(secondary) => patch("colors", { secondary })} />
                <ColorControl label="Accent tint" hint="Timeline line, tags, underlines" value={colors.accent} onChange={(accent) => patch("colors", { accent })} />
                <ColorControl label="Soft fill" hint="Tinted sidebar" value={colors.muted} onChange={(muted) => patch("colors", { muted })} />
                <ColorControl label="Lines" hint="Dividers, skill-bar tracks" value={colors.border} onChange={(border) => patch("colors", { border })} />
              </div>
              {warnings.length > 0 && (
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1" role="status">
                  {warnings.map((warning) => (
                    <li key={warning} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </ControlGroup>

            <ControlGroup title="Type" description="Fonts are limited to three families so the PDF always matches the preview.">
              <div className="grid sm:grid-cols-2 gap-4">
                <SegmentedControl
                  label="Heading font"
                  value={typography.headingFont}
                  options={[
                    { value: "sans-serif", label: "Sans" },
                    { value: "serif", label: "Serif" },
                    { value: "mono", label: "Mono" },
                  ]}
                  onChange={(headingFont) => patch("typography", { headingFont })}
                />
                <SegmentedControl
                  label="Body font"
                  value={typography.bodyFont}
                  options={[
                    { value: "sans-serif", label: "Sans" },
                    { value: "serif", label: "Serif" },
                    { value: "mono", label: "Mono" },
                  ]}
                  onChange={(bodyFont) => patch("typography", { bodyFont })}
                />
              </div>
              <ToggleControl label="Bold headings and name" checked={typography.headingBold} onChange={(headingBold) => patch("typography", { headingBold })} />
              <RangeControl label="Name size" value={typography.nameSize} min={LIMITS.nameSize[0]} max={LIMITS.nameSize[1]} onChange={(nameSize) => patch("typography", { nameSize })} />
              <RangeControl label="Section title size" value={typography.headingSize} min={LIMITS.headingSize[0]} max={LIMITS.headingSize[1]} onChange={(headingSize) => patch("typography", { headingSize })} />
              <RangeControl label="Body text size" value={typography.bodySize} min={LIMITS.bodySize[0]} max={LIMITS.bodySize[1]} onChange={(bodySize) => patch("typography", { bodySize })} />
            </ControlGroup>

            <ControlGroup title="Spacing">
              <RangeControl label="Page margin" value={spacing.padding} min={LIMITS.padding[0]} max={LIMITS.padding[1]} onChange={(padding) => patch("spacing", { padding })} />
              <RangeControl label="Space between sections" value={spacing.sectionGap} min={LIMITS.sectionGap[0]} max={LIMITS.sectionGap[1]} onChange={(sectionGap) => patch("spacing", { sectionGap })} />
              <RangeControl label="Space between entries" value={spacing.itemGap} min={LIMITS.itemGap[0]} max={LIMITS.itemGap[1]} onChange={(itemGap) => patch("spacing", { itemGap })} />
            </ControlGroup>
          </div>

          {/* Live preview: beside the settings on desktop, its own tab on phones */}
          <div className={cn("lg:sticky lg:top-20", view === "preview" ? "block" : "hidden", "lg:block")}>
            <ScaledPreview>
              <CustomCVPreview data={SAMPLE} design={design} />
            </ScaledPreview>
            <p className="text-xs text-muted-foreground mt-2">
              Preview with sample content. Use “Test PDF” to check the real PDF before publishing.
            </p>
          </div>
        </div>

        {/* Save bar: sits above the phone tab bar */}
        <div className="above-tabbar-gap sticky bottom-4 z-20 mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-lg">
          {editor.status === "published" ? (
            <>
              <button type="button" onClick={() => save("published")} disabled={saving !== null} className={btn("primary")}>
                {saving === "published" && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
              <button type="button" onClick={() => save("draft")} disabled={saving !== null} className={btn("secondary")}>
                {saving === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
                Unpublish
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => save("published")} disabled={saving !== null} className={btn("approve")}>
                {saving === "published" && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish
              </button>
              <button type="button" onClick={() => save("draft")} disabled={saving !== null} className={btn("secondary")}>
                {saving === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
                Save draft
              </button>
            </>
          )}
          <button type="button" onClick={testPdf} disabled={testingPdf} className={cn(btn("ghost"), "ml-auto")}>
            {testingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Test PDF
          </button>
        </div>
      </div>
    );
  }

  // ── list view ─────────────────────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Helmet>
        <title>Templates — Admin</title>
      </Helmet>

      <PageHeader
        title="CV templates"
        description="Design extra templates for the CV builder. Published ones appear next to the built-in Modern, Classic, Minimal and Bold."
        action={
          <button
            type="button"
            onClick={() => {
              setNotice("");
              setError("");
              setView("design");
              setEditor(startNew());
            }}
            className={btn("primary")}
          >
            <Plus className="h-4 w-4" />
            <span className="max-sm:sr-only">New template</span>
          </button>
        }
      />

      {notice && (
        <Notice tone="success">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{notice}</span>
        </Notice>
      )}
      {error && (
        <Notice>
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </Notice>
      )}

      {loading && (
        <div className="space-y-2" aria-busy="true" aria-label="Loading templates">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-lg" />
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No templates yet.</p>
          <button type="button" onClick={() => setEditor(startNew())} className={cn(btn("primary"), "mt-4")}>
            <Plus className="h-4 w-4" />
            Create your first template
          </button>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row) => {
          const busy = actioningId === row.id;
          return (
            <div key={row.id} className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <DesignThumb design={row.design} className="w-14" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-medium truncate">{row.name}</h2>
                    <StatusBadge status={row.status} />
                  </div>
                  {row.description && <p className="text-sm text-muted-foreground mt-0.5">{row.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {row.design.layout.columns === "single" ? "Single column" : "Two columns"} ·{" "}
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full align-middle border border-border"
                      style={{ background: row.design.colors.primary }}
                    />{" "}
                    {row.design.colors.primary}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 mt-3 pt-3 border-t border-border">
                <button type="button" onClick={() => openEditor(row)} disabled={busy} className={btn("secondary", "sm")}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button type="button" onClick={() => togglePublished(row)} disabled={busy} className={btn("ghost", "sm")}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : row.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {row.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button type="button" onClick={() => duplicate(row)} disabled={busy} className={btn("ghost", "sm")}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  disabled={busy}
                  className={cn(btn("ghost", "sm"), dangerText, "ml-auto hover:text-red-700 hover:bg-red-600/10")}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
