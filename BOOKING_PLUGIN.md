# Booking Plugin - Sistema di Prenotazione Standalone

Un sistema di prenotazione appuntamenti **standalone**, completamente indipendente dal chatbot, integrabile in **qualsiasi sito web**.

## 📋 Indice

- [Caratteristiche](#caratteristiche)
- [Architettura](#architettura)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Widget Embeddable](#widget-embeddable)
- [Dashboard](#dashboard)
- [Integrazione](#integrazione)
- [Piani e Pricing](#piani-e-pricing)

---

## ✨ Caratteristiche

### Per l'Utente Finale (Cliente del Sito)

1. **Prenotazione Semplice in 3 Step:**
   - **Step 1:** Inserimento dati personali (nome, cognome, telefono)
     - Autocompletamento browser (autocomplete attributes)
     - Validazione in tempo reale
   - **Step 2:** Scelta data e ora
     - Calendario con solo giorni disponibili
     - Slot orari in tempo reale
     - Indicazione slot già occupati
   - **Step 3:** Riepilogo e conferma
     - Visualizzazione dettagli completi
     - Conferma con booking reference

2. **UX Ottimizzata:**
   - Mobile-first responsive design
   - Colori personalizzabili
   - Testi configurabili (multilingua)
   - Loading states
   - Error handling chiaro

3. **Prevenzione Double Booking:**
   - Lock transazionale sul database
   - Controllo concorrenza
   - Aggiornamento real-time degli slot

### Per il Proprietario del Sito

1. **Dashboard di Configurazione:**
   - Impostazione orari lavorativi per giorno
   - Durata slot (15/30/45/60 minuti)
   - Buffer time tra appuntamenti
   - Date bloccate (festivi, ferie)
   - Limiti giornalieri e mensili
   - Personalizzazione widget (colori, testi)

2. **Gestione Prenotazioni:**
   - Lista prenotazioni con filtri
   - Dettagli completi
   - Note proprietario
   - Stati: ACTIVE, CANCELLED, COMPLETED, NO_SHOW
   - Statistiche

3. **Notifiche Email:**
   - Conferma al cliente
   - Notifica al proprietario
   - Reminder automatici (TODO)

---

## 🏗️ Architettura

### Multi-Tenant

Il sistema è **multi-tenant**: ogni proprietario di sito ha:
- Un **BookingAccount** univoco
- Un **widgetId** per l'embedding
- Configurazione separata
- Prenotazioni isolate

### Standalone

Il booking è completamente **indipendente dal chatbot**:
- API endpoints pubblici
- Widget embeddable su qualsiasi sito
- Abbonamento separato
- Può essere venduto come prodotto a sé stante

---

## 🗄️ Database Schema

### BookingAccount

Account principale del proprietario del sito.

```prisma
model BookingAccount {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Account info
  ownerName   String
  ownerEmail  String   @unique
  ownerPhone  String?

  // Widget identifier (for embedding)
  widgetId    String   @unique @default(cuid())

  // Subscription
  plan        BookingPlan @default(FREE)
  subscriptionStatus String @default("active")
  subscriptionEndsAt DateTime?

  // Limits based on plan
  maxBookingsPerMonth Int @default(100)

  // Relations
  configuration BookingConfiguration?
  bookings      BookingSlot[]
  subscription  BookingSubscription?
}
```

**Piani disponibili:**
- **FREE:** 100 prenotazioni/mese
- **BASIC:** 1,000 prenotazioni/mese - €19/mese
- **PRO:** Illimitate - €49/mese
- **ENTERPRISE:** Illimitate + supporto dedicato - €199/mese

### BookingConfiguration

Configurazione del widget e disponibilità.

```prisma
model BookingConfiguration {
  id        String   @id @default(cuid())
  accountId String   @unique

  // Timezone and locale
  timezone  String @default("Europe/Rome")
  locale    String @default("it")

  // Working hours (JSON)
  // Format: {"monday": {"enabled": true, "slots": [{"start": "09:00", "end": "13:00"}]}}
  workingHours Json @default("{}")

  // Slot settings
  slotDuration Int @default(30) // minutes
  bufferTime   Int @default(0)  // minutes

  // Booking limits
  maxDailyBookings Int @default(20)
  minAdvanceBooking Int @default(60) // minutes
  maxAdvanceBooking Int @default(90) // days

  // Blocked dates (holidays)
  blockedDates Json @default("[]")

  // Widget customization
  widgetTitle       String @default("Prenota un appuntamento")
  widgetSubtitle    String @default("Scegli data e ora")
  widgetPrimaryColor String @default("#10B981")
  widgetFontFamily  String @default("system-ui")
  confirmationMessage String

  // Notifications
  notificationEmail String?
  sendOwnerNotifications Boolean @default(true)
  sendCustomerNotifications Boolean @default(true)
}
```

### BookingSlot

Prenotazione effettuata.

```prisma
model BookingSlot {
  id        String   @id @default(cuid())
  accountId String

  // Booking reference (shown to customer)
  bookingReference String @unique @default(cuid())

  // Customer information
  customerFirstName String
  customerLastName  String
  customerPhone     String

  // Appointment details
  appointmentDate DateTime
  duration        Int @default(30)

  // Status
  status BookingStatus @default(ACTIVE)

  // Notes
  customerNotes String?
  ownerNotes    String?

  // Metadata for security
  customerIp    String?
  customerAgent String?

  @@index([appointmentDate])
  @@index([status])
}
```

**Stati booking:**
- `ACTIVE` - Prenotazione attiva
- `CANCELLED` - Cancellata
- `COMPLETED` - Completata
- `NO_SHOW` - Cliente non si è presentato

---

## 🔌 API Endpoints

### Pubblici (Per il Widget)

#### `GET /booking/widget/:widgetId/config`
Ottiene configurazione pubblica del widget.

**Response:**
```json
{
  "widgetId": "widget_abc123",
  "ownerName": "Mario Rossi",
  "config": {
    "timezone": "Europe/Rome",
    "locale": "it",
    "slotDuration": 30,
    "widgetTitle": "Prenota un appuntamento",
    "widgetPrimaryColor": "#10B981"
  }
}
```

#### `POST /booking/widget/:widgetId/availability`
Ottiene slot disponibili per un periodo.

**Request:**
```json
{
  "startDate": "2025-11-15T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z"
}
```

**Response:**
```json
{
  "slots": [
    {
      "date": "2025-11-15",
      "time": "09:00",
      "datetime": "2025-11-15T09:00:00Z"
    },
    {
      "date": "2025-11-15",
      "time": "09:30",
      "datetime": "2025-11-15T09:30:00Z"
    }
  ]
}
```

#### `POST /booking/widget/:widgetId/book`
Crea una nuova prenotazione.

**Request:**
```json
{
  "customerFirstName": "Mario",
  "customerLastName": "Rossi",
  "customerPhone": "+39 123 456 7890",
  "appointmentDatetime": "2025-11-15T09:00:00Z",
  "customerNotes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "bookingReference": "BK_abc123",
    "customerFirstName": "Mario",
    "customerLastName": "Rossi",
    "appointmentDate": "2025-11-15T09:00:00Z",
    "duration": 30
  }
}
```

**Rate Limiting:** Max 5 prenotazioni per IP per ora.

**Double Booking Prevention:**
- Lock transazionale sul database
- Controllo atomico degli slot
- Errore 409 se slot già occupato

#### `GET /booking/reference/:bookingReference`
Ottiene dettagli di una prenotazione.

#### `POST /booking/reference/:bookingReference/cancel`
Cancella una prenotazione.

### Protetti (Per Dashboard)

#### `GET /booking/account/:accountId/bookings`
Lista prenotazioni con filtri.

**Query params:**
- `status` - ACTIVE, CANCELLED, COMPLETED, NO_SHOW
- `startDate` - Data inizio
- `endDate` - Data fine
- `limit` - Limite risultati (default 100)
- `offset` - Offset per paginazione

#### `GET /booking/account/:accountId/stats`
Statistiche prenotazioni.

**Response:**
```json
{
  "stats": {
    "totalBookings": 150,
    "activeBookings": 45,
    "bookingsThisMonth": 23,
    "upcomingBookings": 15
  }
}
```

#### `PATCH /booking/account/:accountId/configuration`
Aggiorna configurazione.

#### `POST /booking/account/:accountId/bookings/:bookingId/notes`
Aggiunge note proprietario a una prenotazione.

---

## 🎨 Widget Embeddable

### Integrazione

#### Step 1: Aggiungi il widget al tuo sito

```html
<!-- Nel tuo HTML -->
<div id="booking-widget-root"></div>
<script src="https://yourdomain.com/widget.js"></script>
<script>
  BookingWidget.init({
    widgetId: 'widget_abc123',
    apiUrl: 'https://yourdomain.com/api'
  });
</script>
```

#### Step 2: Trigger programmatico (opzionale)

```javascript
// Apri il widget con un pulsante
document.getElementById('book-btn').addEventListener('click', function() {
  BookingWidget.open();
});
```

### Personalizzazione

Il widget si adatta automaticamente ai colori e testi configurati nel dashboard:

- **Colore primario** - Pulsanti, progress bar, highlights
- **Titolo e sottotitolo** - Header del widget
- **Font family** - Tipografia
- **Messaggio conferma** - Testo post-booking

### Autocompletamento Browser

Il widget utilizza i corretti attributi HTML5 per l'autocompletamento:

```html
<input
  name="given-name"
  type="text"
  autoComplete="given-name"
  placeholder="Mario"
/>

<input
  name="family-name"
  type="text"
  autoComplete="family-name"
  placeholder="Rossi"
/>

<input
  name="tel"
  type="tel"
  autoComplete="tel"
  placeholder="+39 123 456 7890"
/>
```

Questo permette al browser di suggerire automaticamente i dati salvati dell'utente.

---

## 🎛️ Dashboard

### Configurazione (`/dashboard/booking-config`)

**5 Tab:**

1. **Schedule** - Orari lavorativi e date bloccate
   - Toggle per ogni giorno della settimana
   - Range orari personalizzabili
   - Lista date bloccate (festivi, ferie)

2. **Settings** - Impostazioni booking
   - Durata slot (15/30/45/60 min)
   - Buffer time tra appuntamenti
   - Limite giornaliero prenotazioni
   - Preavviso minimo (es. 60 min)
   - Prenotazione massima anticipata (es. 90 giorni)
   - Timezone

3. **Appearance** - Personalizzazione widget
   - Titolo e sottotitolo
   - Colore primario (color picker)
   - Messaggio di conferma
   - Font family

4. **Notifications** - Email
   - Email notifiche
   - Toggle notifiche proprietario
   - Toggle notifiche cliente

5. **Embed Code** - Codice integrazione
   - Snippet HTML pronto
   - Widget ID
   - Istruzioni integrazione

### Gestione Prenotazioni (`/dashboard/bookings`)

**Features:**
- **Stats Cards:** Total bookings, active, this month, upcoming
- **Filtri:** All, Active, Cancelled
- **Lista prenotazioni:** Card con dettagli completi
- **Modal dettaglio:** Click su card per aprire dettagli
  - Info cliente (nome, telefono)
  - Data e ora appuntamento
  - Note cliente
  - Note proprietario (editabili)
  - Booking reference

---

## 🔐 Sicurezza

### Prevenzione Double Booking

```typescript
// Transaction lock per garantire atomicità
const result = await prisma.$transaction(async (tx) => {
  // 1. Query con lock degli slot nel range
  const conflictingBookings = await tx.bookingSlot.findMany({
    where: {
      accountId,
      status: 'ACTIVE',
      appointmentDate: {
        gte: slotStart,
        lte: slotEnd,
      },
    },
  });

  // 2. Check overlap
  const hasConflict = conflictingBookings.some((booking) => {
    return appointmentDate < bookingEnd && slotEnd > bookingStart;
  });

  if (hasConflict) {
    throw new Error('Slot no longer available');
  }

  // 3. Create booking
  return await tx.bookingSlot.create({ data });
});
```

### Rate Limiting

- Max 5 prenotazioni per IP per ora
- Previene spam e abusi
- Tracking via `customerIp` nel database

### Validazioni

- **Slot duration:** 15-240 minuti
- **Buffer time:** 0-60 minuti
- **Phone:** Minimo 8 caratteri
- **Date range:** Max 90 giorni per query
- **Advance booking:** Rispetta min/max configurati

---

## 💰 Piani e Pricing

### FREE
- **Prezzo:** Gratis
- **Prenotazioni:** 100/mese
- **Features:**
  - Widget embedding
  - Configurazione base
  - Email notifiche

### BASIC
- **Prezzo:** €19/mese
- **Prenotazioni:** 1,000/mese
- **Features:**
  - Tutto di FREE +
  - Personalizzazione completa widget
  - Report analytics base

### PRO
- **Prezzo:** €49/mese
- **Prenotazioni:** Illimitate
- **Features:**
  - Tutto di BASIC +
  - White label
  - API access
  - Webhook callbacks
  - Analytics avanzate

### ENTERPRISE
- **Prezzo:** €199/mese
- **Prenotazioni:** Illimitate
- **Features:**
  - Tutto di PRO +
  - Supporto dedicato
  - SLA 99.9%
  - Custom integrations
  - Multi-sede

---

## 📝 TODO

### Email Notifications
- [ ] Implementare email service (SendGrid/Mailgun)
- [ ] Template conferma cliente
- [ ] Template notifica proprietario
- [ ] Email reminder automatici (24h, 1h prima)

### Widget Embed Script
- [ ] Compilare widget React in standalone bundle
- [ ] Minification e ottimizzazione
- [ ] CDN distribution
- [ ] Versioning

### Advanced Features
- [ ] SMS notifications (Twilio)
- [ ] Recurring bookings
- [ ] Group bookings
- [ ] Payment integration (Stripe)
- [ ] Calendar sync (iCal export)
- [ ] Time zone conversion automatica
- [ ] Multi-language support completo

### Analytics
- [ ] Booking conversion rate
- [ ] Most popular time slots
- [ ] Customer demographics
- [ ] Revenue tracking
- [ ] Export reports (CSV, PDF)

---

## 🚀 Deploy

### Database Migration

```bash
cd packages/database
npx prisma migrate dev --name add_booking_plugin
npx prisma generate
```

### Environment Variables

```env
# Booking Plugin
DATABASE_URL=postgresql://...

# Email (optional)
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@yourdomain.com

# SMS (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### API Routes Registration

In `/apps/api-worker/src/index.ts`:

```typescript
import { registerBookingRoutes } from './routes/booking';

registerBookingRoutes(app);
```

---

## 📞 Support

- **Email:** support@chatbotstudio.com
- **Docs:** https://docs.chatbotstudio.com/booking
- **Status:** https://status.chatbotstudio.com

---

**Versione:** 1.0.0
**Ultimo aggiornamento:** 12 Novembre 2025
