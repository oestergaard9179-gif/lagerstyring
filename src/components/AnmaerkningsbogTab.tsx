import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Item } from '../types';

export const AnmaerkningerTab: React.FC = () => {
  const [navn, setNavn] = useState('');
  const [maNummer, setMaNummer] = useState('');
  const [telefon, setTelefon] = useState('');
  const [anmaerkning, setAnmaerkning] = useState('');
  const [forbrug, setForbrug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [forbrugMaengde, setForbrugMaengde] = useState<number>(1);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('objektkorttekst', { ascending: true });
      if (data) {
        setItems(data);
      } else if (error) {
        console.error('Fejl ved hentning af varer:', error);
      }
    };
    fetchItems();
  }, []);

  const handleAddForbrugToText = () => {
    if (!selectedItemId) return;
    const item = items.find(i => i.id.toString() === selectedItemId);
    if (item) {
      const extraText = `\n[Forbrug: ${forbrugMaengde} stk. - ${item.objektkorttekst} (Varenr: ${item.komponentnummer})]`;
      setAnmaerkning(prev => prev + extraText);
      // Reset selection
      setSelectedItemId('');
      setForbrugMaengde(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navn || !maNummer || !anmaerkning) {
      alert('Udfyld venligst alle påkrævede felter (Navn, MA-nummer og Anmærkning)');
      return;
    }

    setLoading(true);
    setSuccess(false);

    const nyAnmaerkning = {
      navn,
      ma_nummer: maNummer,
      telefon: telefon.trim() || 'Ikke oplyst',
      anmaerkning,
      forbrug,
      status: 'Åben'
    };

    const { error } = await supabase
      .from('anmaerkninger')
      .insert([nyAnmaerkning]);

    setLoading(false);

    if (error) {
      console.error('Fejl ved oprettelse af anmærkning:', error);
      alert('Der opstod en fejl: ' + error.message);
    } else {
      setSuccess(true);
      setNavn('');
      setMaNummer('');
      setTelefon('');
      setAnmaerkning('');
      setForbrug(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Opret ny anmærkning</h2>
        <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">
          Besætningen kan her indtaste en ny anmærkning til Fartøjsmesteren.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-bold text-center">
          ✓ Anmærkningen er oprettet og sendt til Fartøjsmesteren!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Navn *</label>
            <input
              type="text"
              required
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
              placeholder="F.eks. Jensen"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">MA-nummer *</label>
            <input
              type="text"
              required
              value={maNummer}
              onChange={(e) => setMaNummer(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
              placeholder="F.eks. 123456"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Telefonnummer</label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
            placeholder="F.eks. +45 12 34 56 78"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Anmærkning *</label>
          <textarea
            required
            rows={4}
            value={anmaerkning}
            onChange={(e) => setAnmaerkning(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
            placeholder="Beskriv fejlen eller manglen her..."
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forbrug}
              onChange={(e) => setForbrug(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="block text-sm font-bold text-slate-800">Har der været et forbrug?</span>
              <span className="block text-xs text-slate-500 font-medium">Marker hvis du har brugt reservedele eller materiel i forbindelse med dette.</span>
            </div>
          </label>

          {forbrug && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 space-y-3">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Vælg materiel & mængde</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
                  >
                    <option value="">-- Vælg en vare --</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.objektkorttekst} (Beholdning: {item.antal_skib})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={forbrugMaengde}
                    onChange={(e) => setForbrugMaengde(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
                    placeholder="Antal"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddForbrugToText}
                disabled={!selectedItemId}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400"
              >
                Tilføj forbrug til anmærkningen
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md disabled:bg-slate-300"
        >
          {loading ? 'Indsender...' : 'Indsend anmærkning'}
        </button>
      </form>
    </div>
  );
};
