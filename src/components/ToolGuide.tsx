import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// A standalone "how it works" page for a tool (CV builder, cover letter writer). It lives on its own URL so the
// tool pages can stay uncluttered, while this page gives visitors and search engines real content.
// Safe to run ads on, unlike the tool pages themselves.

interface ToolGuideProps {
  heading: string;
  intro: string;
  /** Button that takes the reader to the tool */
  cta: { to: string; label: string };
  stepsHeading: string;
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  children?: ReactNode;
}

const ctaClass =
  "inline-flex items-center justify-center bg-brand hover:bg-brand-hover active:scale-95 transition-all text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-brand/20 whitespace-nowrap";

export default function ToolGuide({ heading, intro, cta, stepsHeading, steps, faqs, children }: ToolGuideProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{heading}</h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-6">{intro}</p>
      <Link to={cta.to} className={ctaClass}>
        {cta.label}
      </Link>

      <h2 className="text-2xl font-semibold mt-14 mb-4">{stepsHeading}</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-12 text-muted-foreground leading-relaxed">
        {steps.map((step) => (
          <li key={step.title}>
            <span className="font-medium text-foreground">{step.title}.</span> {step.text}
          </li>
        ))}
      </ol>

      {children}

      <h2 className="text-2xl font-semibold mb-4">Frequently asked questions</h2>
      <div className="flex flex-col gap-6 mb-12">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <h3 className="font-semibold mb-1">{faq.q}</h3>
            <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-8">
        <Link to={cta.to} className={ctaClass}>
          {cta.label}
        </Link>
      </div>
    </article>
  );
}
