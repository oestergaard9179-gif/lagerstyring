import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Item, Anmaerkning } from '../types';

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

  // Sitetilstande for anmærkninger-historik og søgning
  const [anmaerkninger, setAnmaerkninger] = useState<Anmaerkning[]>([]);
  const [loadingAnmaerkninger, setLoadingAnmaerkninger] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchAnmaerkninger = async () => {
    setLoadingAnmaerkninger(true);
    const { data, error } = await supabase
      .from('anmaerkninger')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setAnmaerkninger(data);
    } else if (error) {
      console.error('Fejl ved hentning af anmærkninger:', error);
    }
    setLoadingAnmaerkninger(false);
  };

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
    fetchAnmaerkninger();
  }, []);

  const handleAddForbrugToText = () => {
    if (!selectedItemId) return;
    const item = items.find(i => i.id.toString() === selectedItemId);
    if (item) {
      const extraText = `\n[Forbrug: ${forbrugMaengde} stk. - ${item.objektkorttekst} (Varenr: ${item.komponentnummer})]`;
      setAnmaerkning(prev => prev + extraText);
      // Reset selection
      setSelectedItemId('');
      setSearchTerm('');
      setForbrugMaengde(1);
    }
  };

  const filteredItems = items.filter(item => 
    item.objektkorttekst.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.komponentnummer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      fetchAnmaerkninger();
    }
  };

  const aktiveSager = anmaerkninger.filter(a => a.status === 'Åben' || a.status === 'Set');
  const historikSager = anmaerkninger.filter(a => a.status === 'Lukket');

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
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
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Søg & vælg materiel & mængde</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                        const matched = items.find(item => item.objektkorttekst.toLowerCase() === e.target.value.toLowerCase());
                        if (matched) {
                          setSelectedItemId(matched.id.toString());
                        } else {
                          setSelectedItemId('');
                        }
                      }}
                      placeholder="Søg efter navn eller varenr..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-800"
                    />
                    {isDropdownOpen && (
                      <>
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          {filteredItems.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500 text-center">Ingen varer fundet</div>
                          ) : (
                            filteredItems.map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedItemId(item.id.toString());
                                  setSearchTerm(`${item.objektkorttekst} (Varenr: ${item.komponentnummer})`);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left p-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0 block text-slate-800 transition-colors"
                              >
                                <span className="font-bold block">{item.objektkorttekst}</span>
                                <span className="text-xs text-slate-500">Varenr: {item.komponentnummer} • Beholdning: {item.antal_skib}</span>
                              </button>
                            ))
                          )}
                        </div>
                        {/* overlay for close */}
                        <div 
                          className="fixed inset-0 z-40 cursor-default" 
                          onClick={() => setIsDropdownOpen(false)}
                        />
                      </>
                    )}
                  </div>
                  <div className="relative z-10">
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

      {/* TIDLIGERE ANMÆRKNINGER (HISTORIK & AKTIVE) */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Oversigt & Historik</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">
            Her kan besætningen følge med i status på indsendte anmærkninger.
          </p>
        </div>

        {loadingAnmaerkninger ? (
          <div className="text-center py-4 text-slate-500 font-bold animate-pulse text-sm">Henter oversigt...</div>
        ) : (
          <div className="space-y-6">
            {/* AKTIVE ANMÆRKNINGER */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Aktive Sager ({aktiveSager.length})
              </h3>
              {aktiveSager.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Der er ingen aktive anmærkninger lige nu.</p>
              ) : (
                <div className="space-y-3">
                  {aktiveSager.map(a => (
                    <div key={a.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-700">{a.navn}</span>
                          <span className="text-[10px] text-slate-400 font-bold ml-2">MA: {a.ma_nummer}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          a.status === 'Set' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {a.status === 'Set' ? 'Set af Fartøjsmester 👁' : 'Ubehandlet / Åben'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap font-medium">{a.anmaerkning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AFSLUTTEDE/HISTORIK ANMÆRKNINGER */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                Udbedrede / Historik ({historikSager.length})
              </h3>
              {historikSager.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Der er ingen udbedrede sager i historikken endnu.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {historikSager.map(a => (
                    <div key={a.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/30 space-y-2 opacity-80">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-600">{a.navn}</span>
                          <span className="text-[10px] text-slate-400 font-bold ml-2">Udbedret af {a.fartoejsmester_navn}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-150 text-slate-500 uppercase">
                          Udbedret ✓
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mt-1">
                        <div className="bg-white p-2 rounded border border-slate-100">
                          <span className="font-extrabold text-slate-400 block mb-0.5 uppercase tracking-wide text-[9px]">Anmærkning:</span>
                          <p className="text-slate-600 font-medium whitespace-pre-wrap">{a.anmaerkning}</p>
                        </div>
                        <div className="bg-emerald-50/20 p-2 rounded border border-emerald-100">
                          <span className="font-extrabold text-emerald-800 block mb-0.5 uppercase tracking-wide text-[9px]">Udbedring & Svar:</span>
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
    </div>
  );
};
