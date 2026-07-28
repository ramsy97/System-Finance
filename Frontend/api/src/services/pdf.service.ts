import PDFDocument from 'pdfkit';

const COMPANY_NAME = 'PT Fintech Corp';
const COMPANY_ADDRESS = 'Jl. Sudirman No. 123, Jakarta Pusat 10220';
const COMPANY_TAX_ID = 'NPWP: 01.234.567.8-901.000';
const PRIMARY_COLOR = '#1e40af';
const ACCENT_COLOR = '#3b82f6';
const BORDER_COLOR = '#e5e7eb';
const HEADER_BG = '#1e3a5f';
const ROW_ALT_BG = '#f8fafc';
const SUMMARY_BG = '#f1f5f9';

function addHeaderFooter(doc: PDFKit.PDFDocument, title: string, isFirstPage: boolean = false) {
  const pageWidth = doc.page.width;
  const margin = 50;
  const usableWidth = pageWidth - 2 * margin;

  if (isFirstPage) {
    doc.rect(0, 0, pageWidth, 8).fill(PRIMARY_COLOR);
  }

  doc.fontSize(8).font('Helvetica');
  doc.fillColor('#94a3b8');
  doc.text(COMPANY_NAME, margin, doc.page.height - 50, { align: 'left' });
  doc.text(`Page ${doc.bufferedPageRange()?.count || 1}`, margin, doc.page.height - 50, { align: 'right' });
  doc.fillColor('#cbd5e1');
  doc
    .moveTo(margin, doc.page.height - 60)
    .lineTo(pageWidth - margin, doc.page.height - 60)
    .stroke();
  doc.fillColor('#000000');
}

function drawTableHeader(doc: PDFKit.PDFDocument, columns: { label: string; align: 'left' | 'right' | 'center'; width: number }[], startY: number, pageWidth: number, margin: number) {
  const x = margin;
  const headerH = 28;

  doc.roundedRect(x, startY, pageWidth - 2 * margin, headerH, 4).fill(HEADER_BG);

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  let cx = x + 8;
  for (const col of columns) {
    doc.text(col.label, cx, startY + 8, { width: col.width - 16, align: col.align });
    cx += col.width;
  }
  doc.fillColor('#000000');
  return startY + headerH + 4;
}

function drawTableRow(doc: PDFKit.PDFDocument, columns: { align: 'left' | 'right' | 'center'; width: number }[], values: string[], startY: number, pageWidth: number, margin: number, isAlt: boolean, isSummary: boolean = false) {
  const x = margin;
  const rowH = 22;

  if (isSummary) {
    doc.rect(x, startY, pageWidth - 2 * margin, rowH).fill(SUMMARY_BG);
    const borderY = startY + rowH;
    doc.lineWidth(1.5).strokeColor(PRIMARY_COLOR);
    doc.moveTo(x, borderY).lineTo(pageWidth - margin, borderY).stroke();
    doc.lineWidth(0.5).strokeColor(BORDER_COLOR);
  } else if (isAlt) {
    doc.rect(x, startY, pageWidth - 2 * margin, rowH).fill(ROW_ALT_BG);
  }

  doc.fontSize(8.5).font(isSummary ? 'Helvetica-Bold' : 'Helvetica').fillColor(isSummary ? PRIMARY_COLOR : '#1f2937');
  let cx = x + 8;
  for (let i = 0; i < columns.length; i++) {
    doc.text(values[i] || '', cx, startY + 6, { width: columns[i].width - 16, align: columns[i].align });
    cx += columns[i].width;
  }
  doc.fillColor('#000000');

  const lineY = startY + rowH;
  doc.strokeColor(BORDER_COLOR);
  doc.moveTo(x, lineY).lineTo(pageWidth - margin, lineY).stroke();

  return startY + rowH + 2;
}

