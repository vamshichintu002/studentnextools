import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import * as marked from 'marked';

interface DocumentData {
  title: string;
  description: string;
  content: string;
  sections: {
    title: string;
    content: string;
  }[];
}

const convertMarkdownToParagraphs = (markdown: string): Paragraph[] => {
  const tokens = marked.lexer(markdown);
  const paragraphs: Paragraph[] = [];

  tokens.forEach(token => {
    switch (token.type) {
      case 'heading':
        paragraphs.push(
          new Paragraph({
            text: token.text,
            heading: token.depth as HeadingLevel,
            alignment: token.depth === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 400, after: 200 }
          })
        );
        break;

      case 'paragraph':
        // Handle bold and italic text
        const textRuns: TextRun[] = [];
        const text = token.text;
        let currentText = '';
        let isBold = false;
        let isItalic = false;

        for (let i = 0; i < text.length; i++) {
          if (text[i] === '*' || text[i] === '_') {
            if (i + 1 < text.length && (text[i + 1] === '*' || text[i + 1] === '_')) {
              // Bold text
              if (currentText) {
                textRuns.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic, size: 24 }));
                currentText = '';
              }
              isBold = !isBold;
              i++; // Skip next asterisk
            } else {
              // Italic text
              if (currentText) {
                textRuns.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic, size: 24 }));
                currentText = '';
              }
              isItalic = !isItalic;
            }
          } else {
            currentText += text[i];
          }
        }

        if (currentText) {
          textRuns.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic, size: 24 }));
        }

        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 200 }
          })
        );
        break;

      case 'list':
        token.items.forEach((item: any, index: number) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${token.ordered ? `${index + 1}.` : '•'} ${item.text}`,
                  size: 24
                })
              ],
              indent: { left: 720 },
              spacing: { after: 120 }
            })
          );
        });
        break;

      case 'blockquote':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: token.text,
                italics: true,
                size: 24
              })
            ],
            indent: { left: 720 },
            spacing: { before: 240, after: 240 }
          })
        );
        break;

      case 'code':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: token.text,
                font: 'Courier New',
                size: 20
              })
            ],
            spacing: { before: 240, after: 240 }
          })
        );
        break;

      case 'hr':
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '─'.repeat(50), size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 }
          })
        );
        break;
    }
  });

  return paragraphs;
};

export const generateWordDocument = async (data: DocumentData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            text: data.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.description,
                size: 24,
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }
          }),

          // Convert full markdown content to Word paragraphs
          ...convertMarkdownToParagraphs(data.content)
        ]
      }
    ]
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  const fileName = `${data.title.toLowerCase().replace(/\s+/g, '-')}-documentation.docx`;
  saveAs(blob, fileName);
};
