import React from 'react';
import type { Item } from '../types';

type PluklisteTabProps = {
  items: Item[];
  saving: boolean;
  handleMoveAllToShip: (movingItems: Item[]) => void;
  handleMoveToShip: (item: Item, amount: number) => void;
};

export const PluklisteTab: React.FC<PluklisteTabProps> = ({
  items,
  saving,
  handleMoveAllToShip,
  handleMoveToShip,
}) => {
  const movingItems = items.filter(item => {
    const deficitOnShip = item.maengde - item.antal_skib;
    return deficitOnShip > 0 && item.antal_container > 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden">
      <div className="p-3.5 md:p-4 bg-slate-50 border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Plukliste (Fra Container til Skib)</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Varer hvor skibet mangler op til normen, OG der er dækning i containeren.</p>
        </div>
        {movingItems.length > 0 && (
          <button onClick={() => handleMoveAllToShip(movingItems)} disabled={saving} className="px-3.5 py-1.5 bg-purple-700 text-white font-bold rounded-md shadow-sm hover:bg-purple-600 text-xs md:text-sm w-full md:w-auto">
             {saving ? 'Flytter...' : `Flyt alle mangler til skib (${movingItems.length})`}
          </button>
        )}
      </div>

      {movingItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Ingen varer skal flyttes!</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-widest font-bold">
                <th className="p-3 border-b border-slate-900">Varenummer</th>
                <th className="p-3 border-b border-slate-900">Beskrivelse</th>
                <th className="p-3 border-b border-slate-900 text-center">Mangler på skib</th>
                <th className="p-3 border-b border-slate-900 text-center">I Container</th>
                <th className="p-3 border-b border-slate-900 text-center bg-purple-700 shadow-inner">Flyttes Nu</th>
                <th className="p-3 border-b border-slate-900 text-center">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movingItems.map(item => {
                const deficitOnShip = item.maengde - item.antal_skib;
                const canMove = Math.min(deficitOnShip, item.antal_container);
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-3 font-mono text-xs text-slate-500 font-bold">{item.komponentnummer}</td>
                    <td className="p-3 font-bold text-slate-700 text-xs md:text-sm">{item.objektkorttekst}</td>
                    <td className="p-3 text-center text-slate-500 font-mono font-bold text-xs">{item.antal_skib} / {item.maengde} (Mangler: {deficitOnShip})</td>
                    <td className="p-3 text-center text-slate-600 font-mono font-bold bg-slate-50/50 text-xs">{item.antal_container}</td>
                    <td className="p-3 text-center font-extrabold text-purple-800 bg-purple-50 font-mono text-lg border-x border-purple-100 shadow-sm">{canMove}</td>
                    <td className="p-2 text-center">
                      <button onClick={() => handleMoveToShip(item, canMove)} disabled={saving} className="bg-purple-600 text-white font-bold px-3 py-1.5 rounded text-xs hover:bg-purple-700 shadow-sm">
                        Flyt til skib
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
