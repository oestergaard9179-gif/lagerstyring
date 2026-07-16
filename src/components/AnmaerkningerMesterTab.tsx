import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Anmaerkning } from '../types';

export const AnmaerkningerMesterTab: React.FC = () => {
  const [anmaerkninger, setAnmaerkninger] = useState<Anmaerkning[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState<number | null>(null);
  const [fartoejsmesterNavn, setFartoejsmesterNavn] = useState('');
  const [kvitteringKommentar, setKvitteringKommentar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnmaerkninger = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anmaerkninger')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fejl ved hentning af anmærkninger:', error);
    } else if (data) {
      setAnmaerkninger(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnmaerkninger();
  }, []);

  const handleKvitter = async (id: number) => {
    if (!fartoejsmesterNavn || !kvitteringKommentar) {
      alert('Venligst udfyld både dit navn og en kommentar til udbedringen.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('anmaerkninger')
      .update({
        status: 'Lukket',
        fartoejsmester_navn: fartoejsmesterNavn,
        kvittering_kommentar: kvitteringKommentar
      })
      .eq('id', id);

    setSubmitting(false);

    if (error) {
      console.error('Fejl ved kvittering:', error);
      alert('Der opstod en fejl: ' + error.message);
    } else {
      setSigningId(null);
      setFartoejsmesterNavn('');
      setKvitteringKommentar('');
      fetchAnmaerkninger();
    }
  };

  const handleSetSet = async (id: number) => {
    setSubmitting(true);
    const { error } = await supabase
      .from('anmaerkninger')
      .update({
        status: 'Set'
      })
      .eq('id', id);

    setSubmitting(false);

    if (error) {
      console.error('Fejl ved opdatering af status:', error);
      alert('Der opstod en fejl: ' + error.message);
    } else {
      fetchAnmaerkninger();
    }
  };

  const aabneAnmaerkninger = anmaerkninger.filter(a => a.status === 'Åben');
  const seteAnmaerkninger = anmaerkninger.filter(a => a.status === 'Set');
  const lukkedeAnmaerkninger = anmaerkninger.filter(a => a.status === 'Lukket');

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-md border-b-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Behandling af Anmærkninger</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">
            Fartøjsmesterens oversigt over indsendte anmærkninger fra besætningen.
          </p>
        </div>
        <button 
          onClick={fetchAnmaerkninger}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg border border-slate-300 transition-colors"
        >
          Opdater liste
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500 font-bold animate-pulse">Henter anmærkninger...</div>
      ) : (
        <div className="space-y-6">
          {/* ÅBNE ANMÆRKNINGER */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-amber-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              Nye Anmærkninger ({aabneAnmaerkninger.length})
            </h3>
            
            {aabneAnmaerkninger.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-slate-500 border border-slate-200 font-medium text-sm">
                Der er ingen nye ubehandlede anmærkninger.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {aabneAnmaerkninger.map(a => (
                  <div key={a.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-amber-500 border-y border-r border-slate-200 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Indsendt af</span>
                        <h4 className="font-extrabold text-slate-800">{a.navn} (MA: {a.ma_nummer})</h4>
                        {a.telefon && <p className="text-xs text-slate-500">Tlf: {a.telefon}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${a.forbrug ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                        {a.forbrug ? 'Med forbrug ⚠' : 'Uden forbrug'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Anmærkning</span>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium">{a.anmaerkning}</p>
                    </div>

                    {signingId === a.id ? (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 mt-3">
                        <h5 className="font-bold text-sm text-slate-800">Kvittér og luk anmærkning</h5>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Fartøjsmester Navn *</label>
                            <input
                              type="text"
                              required
                              value={fartoejsmesterNavn}
                              onChange={(e) => setFartoejsmesterNavn(e.target.value)}
                              className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="Dit navn"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Udbedring & Bemærkninger *</label>
                            <textarea
                              required
                              rows={3}
                              value={kvitteringKommentar}
                              onChange={(e) => setKvitteringKommentar(e.target.value)}
                              className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="Hvad er udbedret?"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setSigningId(null)}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-100"
                            >
                              Annuller
                            </button>
                            <button
                              onClick={() => handleKvitter(a.id!)}
                              disabled={submitting}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow"
                            >
                              {submitting ? 'Gemmer...' : 'Godkend & Luk'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSigningId(a.id!);
                            setFartoejsmesterNavn('');
                            setKvitteringKommentar('');
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                        >
                          ✓ Behandl & Kvittér
                        </button>
                        <button
                          onClick={() => handleSetSet(a.id!)}
                          disabled={submitting}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                        >
                          👁 Markér som Set
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SETE / KVITTEREDE ANMÆRKNINGER (SET) */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <h3 className="text-lg font-extrabold text-blue-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              Sete / Kvitterede Anmærkninger ({seteAnmaerkninger.length})
            </h3>
            
            {seteAnmaerkninger.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-slate-500 border border-slate-200 font-medium text-sm">
                Der er ingen kvitterede/sete anmærkninger, som ikke er udbedret endnu.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {seteAnmaerkninger.map(a => (
                  <div key={a.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500 border-y border-r border-slate-200 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Indsendt af</span>
                        <h4 className="font-extrabold text-slate-800">{a.navn} (MA: {a.ma_nummer})</h4>
                        {a.telefon && <p className="text-xs text-slate-500">Tlf: {a.telefon}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${a.forbrug ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                        {a.forbrug ? 'Med forbrug ⚠' : 'Uden forbrug'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Anmærkning</span>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium">{a.anmaerkning}</p>
                    </div>

                    {signingId === a.id ? (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 mt-3">
                        <h5 className="font-bold text-sm text-slate-800">Kvittér og luk anmærkning</h5>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Fartøjsmester Navn *</label>
                            <input
                              type="text"
                              required
                              value={fartoejsmesterNavn}
                              onChange={(e) => setFartoejsmesterNavn(e.target.value)}
                              className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="Dit navn"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Udbedring & Bemærkninger *</label>
                            <textarea
                              required
                              rows={3}
                              value={kvitteringKommentar}
                              onChange={(e) => setKvitteringKommentar(e.target.value)}
                              className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="Hvad er udbedret?"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setSigningId(null)}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-100"
                            >
                              Annuller
                            </button>
                            <button
                              onClick={() => handleKvitter(a.id!)}
                              disabled={submitting}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow"
                            >
                              {submitting ? 'Gemmer...' : 'Godkend & Luk'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSigningId(a.id!);
                          setFartoejsmesterNavn('');
                          setKvitteringKommentar('');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        ✓ Behandl & Kvittér
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LUKKEDE ANMÆRKNINGER */}
          <div className="space-y-3 border-t-2 border-slate-100 pt-6">
            <h3 className="text-lg font-extrabold text-slate-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
              Udbedrede Anmærkninger ({lukkedeAnmaerkninger.length})
            </h3>

            {lukkedeAnmaerkninger.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {lukkedeAnmaerkninger.map(a => (
                  <div key={a.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3 opacity-75">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Udbedret af {a.fartoejsmester_navn}</span>
                        <h4 className="font-bold text-slate-700">{a.navn} (MA: {a.ma_nummer})</h4>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold">
                        Lukket ✓
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded border border-slate-150">
                        <span className="font-extrabold text-slate-500 uppercase tracking-wide block mb-1">Oprindelig anmærkning:</span>
                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{a.anmaerkning}</p>
                      </div>
                      <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">
                        <span className="font-extrabold text-emerald-800 uppercase tracking-wide block mb-1">Udbedring & Kvittering:</span>
                        <p className="text-emerald-900 font-bold whitespace-pre-wrap">{a.kvittering_kommentar}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
