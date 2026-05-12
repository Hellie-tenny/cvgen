import type { Reference } from "@/lib/cv-types";
import { Plus, Trash2, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferencesFormProps {
  data: Reference[];
  onChange: (data: Reference[]) => void;
}

export function ReferencesForm({ data, onChange }: ReferencesFormProps) {
  const addReference = () => {
    const newReference: Reference = {
      id: crypto.randomUUID(),
      name: "",
      organization: "",
      position: "",
      phone: "",
    };
    onChange([...data, newReference]);
  };

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    onChange(
      data.map((ref) =>
        ref.id === id ? { ...ref, [field]: value } : ref
      )
    );
  };

  const removeReference = (id: string) => {
    onChange(data.filter((ref) => ref.id !== id));
  };

  return (
    <div className="space-y-6">
      {data.length === 0 && (
        <div className="text-center py-8 text-sidebar-muted">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No references added yet</p>
          <p className="text-sm">Add professional references to strengthen your CV</p>
        </div>
      )}

      {data.map((reference, index) => (
        <div
          key={reference.id}
          className="p-4 bg-sidebar-accent/50 border border-sidebar-border rounded-lg space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sidebar-foreground">Reference {index + 1}</h3>
            <button
              onClick={() => removeReference(reference.id)}
              className="p-2 hover:bg-sidebar-accent rounded-md text-sidebar-muted hover:text-destructive transition-colors"
              title="Remove reference"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Name
              </label>
              <input
                type="text"
                value={reference.name}
                onChange={(e) => updateReference(reference.id, "name", e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Organization
              </label>
              <input
                type="text"
                value={reference.organization}
                onChange={(e) => updateReference(reference.id, "organization", e.target.value)}
                placeholder="Acme Corporation"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sidebar-foreground block mb-1">
                Position
              </label>
              <input
                type="text"
                value={reference.position}
                onChange={(e) => updateReference(reference.id, "position", e.target.value)}
                placeholder="Project Manager"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-sidebar-muted" />
                Phone Number
              </label>
              <input
                type="tel"
                value={reference.phone}
                onChange={(e) => updateReference(reference.id, "phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={addReference}
        className="w-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 border border-sidebar-border"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Reference
      </Button>
    </div>
  );
}
