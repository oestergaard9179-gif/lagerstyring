import React from 'react';

export const PraktiskInfoTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-md border-b-2 border-slate-200">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Praktiske Informationer</h2>
        <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm">
          Her kan besætningen finde vigtige kontaktoplysninger, genveje og generel praktisk information ombord.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VIGTIGE TELEFONNUMRE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-extrabold text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            ☎ Vigtige Telefonnumre
          </h3>
          <ul className="space-y-3 font-medium text-sm text-slate-700">
            <li className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
              <div>
                <span className="block text-xs text-slate-400 font-bold uppercase">Fartøjsmester (Farmer)</span>
                <span className="font-bold text-slate-800">Niels Speditør</span>
              </div>
              <a href="tel:+4570000000" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-xs transition-colors">+45 70 00 00 00</a>
            </li>
            <li className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
              <div>
                <span className="block text-xs text-slate-400 font-bold uppercase">Vagttelefon HJV</span>
                <span className="font-bold text-slate-800">Hjemmeværnskommandoen</span>
              </div>
              <a href="tel:+4572850000" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-xs transition-colors">+45 72 85 00 00</a>
            </li>
            <li className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
              <div>
                <span className="block text-xs text-slate-400 font-bold uppercase">FSC / FMI Support</span>
                <span className="font-bold text-slate-800">Lagersupport & Rekvisition</span>
              </div>
              <a href="tel:+4572840000" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-xs transition-colors">+45 72 84 00 00</a>
            </li>
            <li className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
              <div>
                <span className="block text-xs text-slate-400 font-bold uppercase">Marinevagt</span>
                <span className="font-bold text-slate-800">Operationel vagt</span>
              </div>
              <a href="tel:+4572840001" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-xs transition-colors">+45 72 84 00 01</a>
            </li>
          </ul>
        </div>

        {/* RELEVANTE LINKS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-extrabold text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            🔗 Relevante Links
          </h3>
          <ul className="space-y-3 font-medium text-sm text-slate-700">
            <li className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <a href="https://www.hjv.dk" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline font-bold">
                Hjemmeværnets Portalside (HJV.dk)
              </a>
              <span className="text-xs text-slate-500">Adgang til FiSu, kurser og nyheder.</span>
            </li>
            <li className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <a href="https://fmi.dk" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline font-bold">
                FMI Forsvarsministeriets Materiel- og Indkøbsstyrelse
              </a>
              <span className="text-xs text-slate-500">Regulativer, materielkataloger og retningslinjer.</span>
            </li>
            <li className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <a href="https://sup.hjv.dk" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline font-bold">
                SAP / FiSu Lagerportal
              </a>
              <span className="text-xs text-slate-500">Intern beholdningsstyring og rekvisitionsblanketter.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* GENEREL PRAKTISK INFORMATION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-extrabold text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          ℹ Generel Praktisk Information
        </h3>
        <div className="prose text-sm text-slate-700 space-y-3 font-medium leading-relaxed">
          <p>
            <strong>Bestilling af hygiejneartikler:</strong> Alle bestillinger af hygiejneartikler (f.eks. toiletpapir, håndsæbe, rengøringsmidler) foregår under fanen <strong>Optælling</strong>. Bemærk, at disse varer altid bestilles i <strong>pakker (PK)</strong> og ikke som enkelte styk, så sørg for at angive antallet af hele pakker ved rekvisition.
          </p>
          <p>
            <strong>Anmærkninger:</strong> Hvis du opdager fejl, mangler eller defekt materiel ombord, skal du straks oprette en sag i <strong>Anmærkningsbogen</strong>. Angiv om der er brugt reservedele ("forbrug"), så Fartøjsmesteren nemt kan kvittere, opdatere lagerlisten og lukke sagen.
          </p>
          <p>
            <strong>Udløb på materiel:</strong> For visse nød- og redningsmidler (f.eks. redningsveste, nødblus, batterier) er der indført et felt til <strong>udløbsdato</strong>. Kontrollér regelmæssigt udløbsdatoer under din optællingsrunde, så udtjente varer kan kasseres og genbestilles rettidigt.
          </p>
        </div>
      </div>
    </div>
  );
};
