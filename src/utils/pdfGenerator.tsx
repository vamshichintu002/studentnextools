import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import ReactMarkdown from 'react-markdown';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  description: {
    fontSize: 12,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center'
  },
  heading1: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottom: '1 solid #EEE',
    paddingBottom: 10
  },
  heading2: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  heading3: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5
  },
  list: {
    marginLeft: 20,
    marginBottom: 10
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#F5F5F5',
    padding: 8,
    marginVertical: 10,
    fontSize: 10
  },
  blockquote: {
    borderLeft: '2 solid #E0E0E0',
    paddingLeft: 10,
    marginVertical: 10,
    fontStyle: 'normal',
    color: '#666'
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    right: 20,
    color: '#666'
  }
});

interface PDFDocumentData {
  title: string;
  description: string;
  content: string;
}

const MarkdownToPDFDocument: React.FC<PDFDocumentData> = ({ title, description, content }) => {
  const renderMarkdownContent = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];

    let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;

    lines.forEach((line, index) => {
      // Headings
      if (line.startsWith('# ')) {
        elements.push(<Text key={index} style={styles.heading1}>{line.slice(2)}</Text>);
      }
      else if (line.startsWith('## ')) {
        elements.push(<Text key={index} style={styles.heading2}>{line.slice(3)}</Text>);
      }
      else if (line.startsWith('### ')) {
        elements.push(<Text key={index} style={styles.heading3}>{line.slice(4)}</Text>);
      }
      // Lists
      else if (line.match(/^[*-] /)) {
        if (!currentList || currentList.type !== 'ul') {
          if (currentList) {
            elements.push(
              <View key={`list-${index}`} style={styles.list}>
                {currentList.items.map((item, i) => (
                  <Text key={i} style={styles.listItem}>• {item}</Text>
                ))}
              </View>
            );
          }
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(line.slice(2));
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        elements.push(
          <View key={index} style={styles.blockquote}>
            <Text style={styles.paragraph}>{line.slice(2)}</Text>
          </View>
        );
      }
      // Code blocks
      else if (line.startsWith('```')) {
        // Skip the opening and closing code block markers
        if (!line.slice(3)) return;
        elements.push(
          <View key={index} style={styles.code}>
            <Text>{line.slice(3)}</Text>
          </View>
        );
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(<Text key={index} style={styles.paragraph}>{line}</Text>);
      }
      // Empty line - reset list context
      else {
        if (currentList) {
          elements.push(
            <View key={`list-${index}`} style={styles.list}>
              {currentList.items.map((item, i) => (
                <Text key={i} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          );
          currentList = null;
        }
      }
    });

    return elements;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {renderMarkdownContent(content)}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export const generatePDF = async (data: PDFDocumentData) => {
  return await pdf(<MarkdownToPDFDocument {...data} />).toBlob();
};