export function generateReportPdf(title: string, data: any[], columns: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const margin = 50;
    const usableWidth = pageWidth - 2 * margin;

    let y = margin;

    doc.rect(0, 0, pageWidth, 120).fill('#f8fafc');
    doc.rect(0, 0, pageWidth, 6).fill(PRIMARY_COLOR);

    doc.fontSize(22).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text(COMPANY_NAME, margin, 24, { align: 'center' });

    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(COMPANY_ADDRESS, margin, 50, { align: 'center' });
    doc.text(COMPANY_TAX_ID, margin, 64, { align: 'center' });
    doc.fillColor('#000000');

    y = 90;
    doc.rect(margin, y, usableWidth, 1).fill(ACCENT_COLOR);

    y = 106;
    doc.fontSize(16).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text(title.toUpperCase(), margin, y, { align: 'center' });
    doc.fillColor('#000000');

    y = 128;
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8');
    doc.text(`Generated: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, margin, y, { align: 'center' });
    doc.fillColor('#000000');

    y = 150;

    const colWidth = usableWidth / columns.length;
    const colDefs = columns.map((col) => ({
      label: col,
      align: col.toLowerCase() === 'amount' || col.toLowerCase() === 'debit' || col.toLowerCase() === 'credit' || col.toLowerCase() === 'total' ? 'right' as const : 'left' as const,
      width: colWidth,
    }));

    y = drawTableHeader(doc, colDefs, y, pageWidth, margin);

    let rowIndex = 0;
    for (const row of data) {
      const values = columns.map((col) => String(row[col.toLowerCase()] || row[col] || ''));
      const isSummary = values.some((v) => v.includes('Total') || v.includes('Net')) || rowIndex === data.length - 1;

      y = drawTableRow(doc, colDefs, values, y, pageWidth, margin, rowIndex % 2 === 1, isSummary);
      rowIndex++;

      if (y > 700) {
        doc.addPage();
        y = margin + 10;
        doc.rect(0, 0, pageWidth, 6).fill(PRIMARY_COLOR);
        y = drawTableHeader(doc, colDefs, y, pageWidth, margin);
      }
    }

    y += 20;

    doc.rect(margin, y, usableWidth, 1).fill(ACCENT_COLOR);
    y += 10;
    doc.fontSize(7.5).font('Helvetica').fillColor('#94a3b8');
    doc.text(`This report was generated automatically by Sistem Keuangan - Financial Management System`, margin, y, { align: 'center' });
    doc.text(`${COMPANY_NAME} | ${COMPANY_ADDRESS}`, margin, y + 12, { align: 'center' });

    doc.rect(0, doc.page.height - 40, pageWidth, 40).fill('#f8fafc');
    doc.fontSize(7.5).font('Helvetica').fillColor('#94a3b8');
    doc.text(`${COMPANY_NAME} | Page 1`, margin, doc.page.height - 30, { align: 'center' });

    doc.on('pageAdded', () => {
      doc.rect(0, 0, pageWidth, 6).fill(PRIMARY_COLOR);
      doc.rect(0, doc.page.height - 40, pageWidth, 40).fill('#f8fafc');
      doc.fontSize(7.5).font('Helvetica').fillColor('#94a3b8');
      const pageNum = doc.bufferedPageRange()?.count || 1;
      doc.text(`${COMPANY_NAME} | Page ${pageNum}`, margin, doc.page.height - 30, { align: 'center' });
      doc.fillColor('#000000');
    });

    doc.end();
  });
}

export function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const margin = 50;
    const usableWidth = pageWidth - 2 * margin;

    doc.rect(0, 0, pageWidth, 150).fill('#f8fafc');
    doc.rect(0, 0, pageWidth, 6).fill(PRIMARY_COLOR);

    doc.fontSize(22).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text(COMPANY_NAME, margin, 24, { align: 'left' });

    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(COMPANY_ADDRESS, margin, 50, { align: 'left' });
    doc.text(COMPANY_TAX_ID, margin, 64, { align: 'left' });
    doc.fillColor('#000000');

    doc.fontSize(26).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text('INVOICE', 0, 24, { align: 'right', width: pageWidth - margin });
    doc.fillColor('#000000');

    doc.fontSize(9).font('Helvetica');
    doc.fillColor('#64748b');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 0, 55, { align: 'right', width: pageWidth - margin });
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 0, 70, { align: 'right', width: pageWidth - margin });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 0, 85, { align: 'right', width: pageWidth - margin });
    doc.fillColor('#000000');

    doc.rect(margin, 110, usableWidth, 1).fill(ACCENT_COLOR);

    let y = 130;
    doc.roundedRect(margin, y, usableWidth * 0.45, 70, 4).fill('#ffffff').stroke(BORDER_COLOR);
    doc.roundedRect(margin + usableWidth * 0.55, y, usableWidth * 0.45, 70, 4).fill('#ffffff').stroke(BORDER_COLOR);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text('BILL TO', margin + 10, y + 10);
    doc.fontSize(9).font('Helvetica').fillColor('#1f2937');
    doc.text(invoice.contact?.name || 'N/A', margin + 10, y + 26);
    if (invoice.contact?.email) doc.text(invoice.contact.email, margin + 10, y + 40);
    if (invoice.contact?.address) doc.text(invoice.contact.address, margin + 10, y + 54);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY_COLOR);
    doc.text('INVOICE INFO', margin + usableWidth * 0.55 + 10, y + 10);
    doc.fontSize(9).font('Helvetica').fillColor('#1f2937');
    doc.text(`Status: ${invoice.status || 'DRAFT'}`, margin + usableWidth * 0.55 + 10, y + 26);
    doc.text(`Total: ${formatRupiah(invoice.totalAmount)}`, margin + usableWidth * 0.55 + 10, y + 40);
    doc.text(`Paid: ${formatRupiah(invoice.amountPaid)}`, margin + usableWidth * 0.55 + 10, y + 54);
    doc.fillColor('#000000');

    y += 90;

    const itemCols = [
      { label: '#', align: 'center' as const, width: 30 },
      { label: 'Description', align: 'left' as const, width: 250 },
      { label: 'Qty', align: 'center' as const, width: 60 },
      { label: 'Unit Price', align: 'right' as const, width: 100 },
      { label: 'Amount', align: 'right' as const, width: 100 },
    ];

    y = drawTableHeader(doc, itemCols, y, pageWidth, margin);

    (invoice.items || []).forEach((item: any, idx: number) => {
      const values = [
        String(idx + 1),
        item.description || '',
        String(item.quantity || 0),
        formatRupiah(item.unitPrice || 0),
        formatRupiah(item.amount || 0),
      ];
      y = drawTableRow(doc, itemCols, values, y, pageWidth, margin, idx % 2 === 1);
    });

    y += 8;

    const summaryX = margin + usableWidth * 0.5;
    const summaryW = usableWidth * 0.5;

    doc.rect(summaryX, y, summaryW, 22).fill(SUMMARY_BG);
    doc.fontSize(9).font('Helvetica').fillColor('#1f2937');
    doc.text('Subtotal', summaryX + 10, y + 6);
    doc.text(formatRupiah(invoice.subtotal), summaryX + summaryW - 10, y + 6, { align: 'right' });
    y += 24;

    if (Number(invoice.discountAmount) > 0) {
      doc.rect(summaryX, y, summaryW, 22).fill('#ffffff');
      doc.fontSize(9).font('Helvetica').fillColor('#1f2937');
      doc.text('Discount', summaryX + 10, y + 6);
      doc.text(`(${formatRupiah(invoice.discountAmount)})`, summaryX + summaryW - 10, y + 6, { align: 'right' });
      y += 24;
    }

    doc.rect(summaryX, y, summaryW, 22).fill('#ffffff');
    doc.fontSize(9).font('Helvetica').fillColor('#1f2937');
    doc.text('Tax (PPN 11%)', summaryX + 10, y + 6);
    doc.text(formatRupiah(invoice.taxAmount), summaryX + summaryW - 10, y + 6, { align: 'right' });
    y += 24;

    doc.rect(summaryX, y, summaryW, 28).fill(PRIMARY_COLOR);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text('TOTAL', summaryX + 10, y + 8);
    doc.text(formatRupiah(invoice.totalAmount), summaryX + summaryW - 10, y + 8, { align: 'right' });
    doc.fillColor('#000000');

    y += 45;

    if (invoice.notes) {
      doc.rect(margin, y, usableWidth, 40).fill('#fffbeb').stroke('#fde68a');
      doc.fontSize(8).font('Helvetica').fillColor('#92400e');
      doc.text(`Notes: ${invoice.notes}`, margin + 10, y + 8, { width: usableWidth - 20 });
      doc.fillColor('#000000');
      y += 50;
    }

    doc.rect(0, doc.page.height - 40, pageWidth, 40).fill('#f8fafc');
    doc.fontSize(7.5).font('Helvetica').fillColor('#94a3b8');
    doc.text(`${COMPANY_NAME} | ${COMPANY_ADDRESS}`, margin, doc.page.height - 28, { align: 'center' });
    doc.text(`Invoice ${invoice.invoiceNumber} | Page 1`, margin, doc.page.height - 16, { align: 'center' });

    doc.end();
  });
}

export function formatRupiah(amount: number | string | any): string {
  const num = typeof amount === 'object' ? Number(amount) : Number(amount);
  return `Rp ${num.toLocaleString('id-ID')}`;
}
