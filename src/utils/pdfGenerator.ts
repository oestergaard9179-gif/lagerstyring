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

  // --- TOP TEKSTER (VENSTRE) ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('HJEMMEVÆRNSKOMMANDOEN', 14, 10);
  
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(11);
  doc.text('Forsyningsblanket A4', 14, 15);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('HJEMMEVÆRNET', 14, 21);
  
  doc.setFontSize(13);
  doc.text('FORSYNINGSBLANKET (FB)', 14, 29);

  // --- TOP TEKSTER (HØJRE) ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('HJVBST 602-002', 196, 10, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('BILAG 6', 196, 14, { align: 'right' });

  // --- TOP BOKSE OPBYGNING ---
  doc.setLineWidth(0.2);

  // Box helper
  const drawBoxRef = (x: number, y: number, w: number, h: number, refNum: string) => {
    doc.rect(x, y, w, h);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(refNum, x + w - 1.5, y + 2.5, { align: 'right' });
  };

  // BOKS 1: PRIORITET
  drawBoxRef(110, 18, 28, 14, '1');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Prioritet', 112, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(options.prioritet, 124, 28, { align: 'center' });

  // BOKS 2: DATO
  drawBoxRef(138, 18, 28, 14, '2');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Dato', 140, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(formattedDate, 152, 28, { align: 'center' });

  // BOKS 3: TOM
  drawBoxRef(166, 18, 30, 14, '3');

  // BOKS 4: FRA
  drawBoxRef(14, 34, 80, 16, '4');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('FRA:', 16, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(options.fra, 16, 45);

  // BOKS 5: TIL
  drawBoxRef(14, 50, 80, 16, '5');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TIL:', 16, 54);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(options.til, 16, 61);

  // BOKS 6: EMNE & INDKØB
  drawBoxRef(94, 34, 102, 32, '6');
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Emne (sæt kryds)', 96, 38);
  doc.text('Indkøb ved:', 145, 38);

  const drawCheckbox = (x: number, y: number, label: string, isChecked: boolean) => {
    doc.rect(x, y, 3.2, 3.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(label, x + 5, y + 2.5);
    if (isChecked) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('X', x + 0.6, y + 2.5);
    }
  };

  // Venstre side i Boks 6 (Emner)
  drawCheckbox(96, 41, 'Rekvirering', options.emneRekvirering);
  drawCheckbox(96, 46, 'Intern', options.emneIntern);
  drawCheckbox(96, 51, 'Levering', options.emneLevering); 
  drawCheckbox(96, 56, 'Tilbagelevering', options.emneTilbagelevering);
  drawCheckbox(96, 61, 'Overførsel', options.emneOverfoersel);
  drawCheckbox(96, 66, 'Lån', options.emneLaan);

  // Højre side i Boks 6 (Indkøb ved)
  drawCheckbox(145, 41, 'Rammeaftale*', options.indkoebRammeaftale);
  drawCheckbox(145, 46, 'Civil leverandør*', options.indkoebCivil);
  drawCheckbox(145, 51, 'Særlig bemyndigelse*', options.indkoebSaerlig);
  drawCheckbox(145, 56, 'Beredskab*', options.indkoebBeredskab);

  // BOKS 7: BEMÆRKNINGER
  drawBoxRef(14, 68, 182, 12, '7');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Bemærkninger (Reference*)', 16, 72);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(options.bemaerkninger, 16, 77);

  // --- TABEL MED OPKREVEDE SPLIT-KOLONNER (Boks 8-14) ---
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
    startY: 83,
    head: [
      [
        { content: 'Lagernummer   8', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
        { content: 'Genstandsnavn   9', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
        { content: 'Lenh.  10', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
        { content: 'Antal  11', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
        { content: 'Lev. 12', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'IO 13', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'Vedtegning   14', styles: { halign: 'center', fontStyle: 'bold' } }
      ],
      [
        { content: 'Modt.', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'RO', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'Evt. PRIS', styles: { halign: 'center', fontStyle: 'bold' } }
      ]
    ],
    body: tableData,
    theme: 'plain', 
    styles: { lineColor: [0, 0, 0], lineWidth: 0.2, fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: 28, halign: 'left' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 12 }, 
      5: { cellWidth: 12 }, 
      6: { cellWidth: 28 }
    }
  });

  // --- BUND REFerencer (15, 16, 17, 18) ---
  doc.setLineWidth(0.2);
  doc.line(14, 282, 196, 282); // Bund linje
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('15', 28, 285);
  doc.text('16', 80, 285);
  doc.text('17', 128, 285);
  doc.text('18', 170, 285);

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
