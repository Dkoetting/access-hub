import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer'

const BASE_URL    = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'https://access-hub-tan.vercel.app'
const LOGO_LEFT   = process.env.INVOICE_PDF_LOGO_LEFT  ?? `${BASE_URL}/k%26n_logo_.png`
const LOGO_RIGHT  = process.env.INVOICE_PDF_LOGO_RIGHT ?? `${BASE_URL}/logo-dirk.jpg`

// ── Styles ─────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#222',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoLeft:  { width: 120, height: 40, objectFit: 'contain' },
  logoRight: { width: 80,  height: 40, objectFit: 'contain' },
  senderLine: {
    fontSize: 7, color: '#555',
    borderBottomWidth: 0.5, borderBottomColor: '#bbb',
    paddingBottom: 4, marginBottom: 14,
  },
  addrRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  addrBlock: { width: '55%' },
  addrName: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  addrLine: { fontSize: 9, marginBottom: 1 },
  addrVat:  { fontSize: 8, color: '#555', marginTop: 4 },
  infoBlock: { width: '40%' },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  infoLabel: { fontSize: 8, color: '#555' },
  infoValue: { fontSize: 8.5 },
  infoValueBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e3a8a' },
  invoiceTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 16, color: '#1e3a8a' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#1e3a8a',
    paddingVertical: 5, paddingHorizontal: 8,
    color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0', fontSize: 9,
  },
  colNr:    { width: '7%' },
  colDesc:  { width: '51%' },
  colQty:   { width: '9%',  textAlign: 'right' },
  colPrice: { width: '15%', textAlign: 'right' },
  colVat:   { width: '8%',  textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  thMain: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff' },
  thSub:  { fontSize: 6.5, color: '#bfdbfe', marginTop: 1 },
  totalsBlock: { marginTop: 24, alignSelf: 'flex-end', width: '46%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontSize: 9 },
  totalLabel: { color: '#444' },
  totalLabelSub: { color: '#999', fontSize: 7.5 },
  totalRowBold: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, fontSize: 11, fontFamily: 'Helvetica-Bold',
    borderTopWidth: 1.5, borderTopColor: '#1e3a8a', marginTop: 4, color: '#1e3a8a',
  },
  paymentNote:    { marginTop: 36, fontSize: 8.5, color: '#444', lineHeight: 1.6 },
  paymentNoteSub: { fontSize: 7.5, color: '#999', marginTop: 2 },
  footer: {
    position: 'absolute', bottom: 28, left: 50, right: 50,
    borderTopWidth: 0.5, borderTopColor: '#ccc',
    paddingTop: 5, fontSize: 7, color: '#888',
    flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap',
  },
})

// ── Types ──────────────────────────────────────────────────────────────────────

export type InvoiceData = {
  invoiceNr:        string
  invoiceDate:      string
  appName:          string
  appDesc:          string
  amountNetCents:   number
  amountVatCents:   number
  amountGrossCents: number
  billingType:      'company' | 'private'
  company?:         string
  vatId?:           string
  firstName?:       string
  lastName?:        string
  street:           string
  zip:              string
  city:             string
  country:          string
  email:            string
}

function fmt(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' EUR'
}

export async function generateInvoiceBuffer(d: InvoiceData): Promise<Buffer> {
  return Buffer.from(await renderToBuffer(<InvoicePDF d={d} />))
}

