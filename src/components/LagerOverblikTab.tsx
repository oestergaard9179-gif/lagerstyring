import React from 'react';
import type { Item, GroupedItem } from '../types';

type LagerOverblikTabProps = {
  groupedItems: GroupedItem[];
  expandedSets: number[];
  orderInputActive: Record<number, { amount: number, lenh: string }>;
  generatePDF: (type: 'skib' | 'container') => void;
  toggleSet: (id: number) => void;
  setOrderInputActive: (val: Record<number, { amount: number, lenh: string }>) => void;
  handleAddToCart: (item: Item, amount: number, lenh: string) => void;
};

export const LagerOverblikTab: React.FC<LagerOverblikTabProps> = ({
  groupedItems,
  expandedSets,
  orderInputActive,
  generatePDF,
  toggleSet,
  setOrderInputActive,
  handleAddToCart,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-md border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Lager Overblik</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Læsevisning sat i mapper. Opret bestillinger direkte til lageret herfra, eller træk en PDF.</p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto">
          <button onClick={() => generatePDF('skib')} className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white text-xs md:text-sm font-bold rounded-md shadow-md hover:bg-slate-700">PDF (Skib)</button>
          <button onClick={() => generatePDF('container')} className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white text-xs md:text-sm font-bold rounded-md shadow-md hover:bg-slate-700">PDF (Container)</button>
        </div>
      </div>

      <div className="space-y-2">
        {groupedItems.map(group => {
          const isSet = group.parent.komponentnummer.length > 15;
          const isExpanded = expandedSets.includes(group.parent.id);

          return (
            <div key={group.parent.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div onClick={() => isSet && toggleSet(group.parent.id)} className={`p-3 md:p-3.5 flex items-center justify-between transition-colors ${isSet ? 'cursor-pointer hover:bg-slate-100 bg-slate-50' : ''}`}>
                <div className="flex-1 pr-3">
                  <span className={`text-[10px] md:text-xs font-mono mb-1 block uppercase font-bold ${isSet ? 'text-blue-600' : 'text-slate-400'}`}>Varenr: {group.parent.komponentnummer}</span>
                  <h2 className={`${isSet ? 'text-sm md:text-base font-extrabold text-blue-900' : 'text-sm md:text-base font-bold text-slate-800'}`}>{group.parent.objektkorttekst}</h2>
                </div>
                {isSet && (
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded-md">{group.children.length} dele</div>
                    <span className={`text-slate-400 transform text-xs font-bold ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                )}
              </div>
              {!isSet && (
                <div className="p-2 md:p-3 border-t border-slate-100 bg-slate-50/30">
                  <RenderOverblikItem item={group.parent} orderInputActive={orderInputActive} setOrderInputActive={setOrderInputActive} handleAddToCart={handleAddToCart} />
                </div>
              )}
              {isExpanded && group.children.length > 0 && (
                <div className="p-2 md:p-3 bg-slate-100 space-y-2 border-t border-slate-200">
                  {group.children.map(child => (
                    <RenderOverblikItem key={child.id} item={child} orderInputActive={orderInputActive} setOrderInputActive={setOrderInputActive} handleAddToCart={handleAddToCart} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderOverblikItem = ({ item, orderInputActive, setOrderInputActive, handleAddToCart }: { item: Item, orderInputActive: Record<number, { amount: number, lenh: string }>, setOrderInputActive: (val: Record<number, { amount: number, lenh: string }>) => void, handleAddToCart: (item: Item, amount: number, lenh: string) => void }) => {
  const isActive = !!orderInputActive[item.id];
  return (
    <div className="p-2.5 md:p-3 bg-white border border-slate-100 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300">
      <div className="flex-1">
        <span className="text-[10px] md:text-xs font-mono mb-1 block uppercase text-slate-400 font-bold">
          Varenr: {item.komponentnummer} 
          <span className="ml-2 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[9px] md:text-[10px]">Norm: {item.maengde}</span>
          {item.udloebsdato && (
            <span className="ml-2 text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold">Udløb: {item.udloebsdato}</span>
          )}
        </span>
        <h3 className="text-xs md:text-sm font-bold text-slate-800 leading-snug">{item.objektkorttekst}</h3>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 shrink-0">
         <div className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded text-center min-w-[50px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Skib</span>
            <span className="text-xs md:text-sm font-bold text-blue-900">{item.antal_skib}</span>
         </div>
         <div className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded text-center min-w-[50px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Cont.</span>
            <span className="text-xs md:text-sm font-bold text-slate-800">{item.antal_container}</span>
         </div>
         <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded text-center min-w-[50px]">
            <span className="block text-[9px] uppercase font-bold text-amber-600">Bestilt</span>
            <span className="text-xs md:text-sm font-bold text-amber-800">{item.bestilt}</span>
         </div>

         {/* Bestil Ekstra UI */}
         <div className="ml-1 border-l border-slate-100 pl-2">
           {isActive ? (
              <div className="flex items-center gap-1.5 bg-blue-50 p-1 rounded border border-blue-200">
                <input type="number" value={orderInputActive[item.id].amount} onChange={e => setOrderInputActive({...orderInputActive, [item.id]: {...orderInputActive[item.id], amount: parseInt(e.target.value)||0}})} className="w-12 p-0.5 text-center font-bold text-xs border border-slate-300 rounded" />
                <input type="text" value={orderInputActive[item.id].lenh} onChange={e => setOrderInputActive({...orderInputActive, [item.id]: {...orderInputActive[item.id], lenh: e.target.value.toUpperCase()}})} className="w-10 p-0.5 text-center font-bold text-xs uppercase border border-slate-300 rounded" />
                <button onClick={() => handleAddToCart(item, orderInputActive[item.id].amount, orderInputActive[item.id].lenh)} className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-xs hover:bg-blue-700">Tilføj</button>
                <button onClick={() => { const c={...orderInputActive}; delete c[item.id]; setOrderInputActive(c); }} className="text-slate-400 hover:text-red-500 font-bold px-1 text-xs">X</button>
              </div>
           ) : (
              <button onClick={() => setOrderInputActive({...orderInputActive, [item.id]: { amount: 1, lenh: item.lenh || 'EA' }})} className="bg-white border border-blue-200 text-blue-700 font-bold px-2.5 py-1.5 rounded text-xs hover:bg-blue-50">
                + Bestil
              </button>
           )}
         </div>
      </div>
    </div>
  );
};
