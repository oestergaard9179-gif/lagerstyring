-- SQL til opdatering af databasen i Supabase Dashboard SQL Editor

-- 1. Tilføj udløbsdato til materielstyring i items-tabellen
ALTER TABLE items ADD COLUMN IF NOT EXISTS udloebsdato DATE;

-- 2. Opret anmærkninger tabellen til Anmærkningsbogen og Fartøjsmester-workflowet
CREATE TABLE IF NOT EXISTS anmaerkninger (
    id SERIAL PRIMARY KEY,
    navn TEXT NOT NULL,
    ma_nummer TEXT NOT NULL,
    telefon TEXT NOT NULL,
    anmaerkning TEXT NOT NULL,
    forbrug BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Åben', -- 'Åben' eller 'Lukket'
    fartoejsmester_navn TEXT,
    kvittering_kommentar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
