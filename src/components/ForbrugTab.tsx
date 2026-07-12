import React from 'react';
import type { Item, GroupedItem } from '../types';
import { CounterBlock } from './CounterBlock';

type ForbrugTabProps = {
  groupedItems: GroupedItem[];
  expandedSets: number[];
  forbrug: Record<number, number>;
  saving: boolean;
  handleSaveForbrug: () => void;
  toggleSet: (id: number) => void;
  handleForbrugChange: (id: number, delta: number) => void;
  handleForbrugInput: (id: number, val: number) => void;
};

export const ForbrugTab: React.FC<ForbrugTabProps> = ({
  groupedItems,
  expandedSets,
  forbrug,
  saving,
  handleSaveForbrug,
  toggleSet,
  handleForbrugChange,
  handleForbrugInput,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-b-4 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Registrer Forbrug</h2>
          <p className="text-slate-500 mt-2 font-medium">Find sættet, og angiv hvad der er brugt fra skibets lager.</p>
        </div>
        <button 
          onClick={handleSaveForbrug} disabled={saving || Object.keys(forbrug).length === 0}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg w-full md:w-auto ${Object.keys(forbrug).length > 0 ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >{saving ? 'Gemmer...' : 'Gem Forbrug'}</button>
      </div>

      <div className="space-y-4">
        {groupedItems.map(group => {
          const childrenWithStock = group.children.filter(c => c.antal_skib > 0);
          const parentHasStock = group.parent.antal_skib > 0;
          const isSet = group.parent.komponentnummer.length > 15;

          if (isSet && childrenWithStock.length === 0 && !parentHasStock) return null;
          if (!isSet && !parentHasStock) return null;

          const isExpanded = expandedSets.includes(group.parent.id);

          return (
            <div key={group.parent.id} className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
              <div onClick={() => isSet && toggleSet(group.parent.id)} className={`p-5 flex items-center justify-between transition-colors ${isSet ? 'cursor-pointer hover:bg-blue-50 bg-slate-50' : ''} ${isExpanded ? 'border-b-2 border-slate-100' : ''}`}>
                <div className="flex-1 pr-4">
                  <span className={`text-xs font-mono mb-2 block uppercase font-bold ${isSet ? 'text-blue-600' : 'text-slate-400'}`}>Varenr: {group.parent.komponentnummer}</span>
                  <h2 className={`${isSet ? 'text-xl font-extrabold text-blue-900' : 'text-xl font-bold text-slate-800'}`}>{group.parent.objektkorttekst}</h2>
                </div>
                {isSet && (
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">{childrenWithStock.length} dele</div>
                    <span className={`text-slate-400 transform font-bold ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                )}
              </div>
              {!isSet && (
                <div className="p-4 border-t-2 border-slate-100 bg-slate-50/30">
                  <ForbrugItem item={group.parent} forbrug={forbrug} handleForbrugChange={handleForbrugChange} handleForbrugInput={handleForbrugInput} />
                </div>
              )}
              {isExpanded && childrenWithStock.length > 0 && (
                <div className="p-4 bg-slate-50 space-y-4 border-t-2 border-slate-100">
                  {childrenWithStock.map(child => (
                    <ForbrugItem key={child.id} item={child} forbrug={forbrug} handleForbrugChange={handleForbrugChange} handleForbrugInput={handleForbrugInput} />
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

const ForbrugItem = ({ item, forbrug, handleForbrugChange, handleForbrugInput }: { item: Item, forbrug: Record<number, number>, handleForbrugChange: (id: number, delta: number) => void, handleForbrugInput: (id: number, val: number) => void }) => {
  const brugt = forbrug[item.id] || 0;
  const isChanged = brugt > 0;
  return (
    <div className={`p-4 bg-white border-2 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${isChanged ? 'border-red-400 bg-red-50/10' : 'border-slate-100'}`}>
      <div className="flex-1">
        <span className="text-xs font-mono mb-2 block uppercase text-slate-400 font-bold">Varenr: {item.komponentnummer}</span>
        <h3 className="text-lg font-bold text-slate-800">{item.objektkorttekst} <span className="ml-3 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Beholdning: {item.antal_skib}</span></h3>
      </div>
      <div className="flex flex-wrap items-center gap-4 shrink-0 bg-slate-50 p-2 rounded-md border border-slate-100">
        <CounterBlock title="Brugt" value={brugt} onMinus={() => handleForbrugChange(item.id, -1)} onPlus={() => handleForbrugChange(item.id, 1)} onChange={(val: number) => handleForbrugInput(item.id, val)} maxClass="bg-red-50 border-red-200" textClass="text-red-700" />
      </div>
    </div>
  );
};
