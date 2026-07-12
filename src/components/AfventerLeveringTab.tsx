import React from 'react';
import type { Item } from '../types';
import { CounterBlock } from './CounterBlock';

type AfventerLeveringTabProps = {
  items: Item[];
  saving: boolean;
  godkendelser: Record<number, { amount: number, destination: 'skib' | 'container' }>;
  setGodkendelser: (updater: (prev: Record<number, { amount: number, destination: 'skib' | 'container' }>) => Record<number, { amount: number, destination: 'skib' | 'container' }>) => void;
  handleGodkendAlleModtagelser: (destination: 'skib' | 'container', pendingList: Item[]) => void;
  handleGodkendModtagelse: (id: number) => void;
};

export const AfventerLeveringTab: React.FC<AfventerLeveringTabProps> = ({
  items,
  saving,
  godkendelser,
  setGodkendelser,
  handleGodkendAlleModtagelser,
  handleGodkendModtagelse,
}) => {
  const pendingItems = items.filter(item => item.bestilt > 0);

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden">
      <div className="p-3.5 md:p-4 bg-slate-50 border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Afventer Levering (Bestillingsark)</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Dette er din venteliste over varer der er bestilt, men endnu ikke leveret. Når de ankommer, angiver du antallet og trykker "Modtag".</p>
        </div>
        {pendingItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <button 
                onClick={() => handleGodkendAlleModtagelser('skib', pendingItems)} 
                disabled={saving}
                className={`px-3.5 py-1.5 rounded-md font-bold text-xs md:text-sm border transition-all ${saving ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 shadow-sm'}`}
             >
                Alle til MAX (Skib)
             </button>
             <button 
                onClick={() => handleGodkendAlleModtagelser('container', pendingItems)} 
                disabled={saving}
                className={`px-3.5 py-1.5 rounded-md font-bold text-xs md:text-sm border transition-all ${saving ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-400 shadow-sm'}`}
             >
                Alle til MAX (Cont.)
             </button>
          </div>
        )}
      </div>

      {pendingItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Ingen varer afventer levering</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-widest font-bold">
                <th className="p-3 border-b border-slate-900">Varenummer</th>
                <th className="p-3 border-b border-slate-900">Beskrivelse</th>
                <th className="p-3 border-b border-slate-900 text-center text-amber-300">Bestilt</th>
                <th className="p-3 border-b border-slate-900 text-center">Modtaget Antal</th>
                <th className="p-3 border-b border-slate-900 text-center">Placeres i</th>
                <th className="p-3 border-b border-slate-900 text-center">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingItems.map(item => {
                const godkendelse = godkendelser[item.id] || { amount: 0, destination: 'container' };
                const canApprove = godkendelse.amount > 0 && godkendelse.amount <= item.bestilt;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-3 font-mono text-xs text-slate-500 font-bold">{item.komponentnummer}</td>
                    <td className="p-3 font-bold text-slate-700 text-xs md:text-sm">{item.objektkorttekst}</td>
                    <td className="p-3 text-center text-amber-600 font-mono font-bold bg-amber-50/30 text-base">{item.bestilt}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center flex-col items-center gap-1">
                        <CounterBlock hideTitle={true} value={godkendelse.amount} onMinus={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.max(0, godkendelse.amount - 1) } }))} onPlus={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.min(item.bestilt, godkendelse.amount + 1) } }))} onChange={(val: number) => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.min(item.bestilt, Math.max(0, val)) } }))} maxClass="bg-emerald-50 border-emerald-200" textClass="text-emerald-800" />
                        <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: item.bestilt } }))} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 bg-white">Max ({item.bestilt})</button>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                       <div className="flex bg-slate-200 rounded-lg p-0.5 border border-slate-300 w-max mx-auto">
                          <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, destination: 'skib' } }))} className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${godkendelse.destination === 'skib' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Skib</button>
                          <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, destination: 'container' } }))} className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${godkendelse.destination === 'container' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cont.</button>
                       </div>
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => handleGodkendModtagelse(item.id)} disabled={!canApprove || saving} className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold text-xs mx-auto transition-all ${canApprove ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        Modtag
                      </button>
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
