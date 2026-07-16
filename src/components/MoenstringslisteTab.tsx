import React, { useState } from 'react';

type MoenstringsItem = {
  nsn: string;
  genstand: string;
  norm: number;
  omBord: number | string;
  bemaerkninger: string;
  skalBestilles: number | string;
};

export const MoenstringslisteTab: React.FC = () => {
  const [radarTime, setRadarTime] = useState('7138,8');
  const [items, setItems] = useState<MoenstringsItem[]>([
    { nsn: '8415226114953', genstand: 'FARTØJSDRAGT M/05, STR.S/46, PS4169', norm: 1, omBord: '1', bemaerkninger: 'Last service: 6-2019', skalBestilles: '0' },
    { nsn: '8415226114954', genstand: 'FARTØJSDRAGT M/05, STR.XXL/, PS4169', norm: 1, omBord: '1', bemaerkninger: 'Last service: ingen dato', skalBestilles: '0' },
    { nsn: '8415226114956', genstand: 'FARTØJSDRAGT M/05, STR.L/54, PS4169', norm: 3, omBord: '3', bemaerkninger: 'Last service: 7-2020 / 6-2019 / 8-2019', skalBestilles: '0' },
    { nsn: '8415226114957', genstand: 'DRAGT, FARTØJ M/05 PS4169 STR S', norm: 1, omBord: '1', bemaerkninger: 'Last service: 9-2018', skalBestilles: '0' },
    { nsn: '8415226114958', genstand: 'FARTØJSDRAGT M/05, STR.XL/, PS4169', norm: 1, omBord: '1', bemaerkninger: 'Last service: 3-2018', skalBestilles: '0' },
    { nsn: '4220226137720', genstand: 'VEST, REDNINGS MERMAN 20, FAST, VOKSEN', norm: 10, omBord: '10', bemaerkninger: 'Udløbsdatoer på lamper: 7-2023, 2-2023 osv.', skalBestilles: '0' },
    { nsn: '4220226169105', genstand: 'VEST, REDNING, SOLAS', norm: 15, omBord: '15', bemaerkninger: 'Udløbsdato: 1 år efter ibrugtagning', skalBestilles: '0' },
    { nsn: '5820997063800', genstand: 'NØDSENDER, PLB', norm: 0, omBord: '0', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '5820124010808', genstand: 'TRANSPONDER, MSLD EASY RESCUE PRO', norm: 6, omBord: '6', bemaerkninger: 'Udløb: 3-2025', skalBestilles: '0' },
    { nsn: '4220226297254', genstand: 'VEST, REDNING SOLAS MSLD', norm: 6, omBord: '6', bemaerkninger: 'Udløb: 9-10-20', skalBestilles: '0' },
    { nsn: '8470226165235', genstand: 'HJELM, KOMPLET, M/HEADSET, ORANGE GB', norm: 1, omBord: '1', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '8470226180872', genstand: 'HJELM, KOMPLET, U/HEADSET, ORANGE GB', norm: 5, omBord: '5', bemaerkninger: 'Udløb: 3-2017, 11-2018', skalBestilles: '0' },
    { nsn: '8415226104262', genstand: 'HJELM, SIKKERHED, HC600GY, RØD, U/VISIR', norm: 6, omBord: '6', bemaerkninger: 'Udløb: 4-2016', skalBestilles: '0' },
    { nsn: '4220226137727', genstand: 'DRAGT, OVERLEVELSES, STR.XL', norm: 4, omBord: '4', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '4220226137728', genstand: 'DRAGT, OVERLEVELSES, STR.UNI-SIZE', norm: 2, omBord: '2', bemaerkninger: 'Sendes til eftersyn hos ProSafe', skalBestilles: '0' },
    { nsn: '4220226137726', genstand: 'DRAGT, OVERLEVELSES, STR.L', norm: 8, omBord: '8', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '4320226313009', genstand: 'BRANDPUMPE TRANSPORTABEL HONDA', norm: 1, omBord: '1', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '1370226298135', genstand: 'BROSÆT M/16 KOMPLET', norm: 1, omBord: '1', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '1370226298133', genstand: 'BÅDSÆT M/16 KOMPLET', norm: 1, omBord: '1', bemaerkninger: '', skalBestilles: '0' },
    { nsn: '1095226239505', genstand: 'LINEKASTNINGSAPPARAT, IKAROS M/15', norm: 4, omBord: '4', bemaerkninger: 'Udløb: 9-2021', skalBestilles: '0' },
    { nsn: '7240221244444', genstand: 'DUNK, DRIVMIDLER, 20L, JERRYCAN', norm: 2, omBord: '2', bemaerkninger: 'Med farelabel', skalBestilles: '0' },
    { nsn: '6515015196131', genstand: 'CPR-D PADS ELEKTRODER M/FEEDBACK T/AED', norm: 2, omBord: '2', bemaerkninger: 'Udløb: 7-2022', skalBestilles: '0' },
    { nsn: '6515226103395', genstand: 'PEDI-PADZ II (BØRNE-ELEKTRODER)', norm: 1, omBord: '1', bemaerkninger: 'Udløb: 4-2022', skalBestilles: '0' },
    { nsn: 'SKIB-MED-C', genstand: 'Skibsmedicin - C', norm: 1, omBord: '1', bemaerkninger: '', skalBestilles: '0' },
  ]);

  const handleInputChange = (index: number, field: keyof MoenstringsItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = () => {
    alert('Mønstringsliste er gemt lokalt!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-md border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Mønstringsliste forud for syn</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">
            Forberedelse og kontrol af lovpligtigt udstyr ombord.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md w-full md:w-auto"
        >
          Gem mønstringsliste
        </button>
      </div>

      {/* RADAR DRIFTSTIMER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Driftstimer for FURUNO RADAR</h3>
          <p className="text-xs text-slate-500">Tænd radar og aflæs TX TIME</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-600">TX TIME:</label>
          <input
            type="text"
            value={radarTime}
            onChange={(e) => setRadarTime(e.target.value)}
            className="p-2 w-32 border border-slate-300 rounded font-bold font-mono text-center text-slate-800"
          />
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="p-3">NSN</th>
                <th className="p-3">Genstand</th>
                <th className="p-3 text-center">Norm</th>
                <th className="p-3 text-center w-24">Om Bord</th>
                <th className="p-3">Bemærkninger / Info</th>
                <th className="p-3 text-center w-24">Skal bestilles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {items.map((item, index) => (
                <tr key={item.nsn + index} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono text-xs text-slate-500">{item.nsn}</td>
                  <td className="p-3 font-bold text-slate-800">{item.genstand}</td>
                  <td className="p-3 text-center text-slate-500 font-bold">{item.norm}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.omBord}
                      onChange={(e) => handleInputChange(index, 'omBord', e.target.value)}
                      className="w-full p-1 text-center font-bold border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.bemaerkninger}
                      onChange={(e) => handleInputChange(index, 'bemaerkninger', e.target.value)}
                      className="w-full p-1 text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none text-slate-600"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.skalBestilles}
                      onChange={(e) => handleInputChange(index, 'skalBestilles', e.target.value)}
                      className="w-full p-1 text-center font-bold border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-red-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
