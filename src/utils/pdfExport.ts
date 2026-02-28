import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileRecord } from '@/hooks/useData';
import { formatDateOnly, formatTimestamp } from '@/utils/dateUtils';

export function generateProposalsPDF(
  files: FileRecord[],
  statusFilter: string,
  totalCount: number
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Proposals Report', 14, 20);
  
  // Metadata on right side
  doc.setFontSize(10);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(`Filter: ${statusFilter}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Generated: ${formatTimestamp(new Date().toISOString(), 'PPP p')}`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Total Proposals: ${totalCount}`, pageWidth - 14, 34, { align: 'right' });
  
  // Prepare table data
  const tableData = files.map(file => [
    file.db_no || '-',
    file.pi_name || '-',
    file.sponsor_name || '-',
    file.status || '-',
    formatDateOnly(file.date_received, 'MM/dd/yyyy') || '-',
    formatDateOnly(file.date_status_change, 'MM/dd/yyyy') || '-',
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: 42,
    head: [['DB No.', 'PI', 'Sponsor', 'Status', 'Date Received', 'Status Changed']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 0,
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 42, left: 14, right: 14 },
  });
  
  // Open in new tab
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
