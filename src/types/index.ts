export type Item = {
  id: number;
  nr: number;
  komponentnummer: string;
  objektkorttekst: string;
  antal_skib: number;
  antal_container: number;
  Koncernpris: string;
  maengde: number;
  bestilt: number;
  lenh?: string;
  antal_retur?: number;
  kassationsmetode?: string;
  udloebsdato?: string;
}

export type GroupedItem = {
  parent: Item;
  children: Item[];
}

export type Role = 'skib' | 'fartøjsmester' | null;

export type Anmaerkning = {
  id?: number;
  navn: string;
  ma_nummer: string;
  telefon: string;
  anmaerkning: string;
  forbrug: boolean;
  status: 'Åben' | 'Set' | 'Lukket';
  fartoejsmester_navn?: string;
  kvittering_kommentar?: string;
  created_at?: string;
}
