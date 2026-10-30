import { TEMPLATES } from "@/lib/cv-types";
import { cn } from "@/lib/utils";
import { Check, Layout, FileText, Minus, Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { TemplateId } from "@/lib/cv-types";
import { DesignThumb } from "./design-thumb";
import { useTemplates } from "./templates-context";

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (template: TemplateId) => void;
}

const templateIcons: Record<string, ReactNode> = {
  modern: <Layout className="h-5 w-5" />,
  classic: <FileText className="h-5 w-5" />,
  minimal: <Minus className="h-5 w-5" />,
  bold: <Zap className="h-5 w-5" />,
};

const templateColors: Record<string, string> = {
  modern: "bg-blue-500",
  classic: "bg-amber-600",
  minimal: "bg-gray-500",
  bold: "bg-rose-500",
};

const cardClass = (active: boolean) =>
  cn(
    "relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left",
    active
      ? "border-sidebar-primary bg-sidebar-accent"
      : "border-sidebar-border hover:border-sidebar-muted bg-sidebar"
  );

const SelectedTick = () => (
  <div className="absolute top-2 right-2">
    <div className="w-5 h-5 rounded-full bg-sidebar-primary flex items-center justify-center">
      <Check className="h-3 w-3 text-sidebar-primary-foreground" />
    </div>
  </div>
);

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  // Templates added by the admin (published ones only)
  const { templates: custom } = useTemplates();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((template: (typeof TEMPLATES)[number]) => (
          <button
            type="button"
            key={template.id}
            onClick={() => onChange(template.id)}
            className={cardClass(selected === template.id)}
          >
            {selected === template.id && <SelectedTick />}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                templateColors[template.id]
              )}
            >
              {templateIcons[template.id]}
            </div>
            <div>
              <h3 className="font-semibold text-sidebar-foreground">{template.name}</h3>
              <p className="text-xs text-sidebar-muted">{template.description}</p>
            </div>
          </button>
        ))}
      </div>

      {custom.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-sidebar-foreground">More templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {custom.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => onChange(template.id)}
                className={cardClass(selected === template.id)}
              >
                {selected === template.id && <SelectedTick />}
                <DesignThumb design={template.design} className="w-10" />
                <div>
                  <h3 className="font-semibold text-sidebar-foreground">{template.name}</h3>
                  {template.description && <p className="text-xs text-sidebar-muted">{template.description}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
