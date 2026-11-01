import type { ReactNode } from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";
import {
  PDF_FONTS,
  resolveTheme,
  sidebarWidthPt,
  type RegionColors,
  type SectionSetting,
  type TemplateDesign,
} from "@/lib/template-design";
import { buildCVModel, descriptionLines, planSections, skillDots, PLACEHOLDERS, type CVModel } from "@/lib/cv-model";

/**
 * PDF version of an admin-made template. It draws the same content and the same theme as the on-screen preview
 * (custom-cv-preview.tsx); sizes here are PDF points, exactly as stored in the design.
 *
 * Layout notes for multi-page CVs:
 *  - Sidebar layouts paint the sidebar colour on every page with a fixed strip, but the sidebar's own content
 *    appears on page 1 only. The main column carries on to following pages.
 *  - Banner headers bleed to the page edge on page 1 with a negative top margin.
 *  - Accent bars (top or left edge) are fixed, so they repeat on every page.
 */
export function CustomCVDocument({ data, design }: { data: CVData; design: TemplateDesign }) {
  const model = buildCVModel(data);
  const theme = resolveTheme(design);
  const plan = planSections(design);
  const { colors: c, typography: t, spacing: sp, layout: l } = design;

  const body = PDF_FONTS[t.bodyFont];
  const head = PDF_FONTS[t.headingFont];
  const headingFamily = t.headingBold ? head.bold : head.regular;
  const upper = l.sectionTitleStyle === "uppercase";
  const underline = l.sectionTitleStyle === "underline";
  const sidebarPt = sidebarWidthPt(l);

  const mutedText = (region: RegionColors, size = 0.9) => ({ fontSize: t.bodySize * size, color: region.muted }) as const;

  const sectionTitle = (text: string, region: RegionColors) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        ...(underline ? { paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: region.rule } : {}),
      }}
    >
      {l.titleMarker !== "none" ? (
        <View
          style={{
            width: l.titleMarker === "bar" ? 3 : 6,
            height: l.titleMarker === "bar" ? t.headingSize * 1.1 : 6,
            borderRadius: l.titleMarker === "dot" ? 3 : 1,
            backgroundColor: region.title,
            marginRight: 6,
          }}
        />
      ) : null}
      <Text
        style={{
          fontFamily: headingFamily,
          fontSize: t.headingSize,
          color: region.title,
          ...(upper ? { textTransform: "uppercase" as const, letterSpacing: 1 } : {}),
        }}
      >
        {text}
      </Text>
    </View>
  );

  /** A paragraph that keeps the line breaks people typed, or one bullet per line */
  const paragraph = (text: string, marginTop = 0, color?: string) => {
    if (l.bulletDescriptions) {
      return (
        <View style={{ marginTop }}>
          {descriptionLines(text).map((line, i) => (
            <View key={i} style={{ flexDirection: "row", marginBottom: 1.5 }}>
              <Text style={{ width: 11 }}>•</Text>
              <Text style={{ flex: 1, lineHeight: t.lineHeight, ...(color ? { color } : {}) }}>{line}</Text>
            </View>
          ))}
        </View>
      );
    }
    return <Text style={{ lineHeight: t.lineHeight, marginTop, ...(color ? { color } : {}) }}>{text}</Text>;
  };

  const renderSection = (section: SectionSetting, region: RegionColors, inSidebar: boolean): ReactNode => {
    const key = section.key;
    switch (key) {
      case "contact":
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            {model.contact.map((line) => (
              <Text key={line} style={{ ...mutedText(region, 1), marginBottom: 3 }}>
                {line}
              </Text>
            ))}
          </View>
        );

      case "summary":
        if (!model.summary) return null;
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            <Text style={{ lineHeight: t.lineHeight }}>{model.summary}</Text>
          </View>
        );

      case "experience":
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            {model.has.experience ? (
              model.experiences.map((exp) => (
                <View
                  key={exp.id}
                  wrap={false}
                  style={{
                    marginBottom: sp.itemGap,
                    ...(l.experienceStyle === "timeline"
                      ? { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: region.rule }
                      : {}),
                  }}
                >
                  {l.experienceStyle === "compact" ? (
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text>
                        <Text style={{ fontFamily: body.bold }}>{exp.position}</Text>
                        <Text style={{ fontFamily: body.bold, color: c.primary }}>{" · " + exp.company}</Text>
                      </Text>
                      <Text style={mutedText(region)}>{exp.dates}</Text>
                    </View>
                  ) : l.datesPosition === "below" ? (
                    <>
                      <Text style={{ fontFamily: body.bold }}>{exp.position}</Text>
                      <Text style={{ fontFamily: body.bold, color: c.primary, marginTop: 1 }}>{exp.company}</Text>
                      <Text style={{ ...mutedText(region), marginTop: 1, marginBottom: 4 }}>{exp.dates}</Text>
                    </>
                  ) : (
                    <>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <Text style={{ fontFamily: body.bold }}>{exp.position}</Text>
                        <Text style={mutedText(region)}>{exp.dates}</Text>
                      </View>
                      <Text style={{ fontFamily: body.bold, color: c.primary, marginBottom: 4 }}>{exp.company}</Text>
                    </>
                  )}
                  {exp.description ? paragraph(exp.description, l.experienceStyle === "compact" ? 2 : 0, region.text) : null}
                </View>
              ))
            ) : (
              <Text style={{ color: region.muted }}>{PLACEHOLDERS.experience}</Text>
            )}
          </View>
        );

      case "skills":
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            {!model.has.skills ? (
              <Text style={{ color: region.muted }}>{PLACEHOLDERS.skills}</Text>
            ) : l.skillStyle === "tag" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                {model.skills.map((s) => (
                  <View
                    key={s.id}
                    style={{ backgroundColor: region.tagBg, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7 }}
                  >
                    <Text style={{ fontFamily: body.bold, fontSize: t.bodySize * 0.9, color: region.tagText }}>{s.name}</Text>
                  </View>
                ))}
              </View>
            ) : l.skillStyle === "inline" ? (
              <Text style={{ lineHeight: t.lineHeight }}>{model.skills.map((s) => s.name).join("  •  ")}</Text>
            ) : l.skillStyle === "list" ? (
              <View>
                {model.skills.map((s) => (
                  <View key={s.id} style={{ flexDirection: "row", marginBottom: 2 }}>
                    <Text style={{ width: 11 }}>•</Text>
                    <Text style={{ flex: 1 }}>{s.name}</Text>
                  </View>
                ))}
              </View>
            ) : l.skillStyle === "dots" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {model.skills.map((s) => (
                  <View
                    key={s.id}
                    style={{
                      width: inSidebar ? "100%" : "48%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ fontFamily: body.bold }}>{s.name}</Text>
                    <View style={{ flexDirection: "row" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <View
                          key={n}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            marginLeft: 3,
                            backgroundColor: n <= skillDots(s.percent) ? region.fill : region.track,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {model.skills.map((s) => (
                  <View key={s.id} style={{ width: inSidebar ? "100%" : "48%", marginBottom: 7 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                      <Text style={{ fontFamily: body.bold }}>{s.name}</Text>
                      {!inSidebar ? <Text style={mutedText(region, 0.8)}>{s.level}</Text> : null}
                    </View>
                    <View style={{ height: 4, backgroundColor: region.track, borderRadius: 2 }}>
                      <View style={{ height: 4, width: `${s.percent}%`, backgroundColor: region.fill, borderRadius: 2 }} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case "education":
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            {model.has.education ? (
              model.educations.map((edu) => (
                <View key={edu.id} wrap={false} style={{ marginBottom: 8 }}>
                  <Text style={{ fontFamily: body.bold }}>{edu.institution}</Text>
                  {edu.qualification ? <Text>{edu.qualification}</Text> : null}
                  <Text style={mutedText(region)}>{edu.year}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: region.muted }}>{PLACEHOLDERS.education}</Text>
            )}
          </View>
        );

      case "references":
        if (!model.has.references) return null;
        return (
          <View key={key} style={{ marginBottom: sp.sectionGap }}>
            {sectionTitle(section.title, region)}
            {model.references.map((ref) => (
              <View key={ref.id} wrap={false} style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: body.bold }}>{ref.name}</Text>
                <Text style={mutedText(region)}>{ref.position}</Text>
                <Text style={mutedText(region)}>{ref.organization}</Text>
                <Text style={mutedText(region)}>{ref.phone}</Text>
              </View>
            ))}
          </View>
        );
    }
  };

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
    const align = centered ? ("center" as const) : ("left" as const);
    const nameUpper = l.nameCase === "uppercase";

    const nameBlock = (
      <View style={split ? { flex: 1 } : undefined}>
        <Text
          style={{
            fontFamily: headingFamily,
            fontSize: t.nameSize,
            color: nameColor,
            textAlign: align,
            marginBottom: 4,
            ...(nameUpper ? { textTransform: "uppercase" as const, letterSpacing: 1 } : {}),
          }}
        >
          {m.name}
        </Text>
        {m.title ? (
          <Text
            style={{
              fontFamily: body.bold,
              fontSize: t.bodySize * 1.4,
              color: titleColor,
              textAlign: align,
              marginBottom: split ? 0 : 8,
            }}
          >
            {m.title}
          </Text>
        ) : null}
      </View>
    );

    return (
      <View
        style={
          band
            ? { backgroundColor: theme.band.bg, padding: sp.padding, marginTop: -sp.padding, marginBottom: sp.sectionGap }
            : l.showDividers
              ? { borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: sp.sectionGap, marginBottom: sp.sectionGap }
              : { marginBottom: sp.sectionGap }
        }
      >
        {split ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            {nameBlock}
            <View style={{ marginLeft: 16 }}>
              {contactLines.map((line) => (
                <Text key={line} style={{ fontSize: t.bodySize * 0.9, color: contactColor, textAlign: "right", marginBottom: 2 }}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <>
            {nameBlock}
            {contactLines.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: centered ? "center" : "flex-start" }}>
                {contactLines.map((line) => (
                  <Text key={line} style={{ fontSize: t.bodySize * 0.9, color: contactColor }}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        )}
      </View>
    );
  };

  const pageBase = {
    backgroundColor: c.background,
    fontFamily: body.regular,
    fontSize: t.bodySize,
    color: c.foreground,
    lineHeight: 1.3,
  } as const;

  /** Coloured strip along the top or left edge, repeated on every page */
  const accentBar =
    l.accentBar === "none" ? null : (
      <View
        fixed
        style={{
          position: "absolute",
          backgroundColor: c.primary,
          ...(l.accentBar === "left"
            ? { top: 0, bottom: 0, left: 0, width: 8 }
            : { top: 0, left: 0, right: 0, height: 8 }),
        }}
      />
    );

  // ── Sidebar layouts ───────────────────────────────────────────────────────────────────────────────────────
  if (plan.side) {
    const side = plan.side;
    const sidebarPad = Math.round(sp.padding * 0.7);
    return (
      <Document>
        <Page size="A4" style={{ ...pageBase, paddingTop: sp.padding, paddingBottom: sp.padding }}>
          {/* Sidebar colour on every page */}
          <View
            fixed
            style={{ position: "absolute", top: 0, bottom: 0, [side]: 0, width: sidebarPt, backgroundColor: theme.sidebar.bg }}
          />
          {accentBar}
          {/* Sidebar content: first page */}
          <View
            style={{
              position: "absolute",
              top: sp.padding,
              [side]: 0,
              width: sidebarPt,
              paddingHorizontal: sidebarPad,
              color: theme.sidebar.text,
            }}
          >
            {plan.sidebar.map((section) => renderSection(section, theme.sidebar, true))}
          </View>
          {/* Main column: flows across pages */}
          <View
            style={{
              [side === "left" ? "paddingLeft" : "paddingRight"]: sidebarPt + sp.padding * 0.8,
              [side === "left" ? "paddingRight" : "paddingLeft"]: sp.padding,
            }}
          >
            {renderHeader(model, false)}
            {plan.main.map((section) => renderSection(section, theme.main, false))}
          </View>
        </Page>
      </Document>
    );
  }

  // ── Single column ─────────────────────────────────────────────────────────────────────────────────────────
  const sections = plan.main.map((section) => renderSection(section, theme.main, false));

  if (l.headerStyle === "band") {
    return (
      <Document>
        <Page size="A4" style={{ ...pageBase, paddingTop: sp.padding, paddingBottom: sp.padding }}>
          {accentBar}
          {renderHeader(model, true)}
          <View style={{ paddingHorizontal: sp.padding }}>{sections}</View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={{ ...pageBase, padding: sp.padding }}>
        {accentBar}
        {renderHeader(model, false)}
        {sections}
      </Page>
    </Document>
  );
}
