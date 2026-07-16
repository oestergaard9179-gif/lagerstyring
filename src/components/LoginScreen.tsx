import React from 'react';
import { HelmIcon, ShipIcon } from './Icons';
import type { Role } from '../types';

type LoginScreenProps = {
  loginStep: 'role' | 'pin';
  selectedRole: Role;
  pin: string;
  loginError: string;
  setLoginStep: (step: 'role' | 'pin') => void;
  setSelectedRole: (role: Role) => void;
  setPin: (pin: string) => void;
  setLoginError: (error: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  onCancel?: () => void;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  loginStep,
  selectedRole,
  pin,
  loginError,
  setLoginStep,
  setSelectedRole,
  setPin,
  setLoginError,
  handleLogin,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="flex justify-center mb-6 text-blue-900"><HelmIcon /></div>
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-1">Lagerstyring</h1>
        <p className="text-center text-slate-500 mb-8 font-semibold tracking-wide">MHV 909 Speditøren</p>

        {loginStep === 'role' ? (
          <div className="space-y-4">
            <h2 className="text-md font-bold text-slate-400 mb-4 text-center uppercase tracking-wider">Vælg profil</h2>
            <button onClick={() => { setSelectedRole('skib'); setLoginStep('pin'); }} className="w-full flex items-center justify-between p-5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl transition-all border border-blue-200 shadow-sm">
              <div className="flex items-center gap-4 font-bold text-lg"><ShipIcon /> Skib (Besætning)</div>
              <span className="text-2xl opacity-50">→</span>
            </button>
            <button onClick={() => { setSelectedRole('fartøjsmester'); setLoginStep('pin'); }} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl transition-all border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 font-bold text-lg"><HelmIcon /> Fartøjsmester</div>
              <span className="text-2xl opacity-50">→</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Indtast PIN (Rolle: {selectedRole === 'skib' ? 'Skib' : 'Fartøjsmester'})</label>
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 text-center text-3xl tracking-[1em] rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:outline-none transition-colors font-mono" autoFocus placeholder="****" />
              {loginError && <p className="text-red-500 text-sm mt-3 font-semibold text-center">{loginError}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { if (onCancel) { onCancel(); } else { setLoginStep('role'); setPin(''); setLoginError(''); } }} className="px-4 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl w-1/3 hover:bg-slate-200 transition-colors">Tilbage</button>
              <button type="submit" className="px-4 py-4 bg-blue-600 text-white font-bold rounded-xl w-2/3 hover:bg-blue-700 shadow-lg transition-all">Log ind</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
