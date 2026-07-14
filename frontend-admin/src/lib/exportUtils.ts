import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Common shape for row data to be exported.
 */
export type ExportDataRow = Record<string, string | number | boolean | null>;

/**
 * Export data to a CSV file.
 */
export function exportToCSV(data: ExportDataRow[], filename: string = 'export.csv') {
  const csvStr = Papa.unparse(data);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to an Excel (.xlsx) file.
 */
export function exportToExcel(data: ExportDataRow[], filename: string = 'export.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, name);
}

/**
 * Export data to a PDF file.
 */
export function exportToPDF(data: ExportDataRow[], title: string, filename: string = 'export.pdf') {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('No data available.', 14, 32);
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return;
  }

  // Extract columns from the first object
  const head = [Object.keys(data[0])];
  const body = data.map(row => Object.values(row).map(val => val !== null && val !== undefined ? String(val) : ''));

  autoTable(doc, {
    startY: 30,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] }, // Slate-900 color
  });
  
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
