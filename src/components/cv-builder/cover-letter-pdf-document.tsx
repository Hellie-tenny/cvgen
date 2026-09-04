import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import { splitLetterIntoParagraphs } from "@/utils/letter-format";

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  paragraph: {
    marginBottom: 12,
  },
  rightAligned: {
    textAlign: "right",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
});

export function CoverLetterPDFDocument({ letterText }: { letterText: string }) {
  const paragraphs = splitLetterIntoParagraphs(letterText);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {paragraphs.map((para, i) => {
          // First block is the sender's name/address/date — right-aligned, like the rest of the app.
          const isSenderBlock = i === 0;
          // Any paragraph starting with "RE:" is the subject line — bolded.
          const isSubjectLine = /^RE:/i.test(para);

          return (
            <Text
              key={i}
              style={[
                styles.paragraph,
                isSenderBlock ? styles.rightAligned : {},
                isSubjectLine ? styles.bold : {},
              ]}
            >
              {para}
            </Text>
          );
        })}
      </Page>
    </Document>
  );
}
