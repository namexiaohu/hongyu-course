import { CERTIFICATE_EXPORT_CSS } from '@/lib/certificate-export-styles';

function injectExportStyles(doc: Document) {
  doc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => node.remove());
  const style = doc.createElement('style');
  style.textContent = CERTIFICATE_EXPORT_CSS;
  doc.head.appendChild(style);
}

export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const html2canvasModule = await import('html2canvas');
  const jspdfModule = await import('jspdf');

  const html2canvas = html2canvasModule.default;
  const JsPDF = jspdfModule.default;

  element.classList.add('is-pdf-export');
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        injectExportStyles(clonedDoc);
        clonedElement.classList.add('is-pdf-export');
        clonedElement.querySelectorAll<HTMLElement>('.cert-badge').forEach((node) => {
          node.style.display = 'inline-table';
          node.style.height = '36px';
          node.style.padding = '0';
          node.style.borderCollapse = 'separate';
          node.style.borderSpacing = '0';
          node.style.boxSizing = 'border-box';
          node.style.background = 'rgba(20, 110, 245, 0.06)';
          node.style.borderColor = 'rgba(20, 110, 245, 0.2)';
          node.style.color = '#146ef5';
        });
        clonedElement.querySelectorAll<HTMLElement>('.cert-badge-label').forEach((node) => {
          node.style.display = 'table-cell';
          node.style.verticalAlign = 'middle';
          node.style.textAlign = 'center';
          node.style.padding = '0 18px';
          node.style.lineHeight = '13px';
          node.style.fontSize = '13px';
        });
        clonedElement.querySelectorAll<HTMLElement>('.cert-name-wrap').forEach((node) => {
          node.style.display = 'inline-block';
          node.style.borderBottom = 'none';
          node.style.paddingBottom = '0';
          node.style.boxSizing = 'border-box';
        });
        clonedElement.querySelectorAll<HTMLElement>('.cert-name').forEach((node) => {
          node.style.margin = '0';
          node.style.padding = '0';
          node.style.lineHeight = '1.2';
          node.style.borderBottom = 'none';
        });
        clonedElement.querySelectorAll<HTMLElement>('.cert-name-line').forEach((node) => {
          node.style.display = 'block';
          node.style.height = '2px';
          node.style.width = '100%';
          node.style.marginTop = '22px';
          node.style.background = '#080808';
        });
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('PDF_RENDER_EMPTY');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;
    pdf.addImage(imgData, 'JPEG', x, y, width, height);
    pdf.save(filename);
  } finally {
    element.classList.remove('is-pdf-export');
  }
}
