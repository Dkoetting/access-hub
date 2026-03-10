# Access Hub

Zentrale Anmelde-App fuer mehrere kostenpflichtige Anwendungen (Pay-per-Use Vorbereitung).

## Funktionen (MVP)

- Einmalige Registrierung pro `E-Mail + App`
- App-Auswahl vor dem Zugang
- Magic-Link mit Ablaufzeit (Standard: 8 Stunden)
- Link ist nur einmal nutzbar
- Zugriff wird als Event in der DB protokolliert

## Setup

1. Abhaengigkeiten installieren

```bash
npm install
```

2. Environment konfigurieren

```bash
cp .env.example .env.local
```

3. Supabase-Schema ausfuehren

- Datei: `supabase/schema.sql`
- In Supabase SQL Editor einfuegen und ausfuehren

4. Dev-Server starten

```bash
npm run dev -- -p 3004
```

## API Endpunkte

- `POST /api/register-access`
  - Eingabe: `email`, `name?`, `appId`
  - Ergebnis: Registriert User, erstellt Magic-Link, versendet Mail
  - Blockiert Mehrfach-Anmeldung pro App (409)

- `POST /api/access/consume`
  - Eingabe: `token`
  - Ergebnis: prueft Link, markiert als genutzt, liefert Redirect-URL mit Hub-Token

## Hinweise

- Ohne `RESEND_API_KEY` liefert die Registrierung im Dev-Modus einen `accessUrl` als Vorschau.
- Hub-Token wird per HMAC signiert (`HUB_SIGNING_SECRET`) und an die Ziel-App als `hub_token` angehaengt.

## Beispiel-Apps

Die App-Liste wird zentral aus `src/config/apps.json` geladen.
Aktuell sind konfiguriert:

- Book Creator
- Kausale Kompetenz Test
- KI ROI Rechner
- AI Traffic Seven
