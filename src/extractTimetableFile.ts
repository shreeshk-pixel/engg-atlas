import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

async function extractPdf(data: ArrayBuffer) {
  const pdf = await getDocument({ data: new Uint8Array(data) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(line);
  }
  return pages.join('\n');
}

export async function extractDocumentText(file: File) {
  const name = file.name.toLowerCase();
  const data = await file.arrayBuffer();

  if (name.endsWith('.pdf')) return extractPdf(data);

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value;
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
    const XLSX = await import('xlsx');
    const book = XLSX.read(data, { type: 'array' });
    return book.SheetNames.map((sheet) => {
      const grid = XLSX.utils.sheet_to_csv(book.Sheets[sheet]);
      return `Sheet: ${sheet}\n${grid}`;
    }).join('\n\n');
  }

  if (name.endsWith('.txt')) return new TextDecoder().decode(data);

  if (name.endsWith('.doc')) {
    throw new Error('Old .doc files are not supported. Save as .docx and upload again.');
  }

  throw new Error('Unsupported file. Use a photo, PDF, DOCX, XLSX, XLS, CSV, or TXT.');
}
