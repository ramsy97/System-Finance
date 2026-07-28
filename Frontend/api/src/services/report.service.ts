import * as XLSX from 'xlsx';

const RP_FMT = '[$Rp-421]#,##0';
const PRIMARY = '1E40AF';
const DARK_BLUE = '1E3A5F';
const LIGHT_BLUE = 'DBEAFE';
const GREEN_LIGHT = 'DCFCE7';
const RED_LIGHT = 'FEE2E2';
const YELLOW_LIGHT = 'FEF9C3';
const SUMMARY_BG = 'EFF6FF';
const WHITE = 'FFFFFF';
const TEXT_DARK = '1F2937';
const TEXT_MUTED = '64748B';

function cell(ws: XLSX.WorkSheet, r: number, c: number, v: any, s?: any) {
  const ref = XLSX.utils.encode_cell({ r, c });
  ws[ref] = { t: typeof v === 'number' ? 'n' : 's', v, s };
}

function merge(ws: XLSX.WorkSheet, sr: number, sc: number, er: number, ec: number) {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: sr, c: sc }, e: { r: er, c: ec } });
}

const thinB = { top: { style: 'thin', color: { rgb: 'E2E8F0' } }, bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } };
const noB = { left: { style: 'none' }, right: { style: 'none' }, top: { style: 'none' }, bottom: { style: 'none' } };

