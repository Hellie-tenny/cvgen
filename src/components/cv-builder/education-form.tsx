import type { Education } from "@/lib/cv-types";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      institution: "",
      year: "",
      qualification: "",
    };
    onChange([...data, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(
      data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  return (
    <div className="space-y-6">
      {data.length === 0 && (
        <div className="text-center py-8 text-sidebar-muted">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No education added yet</p>
          <p className="text-sm">Add your educational background</p>
        </div>
      )}

      {data.map((education, index) => (
        <div key={education.id} className="p-4 bg-sidebar-accent/50 border border-sidebar-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sidebar-foreground">Education {index + 1}</h3>
            <button
              onClick={() => removeEducation(education.id)}
              className="p-2 hover:bg-sidebar-accent rounded-md text-sidebar-muted hover:text-destructive transition-colors"
              title="Remove education"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Institution
              </label>
              <input
                type="text"
                value={education.institution}
                onChange={(e) => updateEducation(education.id, "institution", e.target.value)}
                placeholder="Enter institution name"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={education.qualification}
                onChange={(e) => updateEducation(education.id, "qualification", e.target.value)}
                placeholder="e.g. BSc Computer Science"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Year
              </label>
              <input
                type="text"
                value={education.year}
                onChange={(e) => updateEducation(education.id, "year", e.target.value)}
                placeholder="e.g. 2018 or 2016 - 2018"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={addEducation}
        className="w-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 border border-sidebar-border"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
