import React from 'react';
import type { Item, GroupedItem } from '../types';
import { CounterBlock } from './CounterBlock';

type OptaellingMesterTabProps = {
  groupedItems: GroupedItem[];
  expandedSets: number[];
  saving: boolean;
  hasUnsavedChanges: boolean;
  originalItems: Item[];
  handleSaveChangesLager: () => void;
  toggleSet: (id: number) => void;
  handleCountChange: (id: number, type: 'skib' | 'container' | 'bestilt', delta: number) => void;
  handleDirectInput: (id: number, type: 'skib' | 'container' | 'bestilt', newValue: number) => void;
};

export const OptaellingMesterTab: React.FC<OptaellingMesterTabProps> = ({
  groupedItems,
  expandedSets,
  saving,
  hasUnsavedChanges,
  originalItems,
  handleSaveChangesLager,
  toggleSet,
  handleCountChange,
  handleDirectInput,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-md shadow-md border-b-4 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Total Optælling</h2>
          <p className="text-slate-500 mt-2 font-medium">Brug input-felterne til lynhurtigt at taste beholdning ind (Klik på feltet og tast tal).</p>
        </div>
        <button 
          onClick={handleSaveChangesLager}
          disabled={saving || !hasUnsavedChanges}
          className={`px-8 py-4 rounded-md font-bold text-lg transition-all shadow-lg w-full md:w-auto ${hasUnsavedChanges ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >{saving ? 'Gemmer...' : 'Gem Rettelser'}</button>
      </div>

      <div className="space-y-4">
        {groupedItems.map(group => {
          const isSet = group.parent.komponentnummer.length > 15;
          const isExpanded = expandedSets.includes(group.parent.id);

          return (
            <div key={group.parent.id} className="bg-white rounded-md shadow-sm border-2 border-slate-200 overflow-hidden">
              <div onClick={() => isSet && toggleSet(group.parent.id)} className={`p-5 flex items-center justify-between transition-colors ${isSet ? 'cursor-pointer hover:bg-slate-100 bg-slate-50' : ''}`}>
                <div>
                  <span className={`text-xs font-mono mb-2 block uppercase font-bold ${isSet ? 'text-blue-600' : 'text-slate-400'}`}>Varenr: {group.parent.komponentnummer}</span>
                  <h2 className={`${isSet ? 'text-xl font-extrabold text-blue-900' : 'text-xl font-bold text-slate-800'}`}>{group.parent.objektkorttekst}</h2>
                </div>
              </div>
              {!isSet && (
                <div className="p-4 border-t-2 border-slate-100">
                  <RenderEditableItem item={group.parent} originalItems={originalItems} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput} />
                </div>
              )}
              {isExpanded && group.children.length > 0 && (
                <div className="p-4 bg-slate-100 space-y-4 border-t-2 border-slate-200">
                  {group.children.map(child => (
                    <RenderEditableItem key={child.id} item={child} originalItems={originalItems} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput} />
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

const RenderEditableItem = ({ item, originalItems, handleCountChange, handleDirectInput }: { item: Item, originalItems: Item[], handleCountChange: (id: number, type: 'skib' | 'container' | 'bestilt', delta: number) => void, handleDirectInput: (id: number, type: 'skib' | 'container' | 'bestilt', newValue: number) => void }) => {
  const isEdited = originalItems.find(o => o.id === item.id)?.antal_skib !== item.antal_skib || originalItems.find(o => o.id === item.id)?.antal_container !== item.antal_container;
  return (
    <div className={`p-4 bg-white border-2 rounded-md flex flex-col lg:flex-row justify-between items-center gap-6 ${isEdited ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-100'}`}>
      <div className="flex-1 w-full">
        <span className="text-xs font-mono mb-2 block uppercase text-slate-400 font-bold">Varenr: {item.komponentnummer}</span>
        <h3 className="text-lg font-bold text-slate-800">{item.objektkorttekst}</h3>
      </div>
      <div className="flex gap-4 shrink-0 bg-slate-50/50 p-2 rounded-md border border-slate-100">
        <CounterBlock title="Skib" value={item.antal_skib} onMinus={() => handleCountChange(item.id, 'skib', -1)} onPlus={() => handleCountChange(item.id, 'skib', 1)} onChange={(val: number) => handleDirectInput(item.id, 'skib', val)} maxClass="bg-white" />
        <CounterBlock title="Container" value={item.antal_container} onMinus={() => handleCountChange(item.id, 'container', -1)} onPlus={() => handleCountChange(item.id, 'container', 1)} onChange={(val: number) => handleDirectInput(item.id, 'container', val)} maxClass="bg-white" />
      </div>
    </div>
  );
};
