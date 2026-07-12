import React, { useState } from 'react';
import type { Item } from '../types';
import { CounterBlock } from './CounterBlock';
import { generateForsyningsblanket, type BlanketOptions } from '../utils/pdfGenerator';

type BestillingskurvTabProps = {
  items: Item[];
  customOrderAmounts: Record<number, number>;
  orderSelected: Record<number, boolean>;
  setCustomOrderAmounts: (updater: (prev: Record<number, number>) => Record<number, number>) => void;
  setOrderSelected: (updater: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  handleGennemfoerBestilling: (itemsToOrder: (Item & { amountToOrder: number })[]) => void;
};

export const BestillingskurvTab: React.FC<BestillingskurvTabProps> = ({
  items,
  customOrderAmounts,
  orderSelected,
  setCustomOrderAmounts,
  setOrderSelected,
  handleGennemfoerBestilling,
}) => {
  const draftOrderList = items.map(item => {
    const isSet = item.komponentnummer.length > 15;
    if (isSet) return null;

    const beholdning = item.antal_skib + item.antal_container;
    const missing = Math.max(0, item.maengde - beholdning - item.bestilt);
    
    const customAmount = customOrderAmounts[item.id];
    const amountToOrder = customAmount !== undefined ? customAmount : missing;

    if (amountToOrder > 0) {
        return {
            ...item,
            amountToOrder,
            selected: orderSelected[item.id] ?? true
        }
    }
    return null;
  }).filter(Boolean) as (Item & { amountToOrder: number, selected: boolean })[];

  const itemsToOrder = draftOrderList.filter(i => i.selected && i.amountToOrder > 0);

// I BestillingskurvTab.tsx
const [blanketSettings, setBlanketSettings] = useState<BlanketOptions>({
    prioritet: 'Høj',
    dato: new Date().toISOString().split('T')[0],
    fra: 'MHV 909 Speditøren',
    til: '',
    emneRekvirering: true,
    emneIntern: false,
    emneLevering: true,
    emneTilbagelevering: false,
    emneOverfoersel: false,
    emneLaan: false,
    indkoebRammeaftale: false,
    indkoebCivil: false,
    indkoebSaerlig: false,
    indkoebBeredskab: false,
    bemaerkninger: 'Mangelliste / Udløb'
});
return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden">
      {/* HEADER OG KNAPPER */}
      <div className="p-6 md:p-8 bg-slate-50 border-b-4 border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Bestillingskurv</h2>
          <p className="text-slate-500 mt-2 font-medium">Her er alle varer du mangler ift. normen. Juster indstillingerne og generér PDF eller send til systemet.</p>
        </div>
        
        {/* Dine knapper placeret herinde */}
        {draftOrderList.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={() => generateForsyningsblanket(blanketSettings, itemsToOrder, false)} 
              disabled={itemsToOrder.length === 0} 
              className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-bold hover:bg-slate-300 transition-colors border border-slate-300 disabled:opacity-50"
            >
              Vis PDF
            </button>
            <button 
              onClick={() => handleGennemfoerBestilling(itemsToOrder)} 
              disabled={itemsToOrder.length === 0} 
              className="flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-600 shadow-lg transition-colors border border-blue-800 disabled:opacity-50"
            >
              Gennemfør Bestilling ({itemsToOrder.length})
            </button>
          </div>
        )}
      </div>

      {draftOrderList.length > 0 && (
        <div className="p-6 md:p-8 bg-slate-50/50 border-b-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Fra (Afsender):</label>
            <input 
              type="text" 
              value={blanketSettings.fra} 
              onChange={e => setBlanketSettings(prev => ({ ...prev, fra: e.target.value }))}
              className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-800 bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Til (Modtager):</label>
            <input 
              type="text" 
              value={blanketSettings.til} 
              onChange={e => setBlanketSettings(prev => ({ ...prev, til: e.target.value }))}
              className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-800 bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Prioritet:</label>
            <select 
              value={blanketSettings.prioritet} 
              onChange={e => setBlanketSettings(prev => ({ ...prev, prioritet: e.target.value }))}
              className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-800 bg-white"
            >
              <option value="Rutine">Rutine</option>
              <option value="Høj">Høj</option>
              <option value="Lyn">Lyn</option>
            </select>
          </div>
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700">Bemærkninger / Reference:</label>
            <input 
              type="text" 
              value={blanketSettings.bemaerkninger} 
              onChange={e => setBlanketSettings(prev => ({ ...prev, bemaerkninger: e.target.value }))}
              className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-800 bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Dato:</label>
            <input 
              type="date" 
              value={blanketSettings.dato} 
              onChange={e => setBlanketSettings(prev => ({ ...prev, dato: e.target.value }))}
              className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-800 bg-white"
            />
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t-2 border-slate-100 pt-4">
            <span className="block text-sm font-bold text-slate-700 mb-3">Emne & Indkøbsmetode</span>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneRekvirering} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneRekvirering: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Rekvirering
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneIntern} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneIntern: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Intern
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneLevering} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneLevering: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Levering
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneTilbagelevering} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneTilbagelevering: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Tilbagelevering
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneOverfoersel} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneOverfoersel: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Overførsel
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.emneLaan} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, emneLaan: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Lån
              </label>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 border-t border-dashed border-slate-200 pt-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.indkoebRammeaftale} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, indkoebRammeaftale: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Rammeaftale
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.indkoebCivil} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, indkoebCivil: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Civil leverandør
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.indkoebSaerlig} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, indkoebSaerlig: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Særlig bemyndigelse
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={blanketSettings.indkoebBeredskab} 
                  onChange={e => setBlanketSettings(prev => ({ ...prev, indkoebBeredskab: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                Beredskab
              </label>
            </div>
          </div>
        </div>
      )}

      {draftOrderList.length === 0 ? (
        <div className="p-20 text-center bg-slate-50/50">
          <div className="inline-block p-6 bg-emerald-100 text-emerald-600 rounded-full mb-6 shadow-sm border-4 border-emerald-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Alt er i skønneste orden!</h3>
          <p className="text-slate-500 text-lg">Der er ingen mangler, og du har ikke tilføjet nogle ekstra bestillinger til kurven.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm uppercase tracking-widest font-bold">
                <th className="p-3 border-b-2 border-slate-900 text-center w-16">✓</th>
                <th className="p-5 border-b-2 border-slate-900">Varenummer</th>
                <th className="p-5 border-b-2 border-slate-900">Beskrivelse</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Norm</th>
                <th className="p-5 border-b-2 border-slate-900 text-center">Lager (Skib+Cont)</th>
                <th className="p-5 border-b-2 border-slate-900 text-center text-amber-300">I Restordre</th>
                <th className="p-5 border-b-2 border-slate-900 text-center bg-blue-700 shadow-inner">Antal at bestille</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {draftOrderList.map(item => {
                const beholdning = item.antal_skib + item.antal_container;
                
                return (
                  <tr key={item.id} className={`transition-colors group ${item.selected ? 'hover:bg-blue-50/30' : 'bg-slate-50/50 opacity-60 grayscale'}`}>
                    <td className="p-3 text-center border-r-2 border-slate-100">
                      <input 
                        type="checkbox" 
                        checked={item.selected} 
                        onChange={(e) => setOrderSelected((prev: Record<number, boolean>) => ({ ...prev, [item.id]: e.target.checked }))} 
                        className="w-5 h-5 cursor-pointer accent-blue-600"
                      />
                    </td>
                    <td className="p-5 font-mono text-sm text-slate-500 font-bold group-hover:text-slate-800 transition-colors">{item.komponentnummer}</td>
                    <td className="p-5 font-bold text-slate-700 text-lg">{item.objektkorttekst}</td>
                    <td className="p-5 text-center text-slate-500 font-mono font-bold">{item.maengde}</td>
                    <td className="p-5 text-center text-slate-600 font-mono font-bold">{beholdning}</td>
                    <td className="p-5 text-center text-amber-600 font-mono font-bold">{item.bestilt}</td>
                    <td className="p-3 text-center bg-blue-50/50 border-l-2 border-blue-100 shadow-sm">
                      <div className="flex justify-center">
                        <CounterBlock 
                          hideTitle 
                          value={item.amountToOrder} 
                          onMinus={() => setCustomOrderAmounts((prev: Record<number, number>) => ({ ...prev, [item.id]: Math.max(0, item.amountToOrder - 1) }))} 
                          onPlus={() => setCustomOrderAmounts((prev: Record<number, number>) => ({ ...prev, [item.id]: item.amountToOrder + 1 }))} 
                          onChange={(val: number) => setCustomOrderAmounts((prev: Record<number, number>) => ({ ...prev, [item.id]: Math.max(0, val) }))} 
                          maxClass={`border-blue-200 bg-white ${!item.selected ? 'pointer-events-none' : ''}`}
                          textClass="text-blue-800"
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