function recipientName(d: InvoiceData) {
  if (d.billingType === 'company') return d.company ?? ''
  return `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
}

// ── Component ──────────────────────────────────────────────────────────────────

export function InvoicePDF({ d }: { d: InvoiceData }) {
  const name = recipientName(d)

  return (
    <Document>
      <Page size="A4" style={S.page}>

        <View style={S.header}>
          <Image src={LOGO_LEFT}  style={S.logoLeft} />
          <Image src={LOGO_RIGHT} style={S.logoRight} />
        </View>

        <Text style={S.senderLine}>
          k&n EDV Konzepte GmbH · Flurweg 14 · D 83646 Bad Tölz · dkoetting@edvkonzepte.de
        </Text>

        <View style={S.addrRow}>
          <View style={S.addrBlock}>
            <Text style={S.addrName}>{name}</Text>
            <Text style={S.addrLine}>{d.street}</Text>
            <Text style={S.addrLine}>{d.zip} {d.city}</Text>
            {d.country !== 'DE' && <Text style={S.addrLine}>{d.country}</Text>}
            {d.vatId ? <Text style={S.addrVat}>UST-ID / VAT ID: {d.vatId}</Text> : null}
          </View>

          <View style={S.infoBlock}>
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Datum / Date</Text>
              <Text style={S.infoValue}>{d.invoiceDate}</Text>
            </View>
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Lieferdatum / Delivery date</Text>
              <Text style={S.infoValue}>{d.invoiceDate}</Text>
            </View>
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Seite / Page</Text>
              <Text style={S.infoValue}>1</Text>
            </View>
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Rechnung Nr. / Invoice No.</Text>
              <Text style={S.infoValueBold}>{d.invoiceNr}</Text>
            </View>
          </View>
        </View>

        <Text style={S.invoiceTitle}>Rechnung / Invoice {d.invoiceNr}</Text>

        <View style={S.tableHeader}>
          <View style={S.colNr}><Text style={S.thMain}>Nr.</Text><Text style={S.thSub}>No.</Text></View>
          <View style={S.colDesc}><Text style={S.thMain}>Beschreibung</Text><Text style={S.thSub}>Description</Text></View>
          <View style={S.colQty}><Text style={[S.thMain, { textAlign: 'right' }]}>Anzahl</Text><Text style={[S.thSub, { textAlign: 'right' }]}>Qty</Text></View>
          <View style={S.colPrice}><Text style={[S.thMain, { textAlign: 'right' }]}>Preis</Text><Text style={[S.thSub, { textAlign: 'right' }]}>Price</Text></View>
          <View style={S.colVat}><Text style={[S.thMain, { textAlign: 'right' }]}>USt.</Text><Text style={[S.thSub, { textAlign: 'right' }]}>VAT</Text></View>
          <View style={S.colTotal}><Text style={[S.thMain, { textAlign: 'right' }]}>Gesamtpreis</Text><Text style={[S.thSub, { textAlign: 'right' }]}>Total</Text></View>
        </View>

        <View style={S.tableRow}>
          <Text style={S.colNr}>1</Text>
          <View style={[S.colDesc, { flexDirection: 'column' }]}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{d.appName}</Text>
            <Text style={{ color: '#666', fontSize: 8, marginTop: 2 }}>{d.appDesc}</Text>
          </View>
          <Text style={S.colQty}>1</Text>
          <Text style={S.colPrice}>{fmt(d.amountNetCents)}</Text>
          <Text style={S.colVat}>19 %</Text>
          <Text style={S.colTotal}>{fmt(d.amountNetCents)}</Text>
        </View>

        <View style={S.totalsBlock}>
          <View style={S.totalRow}>
            <View><Text style={S.totalLabel}>Summe Netto:</Text><Text style={S.totalLabelSub}>Net amount:</Text></View>
            <Text>{fmt(d.amountNetCents)}</Text>
          </View>
          <View style={S.totalRow}>
            <View><Text style={S.totalLabel}>zzgl. 19 % USt.:</Text><Text style={S.totalLabelSub}>plus 19% VAT:</Text></View>
            <Text>{fmt(d.amountVatCents)}</Text>
          </View>
          <View style={S.totalRowBold}>
            <View>
              <Text>Gesamtbetrag:</Text>
              <Text style={{ fontSize: 8, color: '#6b7280', fontFamily: 'Helvetica' }}>Total amount:</Text>
            </View>
            <Text>{fmt(d.amountGrossCents)}</Text>
          </View>
        </View>

        <Text style={S.paymentNote}>
          Vielen Dank für Ihren Kauf. Die Zahlung wurde erfolgreich via Stripe verarbeitet.
        </Text>
        <Text style={S.paymentNoteSub}>
          Thank you for your purchase. Payment has been successfully processed via Stripe.
        </Text>

        <View style={S.footer} fixed>
          <Text>K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · D 83646 Bad Tölz</Text>
          <Text>Tel: +49 8041 44 05 149 · dkoetting@edvkonzepte.de</Text>
          <Text>IBAN: DE64700543060055119002 · BIC: BYLADEM1WOR · USt-ID: DE812463437</Text>
          <Text>Geschäftsführung: Dr. Dirk Kötting · HRB 120617</Text>
        </View>

      </Page>
    </Document>
  )
}
