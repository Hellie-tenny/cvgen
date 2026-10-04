import type { ReactNode } from "react";

// Plain-language explanation shown under a tool page (CV builder, cover letter writer), so the page has
// real content for visitors and for search engines. No ads go on these pages.

interface ToolInfoProps {
  heading: string;
  intro: string;
  stepsHeading: string;
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  children?: ReactNode;
}

export default function ToolInfo({ heading, intro, stepsHeading, steps, faqs, children }: ToolInfoProps) {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 border-t border-red-500/10">
      <h2 className="text-2xl font-semibold mb-4">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed mb-10">{intro}</p>

      <h2 className="text-2xl font-semibold mb-4">{stepsHeading}</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-10 text-muted-foreground leading-relaxed">
        {steps.map((step) => (
          <li key={step.title}>
            <span className="font-medium text-foreground">{step.title}.</span> {step.text}
          </li>
        ))}
      </ol>

      {children}

      <h2 className="text-2xl font-semibold mb-4">Frequently asked questions</h2>
      <div className="flex flex-col gap-6">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <h3 className="font-semibold mb-1">{faq.q}</h3>
            <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
