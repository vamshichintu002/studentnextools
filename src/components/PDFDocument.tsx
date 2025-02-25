import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface GeneratedSection {
  title: string;
  content: string;
}

interface PDFDocumentProps {
  title: string;
  description: string;
  sections: GeneratedSection[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    marginBottom: 30,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
});

const PDFDocument: React.FC<PDFDocumentProps> = ({ title, description, sections }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover Page */}
        <View style={{ marginBottom: 50 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Table of Contents */}
        <View style={{ marginBottom: 30 }}>
          <Text style={styles.sectionTitle}>Table of Contents</Text>
          {sections.map((section, index) => (
            <Text key={index} style={{ fontSize: 11, marginBottom: 5 }}>
              {index + 1}. {section.title}
            </Text>
          ))}
        </View>

        {/* Content */}
        {sections.map((section, index) => (
          <View key={index} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default PDFDocument;
