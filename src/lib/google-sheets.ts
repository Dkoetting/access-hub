import { google } from 'googleapis'

const SHEET_ID   = process.env.GOOGLE_CRM_SHEET_ID ?? ''
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''
const PRIVATE_KEY  = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')

const CRM_HEADERS = [
  'ID',
  'Kundennummer',
  'Rechnungsnummer',
  'Billing-Typ',
  'Firma',
  'Vorname',
  'Nachname',
  'USt-ID',
  'Straße',
  'PLZ',
  'Ort',
  'Land',
  'E-Mail',
  'Telefon',
  'Gekauftes Produkt',
  'Preis Netto (€)',
  'MwSt. (€)',
  'Preis Brutto (€)',
  'Zahlungsstatus',
  'Stripe Payment ID',
  'Supabase ID',
  'Rechnung erstellt am',
]

function getSheets() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key:   PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export async function ensureCrmHeaders(): Promise<void> {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) return
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range:         'A1:V1',
  })
  const firstRow = res.data.values?.[0] ?? []
  if (firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId:     SHEET_ID,
      range:             'A1',
      valueInputOption:  'RAW',
      requestBody:       { values: [CRM_HEADERS] },
    })
  }
}

export type CrmRow = {
  kundennummer:    string
  rechnungsnummer: string
  billingTyp:      string
  firma:           string
  vorname:         string
  nachname:        string
  ustId:           string
  strasse:         string
  plz:             string
  ort:             string
  land:            string
  email:           string
  telefon:         string
  produkt:         string
  preisNetto:      string
  mwst:            string
  preisGross:      string
  zahlungsstatus:  string
  stripePaymentId: string
  supabaseId:      string
  erstelltAm:      string
}

let _rowCounter = 0

export async function appendCrmRow(row: CrmRow): Promise<void> {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.warn('[google-sheets] env vars missing, skipping CRM write')
    return
  }

  const sheets = getSheets()

  // Auto-ID: count existing rows
  const countRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range:         'A:A',
  })
  const rowCount = (countRes.data.values?.length ?? 1)
  const id = rowCount  // header = row 1, first data = row 2 → id = 1

  const values = [
    String(id),
    row.kundennummer,
    row.rechnungsnummer,
    row.billingTyp,
    row.firma,
    row.vorname,
    row.nachname,
    row.ustId,
    row.strasse,
    row.plz,
    row.ort,
    row.land,
    row.email,
    row.telefon,
    row.produkt,
    row.preisNetto,
    row.mwst,
    row.preisGross,
    row.zahlungsstatus,
    row.stripePaymentId,
    row.supabaseId,
    row.erstelltAm,
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId:    SHEET_ID,
    range:            'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody:      { values: [values] },
  })
}
