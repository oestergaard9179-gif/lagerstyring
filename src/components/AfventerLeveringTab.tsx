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
      <div className="p-6 md:p-8 bg-slate-50 border-b-4 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Afventer Levering (Bestillingsark)</h2>
          <p className="text-slate-500 mt-2 font-medium">Dette er din venteliste over varer der er bestilt, men endnu ikke leveret. Når de fysisk ankommer, sætter du antallet og trykker "Modtag" for at lægge dem på skib/container.</p>
        </div>
        {pendingItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <button 
                onClick={() => handleGodkendAlleModtagelser('skib', pendingItems)} 
                disabled={saving}
                className={`px-5 py-3 rounded-md font-bold text-sm border transition-all ${saving ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300'}`}
             >
                Alle til MAX (Skib)
             </button>
             <button 
                onClick={() => handleGodkendAlleModtagelser('container', pendingItems)} 
                disabled={saving}
                className={`px-5 py-3 rounded-md font-bold text-sm border transition-all ${saving ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-400'}`}
             >
                Alle til MAX (Container)
             </button>
          </div>
        )}
      </div>

      {pendingItems.length === 0 ? (
        <div className="p-20 text-center bg-slate-50/50">
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Ingen varer afventer levering</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm uppercase tracking-widest font-bold">
                <th className="p-5 border-b-2 border-slate-900">Varenummer</th>
                <th className="p-5 border-b-2 border-slate-900">Beskrivelse</th>
                <th className="p-5 border-b-2 border-slate-900 text-center text-amber-300">Total Bestilt</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Modtaget Antal</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Placeres i</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {pendingItems.map(item => {
                const godkendelse = godkendelser[item.id] || { amount: 0, destination: 'container' };
                const canApprove = godkendelse.amount > 0 && godkendelse.amount <= item.bestilt;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 font-mono text-sm text-slate-500 font-bold">{item.komponentnummer}</td>
                    <td className="p-5 font-bold text-slate-700 text-lg">{item.objektkorttekst}</td>
                    <td className="p-5 text-center text-amber-600 font-mono font-bold bg-amber-50/30 text-xl">{item.bestilt}</td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center flex-col gap-2">
                        <CounterBlock hideTitle={true} value={godkendelse.amount} onMinus={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.max(0, godkendelse.amount - 1) } }))} onPlus={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.min(item.bestilt, godkendelse.amount + 1) } }))} onChange={(val: number) => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: Math.min(item.bestilt, Math.max(0, val)) } }))} maxClass="bg-emerald-50 border-emerald-200" textClass="text-emerald-800" />
                        <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, amount: item.bestilt } }))} className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 rounded p-1 bg-white">Max ({item.bestilt})</button>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                       <div className="flex bg-slate-200 rounded-lg p-1 border border-slate-300 w-max mx-auto">
                          <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, destination: 'skib' } }))} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${godkendelse.destination === 'skib' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Skib</button>
                          <button onClick={() => setGodkendelser(prev => ({ ...prev, [item.id]: { ...godkendelse, destination: 'container' } }))} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${godkendelse.destination === 'container' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Container</button>
                       </div>
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleGodkendModtagelse(item.id)} disabled={!canApprove || saving} className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold mx-auto transition-all ${canApprove ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
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