function writeHeader(ws: XLSX.WorkSheet, title: string, colCount: number) {
  merge(ws, 0, 0, 0, colCount - 1);
  merge(ws, 1, 0, 1, colCount - 1);
  merge(ws, 3, 0, 3, colCount - 1);
  merge(ws, 4, 0, 4, colCount - 1);
  cell(ws, 0, 0, 'PT Fintech Corp', { font: { bold: true, color: { rgb: PRIMARY }, sz: 16, name: 'Calibri Light' }, alignment: { horizontal: 'center', vertical: 'center' } });
  cell(ws, 1, 0, 'Jl. Sudirman No. 123, Jakarta Pusat 10220  |  NPWP: 01.234.567.8-901.000', { font: { color: { rgb: TEXT_MUTED }, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center' } });
  cell(ws, 3, 0, title.toUpperCase(), { font: { bold: true, color: { rgb: PRIMARY }, sz: 14, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center' } });
  cell(ws, 4, 0, `Generated: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, { font: { italic: true, color: { rgb: '94A3B8' }, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center' } });
}

function writeFooter(ws: XLSX.WorkSheet, startRow: number, colCount: number) {
  merge(ws, startRow, 0, startRow, colCount - 1);
  merge(ws, startRow + 1, 0, startRow + 1, colCount - 1);
  cell(ws, startRow, 0, 'This report was generated automatically by Sistem Keuangan - Financial Management System', { font: { italic: true, color: { rgb: '94A3B8' }, sz: 8, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center' } });
  cell(ws, startRow + 1, 0, 'PT Fintech Corp  |  Jl. Sudirman No. 123, Jakarta Pusat 10220', { font: { italic: true, color: { rgb: '94A3B8' }, sz: 8, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center' } });
}

function writeTableHead(ws: XLSX.WorkSheet, row: number, cols: { label: string; width: number }[]) {
  const headers = cols.map((c) => c.label);
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${row + 1}` });
  for (let c = 0; c < cols.length; c++) {
    cell(ws, row, c, headers[c], {
      font: { bold: true, color: { rgb: WHITE }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: DARK_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinB,
    });
  }
}

function writeDataRow(ws: XLSX.WorkSheet, row: number, values: (string | number)[], colWidths: number[], opts?: { bold?: boolean; bg?: string; color?: string; border?: any; isAmount?: boolean[] }) {
  for (let c = 0; c < values.length; c++) {
    const v = values[c];
    const isAmount = opts?.isAmount?.[c] ?? false;
    cell(ws, row, c, v, {
      font: { bold: opts?.bold ?? false, color: { rgb: opts?.color || TEXT_DARK }, sz: 10, name: 'Calibri' },
      fill: opts?.bg ? { fgColor: { rgb: opts.bg } } : undefined,
      alignment: { horizontal: isAmount ? 'right' : c === 0 ? 'left' : 'left', vertical: 'center' },
      border: opts?.border ?? thinB,
      numFmt: isAmount ? RP_FMT : undefined,
    });
  }
}

function autoWidth(cols: { label: string; width: number }[]): XLSX.ColInfo[] {
  return cols.map((c) => ({ wch: c.width }));
}

export function generateExcel(rows: any[], sheetName: string = 'Report'): Buffer {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  let r = 0;
  const colCount = rows.length > 0 ? Object.keys(rows[0]).length : 1;
  let cols: { label: string; width: number }[] = [];

  const type = sheetName.toLowerCase();

  // ─── TRIAL BALANCE ───
  if (type.includes('trial')) {
    cols = [
      { label: 'Code', width: 10 },
      { label: 'Account', width: 36 },
      { label: 'Type', width: 14 },
      { label: 'Debit (Rp)', width: 20 },
      { label: 'Credit (Rp)', width: 20 },
    ];
    writeHeader(ws, 'Trial Balance', 5);
    r = 6;
    writeTableHead(ws, r, cols); r++;

    let totalDebit = 0, totalCredit = 0;
    for (const row of rows) {
      const isTotal = String(row.Account || row.account || '').toLowerCase().includes('total');
      totalDebit += Number(row.Debit || 0);
      totalCredit += Number(row.Credit || 0);
      writeDataRow(ws, r, [row.Code || row.code, row.Account || row.account, row.Type || row.type, Number(row.Debit || 0), Number(row.Credit || 0)], cols.map(c => c.width), {
        isAmount: [false, false, false, true, true],
        bg: isTotal ? SUMMARY_BG : undefined,
        bold: isTotal,
      });
      r++;
    }

    // Total row
    writeDataRow(ws, r, ['', 'TOTAL', '', totalDebit, totalCredit], [], {
      bold: true, bg: SUMMARY_BG, color: PRIMARY,
      isAmount: [false, false, false, true, true],
      border: { top: { style: 'medium', color: { rgb: PRIMARY } }, bottom: { style: 'double', color: { rgb: PRIMARY } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    ws['!cols'] = autoWidth(cols);
    writeFooter(ws, r + 1, 5);

  // ─── INCOME STATEMENT ───
  } else if (type.includes('income')) {
    cols = [
      { label: 'Account', width: 40 },
      { label: 'Amount (Rp)', width: 22 },
    ];
    writeHeader(ws, 'Income Statement', 2);
    r = 6;

    // Revenue section
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'REVENUE', {
      font: { bold: true, color: { rgb: '166534' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: GREEN_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    for (const row of rows) {
      const type = String(row.Type || row.type || '').toUpperCase();
      if (type !== 'REVENUE') continue;
      writeDataRow(ws, r, [row.Account || row.account, Number(row.Amount || row.amount || 0)], [], {
        isAmount: [false, true],
      });
      r++;
    }

    // Total Revenue
    const totalRev = rows.filter((x: any) => String(x.Type || '').toUpperCase() === 'REVENUE').reduce((s: number, x: any) => s + Number(x.Amount || 0), 0);
    writeDataRow(ws, r, ['TOTAL REVENUE', totalRev], [], {
      bold: true, color: '166534', bg: GREEN_LIGHT,
      isAmount: [false, true],
      border: { top: { style: 'medium', color: { rgb: '166534' } }, bottom: { style: 'thin', color: { rgb: '166534' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    // Spacer
    r++;

    // Expense section
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'EXPENSES', {
      font: { bold: true, color: { rgb: '991B1B' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: RED_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    for (const row of rows) {
      const type = String(row.Type || row.type || '').toUpperCase();
      if (type !== 'EXPENSE') continue;
      writeDataRow(ws, r, [row.Account || row.account, Number(row.Amount || row.amount || 0)], [], {
        isAmount: [false, true],
      });
      r++;
    }

    const totalExp = rows.filter((x: any) => String(x.Type || '').toUpperCase() === 'EXPENSE').reduce((s: number, x: any) => s + Number(x.Amount || 0), 0);
    writeDataRow(ws, r, ['TOTAL EXPENSES', totalExp], [], {
      bold: true, color: '991B1B', bg: RED_LIGHT,
      isAmount: [false, true],
      border: { top: { style: 'medium', color: { rgb: '991B1B' } }, bottom: { style: 'thin', color: { rgb: '991B1B' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    // Spacer
    r++;

    // Net Income
    const netIncome = totalRev - totalExp;
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, netIncome >= 0 ? 'NET INCOME' : 'NET LOSS', {
      font: { bold: true, color: { rgb: netIncome >= 0 ? '166534' : '991B1B' }, sz: 12, name: 'Calibri' },
      fill: { fgColor: { rgb: netIncome >= 0 ? GREEN_LIGHT : RED_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'double', color: { rgb: netIncome >= 0 ? '166534' : '991B1B' } }, bottom: { style: 'double', color: { rgb: netIncome >= 0 ? '166534' : '991B1B' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    });
    cell(ws, r, 1, netIncome, {
      font: { bold: true, color: { rgb: netIncome >= 0 ? '166534' : '991B1B' }, sz: 12, name: 'Calibri' },
      fill: { fgColor: { rgb: netIncome >= 0 ? GREEN_LIGHT : RED_LIGHT } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: RP_FMT,
      border: { top: { style: 'double', color: { rgb: netIncome >= 0 ? '166534' : '991B1B' } }, bottom: { style: 'double', color: { rgb: netIncome >= 0 ? '166534' : '991B1B' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    ws['!cols'] = autoWidth(cols);
    writeFooter(ws, r + 1, 2);

  // ─── BALANCE SHEET ───
  } else if (type.includes('balance')) {
    cols = [
      { label: 'Account', width: 40 },
      { label: 'Amount (Rp)', width: 22 },
    ];
    writeHeader(ws, 'Balance Sheet', 2);
    r = 6;

    // Assets section
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'ASSETS', {
      font: { bold: true, color: { rgb: PRIMARY }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: LIGHT_BLUE } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    let totalAssets = 0;
    for (const row of rows) {
      const cat = String(row.Category || row.category || '').toUpperCase();
      if (cat !== 'ASSET') continue;
      totalAssets += Number(row.Amount || row.amount || 0);
      writeDataRow(ws, r, [row.Account || row.account, Number(row.Amount || row.amount || 0)], [], {
        isAmount: [false, true],
      });
      r++;
    }
    writeDataRow(ws, r, ['TOTAL ASSETS', totalAssets], [], {
      bold: true, color: PRIMARY, bg: LIGHT_BLUE,
      isAmount: [false, true],
      border: { top: { style: 'medium', color: { rgb: PRIMARY } }, bottom: { style: 'thin', color: { rgb: PRIMARY } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;
    r++;

    // Liabilities section
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'LIABILITIES', {
      font: { bold: true, color: { rgb: '92400E' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: YELLOW_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    let totalLiabilities = 0;
    for (const row of rows) {
      const cat = String(row.Category || row.category || '').toUpperCase();
      if (cat !== 'LIABILITY') continue;
      totalLiabilities += Number(row.Amount || row.amount || 0);
      writeDataRow(ws, r, [row.Account || row.account, Number(row.Amount || row.amount || 0)], [], {
        isAmount: [false, true],
      });
      r++;
    }
    writeDataRow(ws, r, ['TOTAL LIABILITIES', totalLiabilities], [], {
      bold: true, color: '92400E', bg: YELLOW_LIGHT,
      isAmount: [false, true],
      border: { top: { style: 'medium', color: { rgb: '92400E' } }, bottom: { style: 'thin', color: { rgb: '92400E' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;
    r++;

    // Equity section
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'EQUITY', {
      font: { bold: true, color: { rgb: '166534' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: GREEN_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    let totalEquity = 0;
    for (const row of rows) {
      const cat = String(row.Category || row.category || '').toUpperCase();
      if (cat !== 'EQUITY') continue;
      totalEquity += Number(row.Amount || row.amount || 0);
      writeDataRow(ws, r, [row.Account || row.account, Number(row.Amount || row.amount || 0)], [], {
        isAmount: [false, true],
      });
      r++;
    }
    writeDataRow(ws, r, ['TOTAL EQUITY', totalEquity], [], {
      bold: true, color: '166534', bg: GREEN_LIGHT,
      isAmount: [false, true],
      border: { top: { style: 'medium', color: { rgb: '166534' } }, bottom: { style: 'thin', color: { rgb: '166534' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;
    r++;

    // Total Liabilities & Equity
    const totalLE = totalLiabilities + totalEquity;
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'TOTAL LIABILITIES & EQUITY', {
      font: { bold: true, color: { rgb: PRIMARY }, sz: 11, name: 'Calibri' },
      fill: { fgColor: { rgb: SUMMARY_BG } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'double', color: { rgb: PRIMARY } }, bottom: { style: 'double', color: { rgb: PRIMARY } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    });
    cell(ws, r, 1, totalLE, {
      font: { bold: true, color: { rgb: PRIMARY }, sz: 11, name: 'Calibri' },
      fill: { fgColor: { rgb: SUMMARY_BG } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: RP_FMT,
      border: { top: { style: 'double', color: { rgb: PRIMARY } }, bottom: { style: 'double', color: { rgb: PRIMARY } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    ws['!cols'] = autoWidth(cols);
    writeFooter(ws, r + 1, 2);

  // ─── CASH FLOW ───
  } else {
    cols = [
      { label: 'Description', width: 40 },
      { label: 'Amount (Rp)', width: 22 },
    ];
    writeHeader(ws, 'Cash Flow Statement', 2);
    r = 6;

    // Cash Inflow
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'CASH INFLOW', {
      font: { bold: true, color: { rgb: '166534' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: GREEN_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    const cashInflow = rows.find((x: any) => String(x.Description || x.description || '').toLowerCase().includes('inflow'));
    writeDataRow(ws, r, ['Total Cash Inflow', Number(cashInflow?.Amount || cashInflow?.amount || 0)], [], {
      isAmount: [false, true],
    }); r++;
    r++;

    // Cash Outflow
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, 'CASH OUTFLOW', {
      font: { bold: true, color: { rgb: '991B1B' }, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: RED_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinB,
    }); r++;

    const cashOutflow = rows.find((x: any) => String(x.Description || x.description || '').toLowerCase().includes('outflow'));
    writeDataRow(ws, r, ['Total Cash Outflow', Number(cashOutflow?.Amount || cashOutflow?.amount || 0)], [], {
      isAmount: [false, true],
    }); r++;
    r++;

    // Net Cash Flow
    const netFlow = rows.find((x: any) => String(x.Description || x.description || '').toLowerCase().includes('net'));
    const netAmount = Number(netFlow?.Amount || netFlow?.amount || 0);
    merge(ws, r, 0, r, 1);
    cell(ws, r, 0, netAmount >= 0 ? 'NET CASH FLOW' : 'NET CASH FLOW (DEFICIT)', {
      font: { bold: true, color: { rgb: netAmount >= 0 ? '166534' : '991B1B' }, sz: 12, name: 'Calibri' },
      fill: { fgColor: { rgb: netAmount >= 0 ? GREEN_LIGHT : RED_LIGHT } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'double', color: { rgb: netAmount >= 0 ? '166534' : '991B1B' } }, bottom: { style: 'double', color: { rgb: netAmount >= 0 ? '166534' : '991B1B' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    });
    cell(ws, r, 1, netAmount, {
      font: { bold: true, color: { rgb: netAmount >= 0 ? '166534' : '991B1B' }, sz: 12, name: 'Calibri' },
      fill: { fgColor: { rgb: netAmount >= 0 ? GREEN_LIGHT : RED_LIGHT } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: RP_FMT,
      border: { top: { style: 'double', color: { rgb: netAmount >= 0 ? '166534' : '991B1B' } }, bottom: { style: 'double', color: { rgb: netAmount >= 0 ? '166534' : '991B1B' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    }); r++;

    ws['!cols'] = autoWidth(cols);
    writeFooter(ws, r + 1, 2);
  }

  ws['!freeze'] = { xRef: 0, yRef: 7 };
  ws['!printGridLines'] = false;

  const sheetTitle = sheetName.length > 31 ? sheetName.slice(0, 28) + '...' : sheetName;
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function parseExcel(buffer: Buffer): any[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}
