import type { CSSProperties, ReactNode } from "react";
import type { CVData } from "@/lib/cv-types";
import {
  A4_WIDTH_PT,
  CSS_FONTS,
  PT,
  resolveTheme,
  sidebarWidthPt,
  type RegionColors,
  type SectionSetting,
  type TemplateDesign,
} from "@/lib/template-design";
import { buildCVModel, descriptionLines, planSections, skillDots, PLACEHOLDERS, type CVModel } from "@/lib/cv-model";

/**
 * On-screen preview of an admin-made template. It draws the same content and the same theme as the PDF version
 * (custom-cv-pdf.tsx); sizes are PDF points converted to preview pixels with PT.
 */
export function CustomCVPreview({ data, design }: { data: CVData; design: TemplateDesign }) {
  const model = buildCVModel(data);
  const theme = resolveTheme(design);
  const plan = planSections(design);
  const { colors: c, typography: t, spacing: sp, layout: l } = design;

  const px = (pt: number) => `${(pt * PT).toFixed(2)}px`;
  const bodyFont = CSS_FONTS[t.bodyFont];
  const headingFont = CSS_FONTS[t.headingFont];
  const headingWeight = t.headingBold ? 700 : 400;
  const upper = l.sectionTitleStyle === "uppercase";
  const underline = l.sectionTitleStyle === "underline";
  const sidebarPt = sidebarWidthPt(l);
  const sidebarPercent = (sidebarPt / A4_WIDTH_PT) * 100;

  // ── pieces ────────────────────────────────────────────────────────────────────────────────────────────────
  const sectionTitle = (text: string, region: RegionColors) => (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
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
      {l.titleMarker !== "none" && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            flexShrink: 0,
            marginRight: px(6),
            background: region.title,
            width: px(l.titleMarker === "bar" ? 3 : 6),
            height: px(l.titleMarker === "bar" ? t.headingSize * 1.1 : 6),
            borderRadius: l.titleMarker === "dot" ? "50%" : px(1),
          }}
        />
      )}
      <span>{text}</span>
    </h2>
  );

  const muted = (region: RegionColors, size = 0.9): CSSProperties => ({
    color: region.muted,
    fontSize: px(t.bodySize * size),
  });

  const placeholder = (text: string, region: RegionColors) => (
    <p style={{ margin: 0, color: region.muted }}>{text}</p>
  );

  /** A paragraph that keeps the line breaks people typed, or one bullet per line */
  const paragraph = (text: string, extra: CSSProperties = {}) => {
    if (l.bulletDescriptions) {
      const lines = descriptionLines(text);
      return (
        <div style={extra}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: px(5), lineHeight: t.lineHeight, marginBottom: px(1.5) }}>
              <span style={{ width: px(6), flexShrink: 0 }}>•</span>
              <span style={{ flex: 1, minWidth: 0 }}>{line}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p style={{ margin: 0, lineHeight: t.lineHeight, whiteSpace: "pre-line", ...extra }}>{text}</p>;
  };

  const renderSection = (section: SectionSetting, region: RegionColors, inSidebar: boolean): ReactNode => {
    const gap = px(sp.sectionGap);
    const itemGap = px(sp.itemGap);
    const key = section.key;

    switch (key) {
      case "contact":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle(section.title, region)}
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
            {sectionTitle(section.title, region)}
            <p style={{ margin: 0, lineHeight: t.lineHeight, whiteSpace: "pre-line" }}>{model.summary}</p>
          </section>
        );

      case "experience":
        return (
          <section key={key} style={{ marginBottom: gap }}>
            {sectionTitle(section.title, region)}
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
                  ) : l.datesPosition === "below" ? (
                    <>
                      <strong style={{ fontWeight: 700, display: "block" }}>{exp.position}</strong>
                      <p style={{ margin: `${px(1)} 0 0`, color: c.primary, fontWeight: 700 }}>{exp.company}</p>
                      <p style={{ margin: `${px(1)} 0 ${px(4)}`, ...muted(region) }}>{exp.dates}</p>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: px(8), alignItems: "baseline", marginBottom: px(2) }}>
                        <strong style={{ fontWeight: 700 }}>{exp.position}</strong>
                        <span style={{ ...muted(region), whiteSpace: "nowrap" }}>{exp.dates}</span>
                      </div>
                      <p style={{ margin: `0 0 ${px(4)}`, color: c.primary, fontWeight: 700 }}>{exp.company}</p>
                    </>
                  )}
                  {exp.description && paragraph(exp.description, { marginTop: l.experienceStyle === "compact" ? px(2) : 0, color: region.text })}
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
            {sectionTitle(section.title, region)}
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
              <p style={{ margin: 0, lineHeight: t.lineHeight }}>{model.skills.map((s) => s.name).join("  •  ")}</p>
            ) : l.skillStyle === "list" ? (
              <div>
                {model.skills.map((s) => (
                  <div key={s.id} style={{ display: "flex", gap: px(5), marginBottom: px(2) }}>
                    <span style={{ width: px(6), flexShrink: 0 }}>•</span>
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            ) : l.skillStyle === "dots" ? (
              <div style={{ display: "grid", gridTemplateColumns: inSidebar ? "1fr" : "1fr 1fr", columnGap: px(16), rowGap: px(5) }}>
                {model.skills.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: px(6) }}>
                    <strong style={{ fontWeight: 700 }}>{s.name}</strong>
                    <span style={{ display: "flex", gap: px(3), flexShrink: 0 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          style={{
                            width: px(5),
                            height: px(5),
                            borderRadius: "50%",
                            background: n <= skillDots(s.percent) ? region.fill : region.track,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: inSidebar ? "1fr" : "1fr 1fr", columnGap: px(16), rowGap: px(7) }}>
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
            {sectionTitle(section.title, region)}
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
            {sectionTitle(section.title, region)}
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

  /** Name, title and (single column) contact details */
  const renderHeader = (m: CVModel, band: boolean) => {
    const nameColor = band ? theme.band.text : c.foreground;
    const titleColor = band
      ? theme.band.text
      : l.titleStyle === "primary"
        ? c.primary
        : l.titleStyle === "muted"
          ? c.secondary
          : c.foreground;
    const contactColor = band ? theme.band.muted : c.secondary;

    const contactLines = plan.contactInHeader ? m.contact : [];
    const split = l.headerLayout === "split" && contactLines.length > 0;
    const centered = l.headerAlignment === "center" && !split;
    const nameUpper = l.nameCase === "uppercase";

    const nameBlock = (
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            margin: `0 0 ${px(4)}`,
            fontFamily: headingFont,
            fontSize: px(t.nameSize),
            fontWeight: headingWeight,
            color: nameColor,
            lineHeight: 1.15,
            textTransform: nameUpper ? "uppercase" : "none",
            letterSpacing: nameUpper ? "0.04em" : "normal",
          }}
        >
          {m.name}
        </h1>
        {m.title && (
          <p style={{ margin: split ? 0 : `0 0 ${px(8)}`, fontSize: px(t.bodySize * 1.4), fontWeight: 700, color: titleColor }}>
            {m.title}
          </p>
        )}
      </div>
    );

    return (
      <header
        style={{
          textAlign: centered ? "center" : "left",
          ...(band
            ? { background: theme.band.bg, padding: px(sp.padding), marginBottom: px(sp.sectionGap) }
            : l.showDividers
              ? { borderBottom: `${px(1)} solid ${c.border}`, paddingBottom: px(sp.sectionGap), marginBottom: px(sp.sectionGap) }
              : { marginBottom: px(sp.sectionGap) }),
        }}
      >
        {split ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: px(16) }}>
            {nameBlock}
            <div style={{ textAlign: "right", fontSize: px(t.bodySize * 0.9), color: contactColor, flexShrink: 0 }}>
              {contactLines.map((line) => (
                <div key={line} style={{ marginBottom: px(2) }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {nameBlock}
            {contactLines.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: `${px(2)} ${px(14)}`,
                  justifyContent: centered ? "center" : "flex-start",
                  fontSize: px(t.bodySize * 0.9),
                  color: contactColor,
                }}
              >
                {contactLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            )}
          </>
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

  // Edge strip: drawn over the page, outside the scrolling area, so it always spans the full page
  const accentBar =
    l.accentBar === "none" ? null : (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: 2,
          background: c.primary,
          pointerEvents: "none",
          ...(l.accentBar === "left"
            ? { top: 0, bottom: 0, left: 0, width: px(8) }
            : { top: 0, left: 0, right: 0, height: px(8) }),
        }}
      />
    );

  const frame = (page: ReactNode) => (
    <div className="relative shadow-lg rounded-lg overflow-hidden" style={{ background: c.background }}>
      {accentBar}
      {page}
    </div>
  );

  if (plan.side) {
    const sidebarPad = Math.round(sp.padding * 0.7);
    return frame(
      <div data-cv-page style={{ ...pageStyle, display: "flex", flexDirection: plan.side === "left" ? "row" : "row-reverse" }}>
        <aside
          style={{
            width: `${sidebarPercent}%`,
            flexShrink: 0,
            background: theme.sidebar.bg,
            color: theme.sidebar.text,
            padding: `${px(sp.padding)} ${px(sidebarPad)}`,
            boxSizing: "border-box",
          }}
        >
          {plan.sidebar.map((section) => renderSection(section, theme.sidebar, true))}
        </aside>
        <div style={{ flex: 1, minWidth: 0, padding: px(sp.padding), boxSizing: "border-box" }}>
          {renderHeader(model, false)}
          {plan.main.map((section) => renderSection(section, theme.main, false))}
        </div>
      </div>
    );
  }

  const band = l.headerStyle === "band";
  const sections = plan.main.map((section) => renderSection(section, theme.main, false));
  return frame(
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
  );
}
