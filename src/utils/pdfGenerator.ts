import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Item } from '../types'

// NYT: Et objekt der holder alle indstillinger for blanketten
export type BlanketOptions = {
  prioritet: string;
  dato: string;
  fra: string;
  til: string;
  emneRekvirering: boolean;
  emneIntern: boolean;
  emneLevering: boolean;
  emneTilbagelevering: boolean;
  emneOverfoersel: boolean;
  emneLaan: boolean;
  indkoebRammeaftale: boolean;
  indkoebCivil: boolean;
  indkoebSaerlig: boolean;
  indkoebBeredskab: boolean;
  bemaerkninger: string;
}

// 1. OFFICIEL FORSYNINGSBLANKET
export const generateForsyningsblanket = (options: BlanketOptions, dataList: (Item & { amountToOrder?: number })[], isRetur: boolean = false) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Formatér dato fra YYYY-MM-DD til DD-MM-YYYY
  const formattedDate = options.dato ? options.dato.split('-').reverse().join('-') : '';

  // --- HEADER (Venstre) ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('HJEMMEVÆRNSKOMMANDOEN\nHJVBST 602-002\nBILAG 6\nForsyningsblanket A4\nHJEMMEVÆRNET', 14, 15);

  // --- HEADER (Højre) ---
  doc.text('Prioritet', 150, 15);
  doc.setFont('helvetica', 'bold');
  doc.text(options.prioritet, 170, 15);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Dato', 150, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, 170, 20);

  // --- TITEL ---
  doc.setFontSize(16);
  doc.text('FORSYNINGSBLANKET (FB)', 105, 32, { align: 'center' });

  // --- BOKSE OPBYGNING ---
  doc.setLineWidth(0.3);

  // BOKS 1: FRA
  doc.rect(14, 38, 80, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FRA:', 16, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(options.fra, 16, 49);

  // BOKS 2: TIL
  doc.rect(14, 53, 80, 15);
  doc.setFont('helvetica', 'normal');
  doc.text('TIL:', 16, 57);
  doc.setFont('helvetica', 'bold');
  doc.text(options.til, 16, 64);

  // BOKS 3: EMNE
  doc.rect(94, 38, 102, 15);
  doc.setFont('helvetica', 'normal');
  doc.text('Emne (sæt kryds)', 96, 42);
  
  const drawCheckbox = (x: number, y: number, label: string, isChecked: boolean) => {
    doc.rect(x, y, 4, 4);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + 6, y + 3);
    if (isChecked) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', x + 1, y + 3.2);
    }
  };

  drawCheckbox(96, 45, 'Rekvirering', options.emneRekvirering);
  drawCheckbox(132, 45, 'Intern', options.emneIntern);
  drawCheckbox(164, 45, 'Levering', options.emneLevering); 
  
  drawCheckbox(96, 50, 'Tilbagelevering', options.emneTilbagelevering);
  drawCheckbox(132, 50, 'Overførsel', options.emneOverfoersel);
  drawCheckbox(164, 50, 'Lån', options.emneLaan);

  // BOKS 4: INDKØB VED
  doc.rect(94, 53, 102, 15);
  doc.setFont('helvetica', 'normal');
  doc.text('Indkøb ved:', 96, 57);
  drawCheckbox(96, 60, 'Rammeaftale*', options.indkoebRammeaftale);
  drawCheckbox(140, 60, 'Civil leverandør*', options.indkoebCivil);
  drawCheckbox(96, 65, 'Særlig bemyndigelse*', options.indkoebSaerlig);
  drawCheckbox(140, 65, 'Beredskab*', options.indkoebBeredskab);

  // BOKS 5: BEMÆRKNINGER
  doc.rect(14, 68, 182, 12);
  doc.text('Bemærkninger (Reference*):', 16, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(options.bemaerkninger, 16, 77);

  // --- TABEL ---
  const tableData = dataList.map(item => {
    let antal = isRetur ? (item.antal_retur || 0) : (item.amountToOrder || 0);

    return [
      item.komponentnummer,
      item.objektkorttekst,
      item.lenh || 'EA',
      antal.toString(),
      '', '', '', '', '', ''
    ];
  });

  autoTable(doc, {
    startY: 85,
    head: [['Lagernummer', 'Genstandsnavn', 'Lenh.', 'Antal', 'Lev.', 'Modt.', 'IO', 'RO', 'Vedtegning', 'Evt. PRIS']],
    body: tableData,
    theme: 'plain', 
    styles: { lineColor: [0, 0, 0], lineWidth: 0.2, fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 28, halign: 'left' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 10, halign: 'center' },
      3: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 10 }, 5: { cellWidth: 10 }, 6: { cellWidth: 10 }, 7: { cellWidth: 10 }, 8: { cellWidth: 18 }, 9: { cellWidth: 18 }
    }
  });

  const prefix = isRetur ? 'Tilbagelevering' : 'Bestilling';
  doc.save(`${prefix}_MHV909_.pdf`);
}

// 2. SIMPEL LAGERLISTE
export const generateLagerlistePDF = (type: 'skib' | 'container', items: Item[]) => {
  const doc = new jsPDF()
  const isSkib = type === 'skib'
  const title = isSkib ? 'Inventarliste - Skib (MHV 909)' : 'Inventarliste - Container (MHV 909)'
  
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  doc.setFontSize(10)
  doc.setTextColor(100)
  const dateStr = new Date().toLocaleDateString('da-DK') + ' kl. ' + new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
  doc.text(`Udskrevet: ${dateStr}`, 14, 22)

  const tableData = items
    .filter(item => item.komponentnummer.length <= 15)
    .filter(item => isSkib ? item.antal_skib > 0 : item.antal_container > 0)
    .map(item => [
      item.komponentnummer,
      item.objektkorttekst,
      item.lenh || 'EA',
      isSkib ? item.antal_skib.toString() : item.antal_container.toString(),
      item.maengde.toString()
    ])

  autoTable(doc, {
    startY: 30,
    head: [['Lagernummer', 'Genstandsnavn', 'Enhed', 'Beholdning', 'Norm']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] }, 
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 20 },
      3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }, 4: { cellWidth: 20, halign: 'center' },
    }
  })

  doc.save('MHV909__.pdf')
}