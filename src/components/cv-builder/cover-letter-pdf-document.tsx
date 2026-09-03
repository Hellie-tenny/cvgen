import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { LetterParts } from "@/utils/letter-format";

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  senderBlock: {
    alignSelf: "flex-end",
    textAlign: "right",
    marginBottom: 20,
  },
  senderLine: {
    fontSize: 10,
  },
  dateLine: {
    fontSize: 10,
    marginTop: 8,
  },
  recipientBlock: {
    marginBottom: 16,
  },
  salutation: {
    marginBottom: 16,
  },
  subjectLine: {
    fontFamily: "Times-Bold",
    marginBottom: 16,
  },
  paragraph: {
    marginBottom: 12,
  },
  closing: {
    marginTop: 4,
  },
  signatureSpace: {
    marginTop: 32,
  },
});

export function CoverLetterPDFDocument({ parts }: { parts: LetterParts }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.senderBlock}>
          {parts.fullName && <Text style={styles.senderLine}>{parts.fullName}</Text>}
          {parts.addressLines.map((line, i) => (
            <Text key={i} style={styles.senderLine}>
              {line}
            </Text>
          ))}
          {parts.email && <Text style={styles.senderLine}>Email: {parts.email}</Text>}
          {parts.phone && <Text style={styles.senderLine}>Phone: {parts.phone}</Text>}
          <Text style={styles.dateLine}>{parts.dateLine}</Text>
        </View>

        {parts.recipientLines.length > 0 && (
          <View style={styles.recipientBlock}>
            {parts.recipientLines.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        )}

        <Text style={styles.salutation}>{parts.salutation}</Text>

        {parts.subjectLine && <Text style={styles.subjectLine}>{parts.subjectLine}</Text>}

        {parts.bodyParagraphs.map((para, i) => (
          <Text key={i} style={styles.paragraph}>
            {para}
          </Text>
        ))}

        <Text style={styles.closing}>{parts.closing}</Text>
        <Text style={styles.signatureSpace}>{parts.fullName}</Text>
      </Page>
    </Document>
  );
}
