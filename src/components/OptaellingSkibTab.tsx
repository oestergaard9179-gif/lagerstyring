import React from 'react';
import type { Item, GroupedItem } from '../types';
import { CounterBlock } from './CounterBlock';

type OptaellingSkibTabProps = {
  groupedItems: GroupedItem[];
  expandedSets: number[];
  saving: boolean;
  hasUnsavedChanges: boolean;
  handleSaveChangesLager: () => void;
  toggleSet: (id: number) => void;
  handleCountChange: (id: number, type: 'skib' | 'container' | 'bestilt', delta: number) => void;
  handleDirectInput: (id: number, type: 'skib' | 'container' | 'bestilt', newValue: number) => void;
};

export const OptaellingSkibTab: React.FC<OptaellingSkibTabProps> = ({
  groupedItems,
  expandedSets,
  saving,
  hasUnsavedChanges,
  handleSaveChangesLager,
  toggleSet,
  handleCountChange,
  handleDirectInput,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-md border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Optælling</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">Manuel korrektion af skibets beholdning.</p>
        </div>
        <button 
          onClick={handleSaveChangesLager} disabled={saving || !hasUnsavedChanges}
          className={`px-5 py-2.5 rounded-md font-bold text-sm md:text-base transition-all shadow-md w-full md:w-auto ${hasUnsavedChanges ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >{saving ? 'Gemmer...' : hasUnsavedChanges ? 'Gem Optælling' : 'Intet at gemme'}</button>
      </div>

      <div className="space-y-2">
        {groupedItems.map(group => {
          const isSet = group.parent.komponentnummer.length > 15;
          const isExpanded = expandedSets.includes(group.parent.id);

          return (
            <div key={group.parent.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div onClick={() => isSet && toggleSet(group.parent.id)} className={`p-3 md:p-3.5 flex items-center justify-between transition-colors ${isSet ? 'cursor-pointer hover:bg-blue-50 bg-slate-50/50' : ''}`}>
                <div className="flex-1 pr-3">
                  <span className={`text-[10px] md:text-xs font-mono mb-1 block uppercase font-bold ${isSet ? 'text-blue-600' : 'text-slate-400'}`}>Varenr: {group.parent.komponentnummer} <span className="ml-2 text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">Norm: {group.parent.maengde}</span></span>
                  <h2 className={`${isSet ? 'text-sm md:text-base font-extrabold text-blue-900' : 'text-sm md:text-base font-bold text-slate-800'}`}>{group.parent.objektkorttekst}</h2>
                </div>
              </div>
              {!isSet && (
                <div className="p-2 md:p-3 border-t border-slate-100 bg-slate-50/30">
                  <RenderItem item={group.parent} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput} />
                </div>
              )}
              {isExpanded && group.children.length > 0 && (
                <div className="p-2 md:p-3 bg-slate-50 space-y-2 border-t border-slate-100">
                  {group.children.map(child => (
                    <RenderItem key={child.id} item={child} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput} />
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

const RenderItem = ({ item, handleCountChange, handleDirectInput }: { item: Item, handleCountChange: (id: number, type: 'skib' | 'container' | 'bestilt', delta: number) => void, handleDirectInput: (id: number, type: 'skib' | 'container' | 'bestilt', newValue: number) => void }) => (
  <div className="p-2.5 md:p-3 bg-white border border-slate-100 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-200">
    <div className="flex-1">
      <span className="text-[10px] md:text-xs font-mono mb-1 block uppercase text-slate-400 font-bold">Varenr: {item.komponentnummer}</span>
      <h3 className="text-xs md:text-sm font-bold text-slate-800 leading-snug">{item.objektkorttekst}</h3>
    </div>
    <div className="flex gap-2 shrink-0 bg-slate-50 p-1.5 rounded-md border border-slate-100 self-start md:self-auto">
      <CounterBlock title="Skib" value={item.antal_skib} onMinus={() => handleCountChange(item.id, 'skib', -1)} onPlus={() => handleCountChange(item.id, 'skib', 1)} onChange={(val: number) => handleDirectInput(item.id, 'skib', val)} maxClass="bg-white" />
    </div>
  </div>
);
