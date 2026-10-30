import type { CSSProperties, ReactNode } from "react";
import type { CVData } from "@/lib/cv-types";
import {
  CSS_FONTS,
  PT,
  SIDEBAR_WIDTH_PT,
  A4_WIDTH_PT,
  resolveTheme,
  type RegionColors,
  type TemplateDesign,
} from "@/lib/template-design";
import { buildCVModel, planSections, PLACEHOLDERS, type CVModel, type SectionKey } from "@/lib/cv-model";

const SIDEBAR_PERCENT = (SIDEBAR_WIDTH_PT / A4_WIDTH_PT) * 100;

/**
 * On-screen preview of an admin-made template. It draws the same content and the same theme as the PDF version
 * (custom-cv-pdf.tsx); sizes are PDF points converted to preview pixels with PT.
 */
export function CustomCVPreview({ data, design }: { data: CVData; design: TemplateDesign }) {
  const model = buildCVModel(data);
  const theme = resolveTheme(design);
  const plan = planSections(design.layout);
  const { colors: c, typography: t, spacing: sp, layout: l } = design;

  const px = (pt: number) => `${(pt * PT).toFixed(2)}px`;
  const bodyFont = CSS_FONTS[t.bodyFont];
  const headingFont = CSS_FONTS[t.headingFont];
  const headingWeight = t.headingBold ? 700 : 400;
  const upper = l.sectionTitleStyle === "uppercase";
  const underline = l.sectionTitleStyle === "underline";
  const center = l.headerAlignment === "center";

  // ── pieces ────────────────────────────────────────────────────────────────────────────────────────────────
  const sectionTitle = (text: string, region: RegionColors) => (
    <h2
      style={{
        fontFamily: headingFont,
        fontSize: px(t.headingSize),
        fontWeight: headingWeight,
        color: region.title,
        textTransform: upper ? "uppercase" : "none",
        letterSpacing: upper ? "0.1em" : "normal",
        margin: `0 0 ${px(6)}`,
        paddingBottom: underline ? px(3) : 0,
        borderBottom: underline ? `${px(1)} solid ${region.rule}` : "none",
        lineHeight: 1.25,
      }}
    >
      {text}
    </h2>
  );

  const muted = (region: RegionColors, size = 0.9): CSSProperties => ({
    color: region.muted,
    fontSize: px(t.bodySize * size),
  });

  const placeholder = (text: string, region: RegionColors) => (
    <p style={{ margin: 0, color: region.muted }}>{text}</p>
  );

  const renderSection = (key: SectionKey, region: RegionColors, inSidebar: boolean): ReactNode => {
    const gap = px(sp.sectionGap);
    const itemGap = px(sp.itemGap);

    switch (key) {
      case "contact":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("Contact", region)}
            {model.contact.map((line) => (
              <p key={line} style={{ margin: `0 0 ${px(3)}`, wordBreak: "break-word", ...muted(region, 1) }}>
                {line}
              </p>
            ))}
          </section>
        );

      case "summary":
        if (!model.summary) return null;
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("About", region)}
            <p style={{ margin: 0, lineHeight: 1.5 }}>{model.summary}</p>
          </section>
        );

      case "experience":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("Experience", region)}
            {model.has.experience ? (
              model.experiences.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    marginBottom: itemGap,
                    ...(l.experienceStyle === "timeline"
                      ? { paddingLeft: px(10), borderLeft: `${px(2)} solid ${region.rule}` }
                      : {}),
                  }}
                >
                  {l.experienceStyle === "compact" ? (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: px(8), alignItems: "baseline" }}>
                      <span>
                        <strong style={{ fontWeight: 700 }}>{exp.position}</strong>
                        <span style={{ color: c.primary, fontWeight: 700 }}> · {exp.company}</span>
                      </span>
                      <span style={{ ...muted(region), whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: px(8), alignItems: "baseline", marginBottom: px(2) }}>
                        <strong style={{ fontWeight: 700 }}>{exp.position}</strong>
                        <span style={{ ...muted(region), whiteSpace: "nowrap" }}>{exp.dates}</span>
                      </div>
                      <p style={{ margin: `0 0 ${px(4)}`, color: c.primary, fontWeight: 700 }}>{exp.company}</p>
                    </>
                  )}
                  {exp.description && (
                    <p style={{ margin: l.experienceStyle === "compact" ? `${px(2)} 0 0` : 0, lineHeight: 1.45, color: region.text }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              placeholder(PLACEHOLDERS.experience, region)
            )}
          </section>
        );

      case "skills":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("Skills", region)}
            {!model.has.skills ? (
              placeholder(PLACEHOLDERS.skills, region)
            ) : l.skillStyle === "tag" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: px(5) }}>
                {model.skills.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      background: region.tagBg,
                      color: region.tagText,
                      fontSize: px(t.bodySize * 0.9),
                      fontWeight: 700,
                      padding: `${px(2)} ${px(7)}`,
                      borderRadius: px(10),
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            ) : l.skillStyle === "inline" ? (
              <p style={{ margin: 0, lineHeight: 1.5 }}>{model.skills.map((s) => s.name).join("  •  ")}</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: inSidebar ? "1fr" : "1fr 1fr",
                  columnGap: px(16),
                  rowGap: px(7),
                }}
              >
                {model.skills.map((s) => (
                  <div key={s.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: px(3) }}>
                      <strong style={{ fontWeight: 700 }}>{s.name}</strong>
                      {!inSidebar && <span style={muted(region, 0.8)}>{s.level}</span>}
                    </div>
                    <div style={{ height: px(4), background: region.track, borderRadius: px(2) }}>
                      <div style={{ height: "100%", width: `${s.percent}%`, background: region.fill, borderRadius: px(2) }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "education":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("Education", region)}
            {model.has.education ? (
              model.educations.map((edu) => (
                <div key={edu.id} style={{ marginBottom: px(8) }}>
                  <strong style={{ fontWeight: 700, display: "block" }}>{edu.institution}</strong>
                  {edu.qualification && <span style={{ display: "block", color: region.text }}>{edu.qualification}</span>}
                  <span style={{ display: "block", ...muted(region) }}>{edu.year}</span>
                </div>
              ))
            ) : (
              placeholder(PLACEHOLDERS.education, region)
            )}
          </section>
        );

      case "references":
        if (!model.has.references) return null;
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle("References", region)}
            {model.references.map((ref) => (
              <div key={ref.id} style={{ marginBottom: px(8) }}>
                <strong style={{ fontWeight: 700, display: "block" }}>{ref.name}</strong>
                <span style={{ display: "block", ...muted(region) }}>{ref.position}</span>
                <span style={{ display: "block", ...muted(region) }}>{ref.organization}</span>
                <span style={{ display: "block", ...muted(region) }}>{ref.phone}</span>
              </div>
            ))}
          </section>
        );
    }
  };

  /** Name, title and (for single column) contact details */
  const renderHeader = (m: CVModel, band: boolean) => {
    const nameColor = band ? theme.band.text : c.foreground;
    const titleColor = band ? theme.band.text : c.primary;
    const contactColor = band ? theme.band.muted : c.secondary;
    return (
      <header
        style={{
          textAlign: center ? "center" : "left",
          ...(band
            ? { background: theme.band.bg, padding: px(sp.padding), marginBottom: px(sp.sectionGap) }
            : l.showDividers
              ? { borderBottom: `${px(1)} solid ${c.border}`, paddingBottom: px(sp.sectionGap), marginBottom: px(sp.sectionGap) }
              : { marginBottom: px(sp.sectionGap) }),
        }}
      >
        <h1
          style={{
            margin: `0 0 ${px(4)}`,
            fontFamily: headingFont,
            fontSize: px(t.nameSize),
            fontWeight: headingWeight,
            color: nameColor,
            lineHeight: 1.15,
          }}
        >
          {m.name}
        </h1>
        {m.title && (
          <p style={{ margin: `0 0 ${px(8)}`, fontSize: px(t.bodySize * 1.4), fontWeight: 700, color: titleColor }}>{m.title}</p>
        )}
        {plan.side === null && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: `${px(2)} ${px(14)}`,
              justifyContent: center ? "center" : "flex-start",
              fontSize: px(t.bodySize * 0.9),
              color: contactColor,
            }}
          >
            {m.contact.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}
      </header>
    );
  };

  // ── page ──────────────────────────────────────────────────────────────────────────────────────────────────
  const pageStyle: CSSProperties = {
    width: "100%",
    aspectRatio: "210 / 297",
    maxHeight: "calc(100dvh - 120px)",
    overflow: "auto",
    background: c.background,
    color: c.foreground,
    fontFamily: bodyFont,
    fontSize: px(t.bodySize),
    lineHeight: 1.3,
  };

  if (plan.side) {
    const sidebarPad = Math.round(sp.padding * 0.7);
    return (
      <div className="shadow-lg rounded-lg overflow-hidden" style={{ background: c.background }}>
        <div
          data-cv-page
          style={{ ...pageStyle, display: "flex", flexDirection: plan.side === "left" ? "row" : "row-reverse" }}
        >
          <aside
            style={{
              width: `${SIDEBAR_PERCENT}%`,
              flexShrink: 0,
              background: theme.sidebar.bg,
              color: theme.sidebar.text,
              padding: `${px(sp.padding)} ${px(sidebarPad)}`,
              boxSizing: "border-box",
            }}
          >
            {plan.sidebar.map((key) => renderSection(key, theme.sidebar, true))}
          </aside>
          <div style={{ flex: 1, minWidth: 0, padding: px(sp.padding), boxSizing: "border-box" }}>
            {renderHeader(model, false)}
            {plan.main.map((key) => renderSection(key, theme.main, false))}
          </div>
        </div>
      </div>
    );
  }

  const band = l.headerStyle === "band";
  const sections = plan.main.map((key) => renderSection(key, theme.main, false));
  return (
    <div className="shadow-lg rounded-lg overflow-hidden" style={{ background: c.background }}>
      <div data-cv-page style={pageStyle}>
        {band ? (
          <>
            {renderHeader(model, true)}
            <div style={{ padding: `0 ${px(sp.padding)} ${px(sp.padding)}` }}>{sections}</div>
          </>
        ) : (
          <div style={{ padding: px(sp.padding) }}>
            {renderHeader(model, false)}
            {sections}
          </div>
        )}
      </div>
    </div>
  );
}
