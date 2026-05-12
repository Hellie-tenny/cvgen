import type { Skill } from "@/lib/cv-types";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const SKILL_LEVELS: Skill["level"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const addSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "",
      level: "Intermediate",
    };
    onChange([...data, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    onChange(
      data.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((skill) => skill.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <div className="text-center py-8 text-sidebar-muted">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No skills added yet</p>
          <p className="text-sm">Showcase your expertise by adding skills</p>
        </div>
      )}

      {data.map((skill, index) => (
        <div
          key={skill.id}
          className="flex items-center gap-3 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg"
        >
          <span className="text-sm text-sidebar-muted w-6">{index + 1}.</span>
          <input
            type="text"
            value={skill.name}
            onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
            placeholder="Skill name"
            className="flex-1 px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          />
          <select
            value={skill.level}
            onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
            className="px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            onClick={() => removeSkill(skill.id)}
            className="p-1.5 text-sidebar-muted hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        onClick={addSkill}
        variant="outline"
        className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>
    </div>
  );
}
