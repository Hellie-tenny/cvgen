import type { Experience } from "@/lib/cv-types";
import { Plus, Trash2, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onChange([...data, newExperience]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(
      data.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-6">
      {data.length === 0 && (
        <div className="text-center py-8 text-sidebar-muted">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No experience added yet</p>
          <p className="text-sm">Click the button below to add your work history</p>
        </div>
      )}

      {data.map((experience, index) => (
        <div
          key={experience.id}
          className="p-4 bg-sidebar-accent/50 border border-sidebar-border rounded-lg space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-primary">
              Experience {index + 1}
            </span>
            <button
              onClick={() => removeExperience(experience.id)}
              className="p-1.5 text-sidebar-muted hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sidebar-muted" />
                Company
              </label>
              <input
                type="text"
                value={experience.company}
                onChange={(e) =>
                  updateExperience(experience.id, "company", e.target.value)
                }
                placeholder="Company Name"
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground">
                Position
              </label>
              <input
                type="text"
                value={experience.position}
                onChange={(e) =>
                  updateExperience(experience.id, "position", e.target.value)
                }
                placeholder="Job Title"
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sidebar-muted" />
                Start Date
              </label>
              <input
                type="month"
                value={experience.startDate}
                onChange={(e) =>
                  updateExperience(experience.id, "startDate", e.target.value)
                }
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sidebar-muted" />
                End Date
              </label>
              <input
                type="month"
                value={experience.endDate}
                onChange={(e) =>
                  updateExperience(experience.id, "endDate", e.target.value)
                }
                disabled={experience.current}
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={experience.current}
              onChange={(e) =>
                updateExperience(experience.id, "current", e.target.checked)
              }
              className="w-4 h-4 rounded border-sidebar-border text-sidebar-primary focus:ring-sidebar-primary"
            />
            <span className="text-sm text-sidebar-foreground">
              I currently work here
            </span>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">
              Description
            </label>
            <textarea
              value={experience.description}
              onChange={(e) =>
                updateExperience(experience.id, "description", e.target.value)
              }
              placeholder="Describe your responsibilities and achievements..."
              rows={3}
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
            />
          </div>
        </div>
      ))}

      <Button
        onClick={addExperience}
        variant="outline"
        className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
}
