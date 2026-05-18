import type { PersonalInfo } from "@/lib/cv-types";
import { User, Mail, Phone, MapPin, Briefcase } from "lucide-react";

interface PersonalFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function PersonalForm({ data, onChange }: PersonalFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-sidebar-muted" />
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-sidebar-muted" />
          Professional Title
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
          placeholder="Enter professional title e.g Accountant"
          className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-sidebar-muted" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-sidebar-muted" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sidebar-muted" />
          Address
        </label>
        <input
          type="text"
          name="location"
          value={data.location}
          onChange={handleChange}
          placeholder="Enter your address"
          className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-sidebar-foreground">
          Professional Summary
        </label>
        <textarea
          name="summary"
          value={data.summary}
          onChange={handleChange}
          placeholder="A brief overview of your professional background..."
          rows={4}
          className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
        />
      </div>
    </div>
  );
}
