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
}

export type GroupedItem = {
  parent: Item;
  children: Item[];
}

export type Role = 'skib' | 'fartøjsmester' | null;
