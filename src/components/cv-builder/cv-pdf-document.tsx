import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CVData, Experience, Skill, Reference, TemplateId } from "@/lib/cv-types";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const getSkillWidth = (level: string) => {
  switch (level) {
    case "Beginner":
      return "25%";
    case "Intermediate":
      return "50%";
    case "Advanced":
      return "75%";
    case "Expert":
      return "100%";
    default:
      return "50%";
  }
};

// Color schemes for each template
const colors: Record<TemplateId, { primary: string; secondary: string; accent: string }> = {
  modern: { primary: "#2563eb", secondary: "#3b82f6", accent: "#dbeafe" },
  classic: { primary: "#b45309", secondary: "#d97706", accent: "#fef3c7" },
  minimal: { primary: "#4b5563", secondary: "#6b7280", accent: "#f3f4f6" },
  bold: { primary: "#dc2626", secondary: "#ef4444", accent: "#fee2e2" },
};

interface CVPDFDocumentProps {
  data: CVData;
}

export function CVPDFDocument({ data }: CVPDFDocumentProps) {
  const { personal, experiences, skills, references, template } = data;
  const color = colors[template];
  const hasPersonalInfo = personal.fullName || personal.email || personal.title;
  const hasExperiences = experiences.length > 0;
  const hasSkills = skills.length > 0;
  const hasReferences = references.length > 0;

  // Modern Template
  if (template === "modern") {
    const styles = StyleSheet.create({
      page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
      header: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingBottom: 16, marginBottom: 16 },
      name: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4 },
      title: { fontSize: 14, color: color.primary, fontFamily: "Helvetica-Bold", marginBottom: 10 },
      contactRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
      contactItem: { fontSize: 9, color: "#666666" },
      section: { marginBottom: 16 },
      sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: "#666666", marginBottom: 8 },
      summary: { lineHeight: 1.5 },
      experienceItem: { marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: color.accent },
      experienceHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
      position: { fontFamily: "Helvetica-Bold" },
      dates: { fontSize: 9, color: "#666666" },
      company: { fontSize: 10, color: color.primary, fontFamily: "Helvetica-Bold", marginBottom: 4 },
      description: { lineHeight: 1.4, color: "#4a4a4a" },
      skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
      skillItem: { width: "48%", marginBottom: 6 },
      skillHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
      skillName: { fontFamily: "Helvetica-Bold" },
      skillLevel: { fontSize: 8, color: "#666666" },
      skillBar: { height: 4, backgroundColor: "#e5e5e5", borderRadius: 2 },
      skillFill: { height: 4, backgroundColor: color.primary, borderRadius: 2 },
      placeholder: { fontStyle: "italic", color: "#999999" },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.name}>{personal.fullName || "Your Name"}</Text>
            <Text style={styles.title}>{personal.title || "Professional Title"}</Text>
            <View style={styles.contactRow}>
              {(personal.email || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.email || "email@example.com"}</Text>}
              {(personal.phone || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.phone || "+1 (555) 000-0000"}</Text>}
              {(personal.location || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.location || "City, Country"}</Text>}
            </View>
          </View>

          {(personal.summary || !hasPersonalInfo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.summary}>{personal.summary || "A brief overview of your professional background."}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {hasExperiences ? (
              experiences.map((exp: Experience) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.position}>{exp.position || "Position Title"}</Text>
                    <Text style={styles.dates}>{formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}</Text>
                  </View>
                  <Text style={styles.company}>{exp.company || "Company Name"}</Text>
                  {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.placeholder}>Add your work experience.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {hasSkills ? (
              <View style={styles.skillsGrid}>
                {skills.map((skill: Skill) => (
                  <View key={skill.id} style={styles.skillItem}>
                    <View style={styles.skillHeader}>
                      <Text style={styles.skillName}>{skill.name || "Skill"}</Text>
                      <Text style={styles.skillLevel}>{skill.level}</Text>
                    </View>
                    <View style={styles.skillBar}>
                      <View style={[styles.skillFill, { width: getSkillWidth(skill.level) }]} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholder}>Add skills to highlight your expertise.</Text>
            )}
          </View>

          {hasReferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              {references.map((ref: Reference) => (
                <View key={ref.id} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{ref.name || "Reference Name"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.position || "Position"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.organization || "Organization"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.phone || "Phone"}</Text>
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  // Classic Template
  if (template === "classic") {
    const styles = StyleSheet.create({
      page: { padding: 40, fontFamily: "Times-Roman", fontSize: 10, color: "#1a1a1a" },
      header: { textAlign: "center", borderBottomWidth: 2, borderBottomColor: color.accent, paddingBottom: 16, marginBottom: 16 },
      name: { fontSize: 26, fontFamily: "Times-Bold", marginBottom: 4 },
      title: { fontSize: 14, color: color.primary, fontFamily: "Times-Italic", marginBottom: 10 },
      contactRow: { flexDirection: "row", justifyContent: "center", gap: 20, flexWrap: "wrap" },
      contactItem: { fontSize: 9, color: "#666666" },
      section: { marginBottom: 16 },
      sectionTitle: { fontSize: 12, fontFamily: "Times-Bold", color: color.primary, borderBottomWidth: 1, borderBottomColor: color.accent, paddingBottom: 4, marginBottom: 8 },
      summary: { lineHeight: 1.5 },
      experienceItem: { marginBottom: 10 },
      experienceHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
      position: { fontFamily: "Times-Bold" },
      dates: { fontSize: 9, color: "#666666", fontStyle: "italic" },
      company: { fontSize: 10, color: color.primary, fontFamily: "Times-Italic", marginBottom: 4 },
      description: { lineHeight: 1.4, color: "#4a4a4a" },
      skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
      skillItem: { flexDirection: "row", width: "48%", marginBottom: 4, gap: 4 },
      bullet: { color: color.primary },
      skillText: { fontSize: 10 },
      skillLevel: { fontSize: 8, color: "#999999" },
      placeholder: { fontStyle: "italic", color: "#999999" },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.name}>{personal.fullName || "Your Name"}</Text>
            <Text style={styles.title}>{personal.title || "Professional Title"}</Text>
            <View style={styles.contactRow}>
              {(personal.email || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.email || "email@example.com"}</Text>}
              {(personal.phone || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.phone || "+1 (555) 000-0000"}</Text>}
              {(personal.location || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.location || "City, Country"}</Text>}
            </View>
          </View>

          {(personal.summary || !hasPersonalInfo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={styles.summary}>{personal.summary || "A brief overview of your professional background."}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {hasExperiences ? (
              experiences.map((exp: Experience) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.position}>{exp.position || "Position Title"}</Text>
                    <Text style={styles.dates}>{formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}</Text>
                  </View>
                  <Text style={styles.company}>{exp.company || "Company Name"}</Text>
                  {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.placeholder}>Add your work experience.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            {hasSkills ? (
              <View style={styles.skillsGrid}>
                {skills.map((skill: Skill) => (
                  <View key={skill.id} style={styles.skillItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.skillText}>{skill.name || "Skill"}</Text>
                    <Text style={styles.skillLevel}>({skill.level})</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholder}>Add skills to highlight your expertise.</Text>
            )}
          </View>

          {hasReferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              {references.map((ref: Reference) => (
                <View key={ref.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Times-Bold" }}>{ref.name || "Reference Name"}</Text>
                  <Text style={{ fontSize: 9, color: "#6b7280" }}>{ref.position || "Position"}</Text>
                  <Text style={{ fontSize: 9, color: "#6b7280" }}>{ref.organization || "Organization"}</Text>
                  <Text style={{ fontSize: 9, color: "#6b7280" }}>{ref.phone || "Phone"}</Text>
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  // Minimal Template
  if (template === "minimal") {
    const styles = StyleSheet.create({
      page: { padding: 50, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
      header: { marginBottom: 20 },
      name: { fontSize: 22, fontFamily: "Helvetica", fontWeight: 300, letterSpacing: 1, marginBottom: 4 },
      title: { fontSize: 12, color: "#666666", marginBottom: 12 },
      contactRow: { flexDirection: "row", gap: 24, flexWrap: "wrap" },
      contactItem: { fontSize: 8, color: "#999999", textTransform: "uppercase", letterSpacing: 1 },
      divider: { height: 1, backgroundColor: "#e5e5e5", marginVertical: 20 },
      section: { marginBottom: 20 },
      sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 2, color: "#999999", marginBottom: 12 },
      summary: { lineHeight: 1.6, color: "#4a4a4a" },
      experienceItem: { marginBottom: 12 },
      experienceHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
      position: { fontFamily: "Helvetica-Bold" },
      dates: { fontSize: 9, color: "#999999" },
      company: { fontSize: 10, color: "#666666", marginBottom: 4 },
      description: { lineHeight: 1.5, color: "#666666" },
      skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
      skillText: { fontSize: 10, color: "#4a4a4a" },
      placeholder: { fontStyle: "italic", color: "#cccccc" },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.name}>{personal.fullName || "Your Name"}</Text>
            <Text style={styles.title}>{personal.title || "Professional Title"}</Text>
            <View style={styles.contactRow}>
              {(personal.email || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.email || "email@example.com"}</Text>}
              {(personal.phone || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.phone || "+1 (555) 000-0000"}</Text>}
              {(personal.location || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.location || "City, Country"}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          {(personal.summary || !hasPersonalInfo) && (
            <View style={styles.section}>
              <Text style={styles.summary}>{personal.summary || "A brief overview of your professional background."}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {hasExperiences ? (
              experiences.map((exp: Experience) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.position}>{exp.position || "Position Title"}</Text>
                    <Text style={styles.dates}>{formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}</Text>
                  </View>
                  <Text style={styles.company}>{exp.company || "Company Name"}</Text>
                  {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.placeholder}>Add your work experience.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {hasSkills ? (
              <View style={styles.skillsRow}>
                {skills.map((skill: Skill) => (
                  <Text key={skill.id} style={styles.skillText}>{skill.name || "Skill"}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholder}>Add skills to highlight your expertise.</Text>
            )}
          </View>

          {hasReferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              {references.map((ref: Reference) => (
                <View key={ref.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{ref.name || "Reference Name"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.position || "Position"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.organization || "Organization"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.phone || "Phone"}</Text>
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  // Bold Template
  const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
    header: { backgroundColor: color.primary, padding: 30, paddingTop: 40 },
    name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff", marginBottom: 4 },
    title: { fontSize: 14, color: "#ffffff", opacity: 0.9, marginBottom: 12 },
    contactRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
    contactItem: { fontSize: 9, color: "#ffffff", opacity: 0.8 },
    body: { padding: 30 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: color.primary, marginBottom: 8 },
    summary: { lineHeight: 1.5, color: "#4a4a4a" },
    experienceItem: { marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: color.accent },
    experienceHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    position: { fontFamily: "Helvetica-Bold" },
    dates: { fontSize: 9, color: "#666666" },
    company: { fontSize: 10, color: color.primary, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    description: { lineHeight: 1.4, color: "#4a4a4a" },
    skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    skillTag: { backgroundColor: color.accent, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    skillText: { fontSize: 9, color: color.primary, fontFamily: "Helvetica-Bold" },
    placeholder: { fontStyle: "italic", color: "#999999" },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.fullName || "Your Name"}</Text>
          <Text style={styles.title}>{personal.title || "Professional Title"}</Text>
          <View style={styles.contactRow}>
            {(personal.email || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.email || "email@example.com"}</Text>}
            {(personal.phone || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.phone || "+1 (555) 000-0000"}</Text>}
            {(personal.location || !hasPersonalInfo) && <Text style={styles.contactItem}>{personal.location || "City, Country"}</Text>}
          </View>
        </View>

        <View style={styles.body}>
          {(personal.summary || !hasPersonalInfo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.summary}>{personal.summary || "A brief overview of your professional background."}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {hasExperiences ? (
              experiences.map((exp: Experience) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.position}>{exp.position || "Position Title"}</Text>
                    <Text style={styles.dates}>{formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}</Text>
                  </View>
                  <Text style={styles.company}>{exp.company || "Company Name"}</Text>
                  {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.placeholder}>Add your work experience.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {hasSkills ? (
              <View style={styles.skillsRow}>
                {skills.map((skill: Skill) => (
                  <View key={skill.id} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill.name || "Skill"}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholder}>Add skills to highlight your expertise.</Text>
            )}
          </View>

          {hasReferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              {references.map((ref: Reference) => (
                <View key={ref.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{ref.name || "Reference Name"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.position || "Position"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.organization || "Organization"}</Text>
                  <Text style={{ fontSize: 9, color: "#666666" }}>{ref.phone || "Phone"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
