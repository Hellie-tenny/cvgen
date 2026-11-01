import type { Language } from "@/lib/cv-types";
import { Plus, Trash2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LanguagesFormProps {
  data: Language[];
  onChange: (data: Language[]) => void;
}

const LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

export function LanguagesForm({ data, onChange }: LanguagesFormProps) {
  const addLanguage = () => onChange([...data, { id: crypto.randomUUID(), name: "", level: "Fluent" }]);

  const updateLanguage = (id: string, field: keyof Language, value: string) =>
    onChange(data.map((language) => (language.id === id ? { ...language, [field]: value } : language)));

  const removeLanguage = (id: string) => onChange(data.filter((language) => language.id !== id));

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <div className="text-center py-8 text-sidebar-muted">
          <Languages className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No languages added yet</p>
          <p className="text-sm">Add the languages you speak. Templates with a Languages section will show them.</p>
        </div>
      )}

      {data.map((language) => (
        <div
          key={language.id}
          className="flex items-center gap-3 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg"
        >
          <input
            type="text"
            value={language.name}
            onChange={(e) => updateLanguage(language.id, "name", e.target.value)}
            placeholder="Language"
            className="min-w-0 flex-1 px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          />
          <select
            value={language.level}
            onChange={(e) => updateLanguage(language.id, "level", e.target.value)}
            className="px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeLanguage(language.id)}
            className="p-1.5 text-sidebar-muted hover:text-destructive transition-colors"
            aria-label="Remove language"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        onClick={addLanguage}
        variant="outline"
        className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Language
      </Button>
    </div>
  );
}
