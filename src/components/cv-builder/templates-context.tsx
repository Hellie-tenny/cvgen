import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { isBuiltInTemplate } from "@/lib/cv-types";
import { normalizeDesign, type PublishedTemplate, type TemplateDesign } from "@/lib/template-design";

/*
  Loads the admin-made templates that are published. Wrap the CV builder in <TemplatesProvider>.

  - The last good list is cached in localStorage, so a returning visitor's chosen template shows instantly
    (no flash of another template) and the builder still works offline or if the database is unreachable.
  - Every template is validated by normalizeDesign() on the way in, so bad data can't break the page.
  - Used outside a provider, the hooks simply report "no custom templates", and the built-in ones are used.
*/

const CACHE_KEY = "etiquette:cv-templates:v1";

interface TemplatesContextValue {
  templates: PublishedTemplate[];
  loaded: boolean;
}

const TemplatesContext = createContext<TemplatesContextValue>({ templates: [], loaded: true });

function parseTemplate(id: string, raw: Record<string, unknown>): PublishedTemplate | null {
  if (typeof raw.name !== "string" || !raw.name.trim()) return null;
  return {
    id,
    name: raw.name.trim().slice(0, 60),
    description: typeof raw.description === "string" ? raw.description.slice(0, 140) : "",
    design: normalizeDesign(raw.design),
    createdAtSeconds: typeof raw.createdAtSeconds === "number" ? raw.createdAtSeconds : 0,
  };
}

function readCache(): PublishedTemplate[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (item && typeof item.id === "string" ? parseTemplate(item.id, item) : null))
      .filter((item): item is PublishedTemplate => item !== null);
  } catch {
    return [];
  }
}

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<PublishedTemplate[]>(readCache);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getDocs(query(collection(db, "cvTemplates"), where("status", "==", "published")))
      .then((snapshot) => {
        if (cancelled) return;
        const list = snapshot.docs
          .map((d) => {
            const data = d.data();
            return parseTemplate(d.id, { ...data, createdAtSeconds: data.createdAt?.seconds ?? 0 });
          })
          .filter((item): item is PublishedTemplate => item !== null)
          // Sorted here rather than in the query, so no database index is needed.
          .sort((a, b) => a.createdAtSeconds - b.createdAtSeconds);

        setTemplates(list);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {
          /* storage full or blocked: not a problem */
        }
      })
      .catch((err) => console.error("Could not load CV templates:", err))
      .finally(() => !cancelled && setLoaded(true));

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ templates, loaded }), [templates, loaded]);
  return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>;
}

/* eslint-disable react-refresh/only-export-components */
export const useTemplates = () => useContext(TemplatesContext);

/** The design for an admin-made template id, or null for built-in templates and unknown/unpublished ids. */
export function useTemplateDesign(templateId: string): TemplateDesign | null {
  const { templates } = useTemplates();
  if (isBuiltInTemplate(templateId)) return null;
  return templates.find((template) => template.id === templateId)?.design ?? null;
}
