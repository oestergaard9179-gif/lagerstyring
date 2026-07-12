import React from 'react';

type CounterBlockProps = {
  title?: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (val: number) => void;
  maxClass?: string;
  textClass?: string;
  hideTitle?: boolean;
};

export const CounterBlock: React.FC<CounterBlockProps> = ({ 
  title, 
  value, 
  onMinus, 
  onPlus, 
  onChange, 
  maxClass = "bg-slate-50", 
  textClass = "text-slate-800", 
  hideTitle = false 
}) => (
  <div className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 shadow-sm ${maxClass}`}>
    {!hideTitle && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>}
    <div className="flex items-center gap-1">
      <button onClick={onMinus} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded text-lg text-slate-600 hover:bg-slate-100 shadow-sm">-</button>
      <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className={`w-14 h-8 text-center text-lg font-bold font-mono border border-slate-300 rounded focus:outline-none focus:border-blue-500 ${textClass}`} />
      <button onClick={onPlus} className="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 rounded text-lg text-white hover:bg-slate-700 shadow-sm">+</button>
    </div>
  </div>
);
