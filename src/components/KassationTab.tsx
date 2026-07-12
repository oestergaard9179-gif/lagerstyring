import React, { useState } from 'react';
import type { Item } from '../types';
import { generateForsyningsblanket, type BlanketOptions } from '../utils/pdfGenerator';
import { CounterBlock } from './CounterBlock';

type KassationTabProps = {
  items: Item[];
};

export const KassationTab: React.FC<KassationTabProps> = ({ items }) => {
  // Filtrer varer der har kassationsmetode "centralt med besigtigelse"
  const kassationItems = items.filter(
    item => item.kassationsmetode?.toLowerCase().includes('centralt med besigtigelse')
  );

  const [returAmounts, setReturAmounts] = useState<Record<number, number>>({});

  const itemsWithRetur = kassationItems.map(item => {
    const amountToReturn = returAmounts[item.id] !== undefined ? returAmounts[item.id] : (item.antal_retur || 0);
    return {
      ...item,
      amountToReturn
    };
  });

  const exportItems = itemsWithRetur.filter(item => item.amountToReturn > 0);

  const handleGenerateReturPDF = () => {
    const options: BlanketOptions = {
      prioritet: 'Rutine',
      dato: new Date().toISOString().split('T')[0],
      fra: 'MHV 909',
      til: 'FSC / FMI',
      emneRekvirering: false,
      emneIntern: false,
      emneLevering: false,
      emneTilbagelevering: true,
      emneOverfoersel: false,
      emneLaan: false,
      indkoebRammeaftale: false,
      indkoebCivil: false,
      indkoebSaerlig: false,
      indkoebBeredskab: false,
      bemaerkninger: 'Kassation (Centralt med besigtigelse)'
    };

    const finalExport = exportItems.map(item => ({
      ...item,
      antal_retur: item.amountToReturn,
      amountToOrder: 0 // For at tilfredsstille typen i pdfGenerator
    }));

    if (finalExport.length === 0) {
      alert("Angiv venligst et returantal større end 0 for mindst én vare.");
      return;
    }

    generateForsyningsblanket(options, finalExport, true);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8 bg-slate-50 border-b-4 border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Kassation</h2>
          <p className="text-slate-500 mt-2 font-medium">
            Oversigt over varer med kassationsmetoden "Centralt med besigtigelse". Angiv returantal og generer tilbageleveringsblanket.
          </p>
        </div>
        {kassationItems.length > 0 && (
          <button
            onClick={handleGenerateReturPDF}
            disabled={exportItems.length === 0}
            className="flex items-center justify-center gap-2 bg-red-700 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-600 shadow-lg transition-colors border border-red-800 disabled:opacity-50"
          >
            Generér Retur Blanket ({exportItems.length})
          </button>
        )}
      </div>

      {kassationItems.length === 0 ? (
        <div className="p-20 text-center bg-slate-50/50">
          <div className="inline-block p-6 bg-slate-100 text-slate-400 rounded-full mb-6 shadow-sm border-4 border-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Ingen kassationsvarer</h3>
          <p className="text-slate-500 text-lg">Der er p.t. ingen varer markeret til 'centralt med besigtigelse'.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm uppercase tracking-widest font-bold">
                <th className="p-5 border-b-2 border-slate-900">Varenummer</th>
                <th className="p-5 border-b-2 border-slate-900">Beskrivelse</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Norm</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Beholdning (Skib+Cont)</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Kassationsmetode</th>
                <th className="p-5 border-b-2 border-slate-900 text-center bg-red-700 shadow-inner">Returantal</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {itemsWithRetur.map(item => {
                const beholdning = item.antal_skib + item.antal_container;
                return (
                  <tr key={item.id} className={`transition-colors group ${item.amountToReturn > 0 ? 'hover:bg-red-50/20 bg-red-50/5' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-5 font-mono text-sm text-slate-600 font-bold">{item.komponentnummer}</td>
                    <td className="p-5 font-bold text-slate-700 text-lg">{item.objektkorttekst}</td>
                    <td className="p-5 text-center text-slate-500 font-mono font-bold">{item.maengde}</td>
                    <td className="p-5 text-center text-slate-600 font-mono font-bold">{beholdning}</td>
                    <td className="p-5 text-center text-red-600 font-bold">{item.kassationsmetode}</td>
                    <td className="p-3 text-center bg-red-50/30 border-l-2 border-red-100 shadow-sm">
                      <div className="flex justify-center">
                        <CounterBlock 
                          hideTitle 
                          value={item.amountToReturn} 
                          onMinus={() => setReturAmounts(prev => ({ ...prev, [item.id]: Math.max(0, item.amountToReturn - 1) }))} 
                          onPlus={() => setReturAmounts(prev => ({ ...prev, [item.id]: item.amountToReturn + 1 }))} 
                          onChange={(val: number) => setReturAmounts(prev => ({ ...prev, [item.id]: Math.max(0, val) }))} 
                          maxClass="border-red-200 bg-white"
                          textClass="text-red-800"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
