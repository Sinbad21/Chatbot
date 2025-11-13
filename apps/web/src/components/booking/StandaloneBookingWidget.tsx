'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, User, Check, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface StandaloneBookingWidgetProps {
  connectionId: string;
  onClose?: () => void;
}

export function StandaloneBookingWidget({ connectionId, onClose }: StandaloneBookingWidgetProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  // Widget configuration
  const [widgetTitle, setWidgetTitle] = useState('Prenota un Appuntamento');
  const [widgetSubtitle, setWidgetSubtitle] = useState('Scegli data e ora che preferisci');
  const [confirmMessage, setConfirmMessage] = useState('Appuntamento confermato! Riceverai una email di conferma.');

  // Step 1: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2: Date selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Step 3: Time slot selection
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchWidgetConfig();
    generateAvailableDates();
  }, [connectionId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchWidgetConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await fetch(`/api/calendar/connections/${connectionId}`);
      const data = await response.json();

      if (data.connection) {
        setWidgetTitle(data.connection.widgetTitle || widgetTitle);
        setWidgetSubtitle(data.connection.widgetSubtitle || widgetSubtitle);
        setConfirmMessage(data.connection.confirmMessage || confirmMessage);
      }
    } catch (error) {
      console.error('Failed to fetch widget config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays by default (should be based on workingHours)
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }

    setAvailableDates(dates);
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !connectionId) return;

    setLoadingSlots(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        }),
      });

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !firstName || !email || !phone) return;

    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          summary: `Appuntamento con ${firstName} ${lastName}`,
          description: notes || 'Prenotato tramite widget',
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          attendeeEmail: email,
          attendeeName: `${firstName} ${lastName}`,
          attendeeFirstName: firstName,
          attendeeLastName: lastName,
          attendeePhone: phone,
          organizerEmail: 'booking@example.com', // Will be set from connection config
          idempotencyKey: `${connectionId}-${Date.now()}`,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Impossibile completare la prenotazione');
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Errore durante la prenotazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (configLoading) {
    return (
      <Card className="max-w-lg w-full bg-white shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-gray">Caricamento...</p>
        </div>
      </Card>
    );
  }

  if (bookingSuccess) {
    return (
      <Card className="max-w-lg w-full bg-white shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald" />
        </div>
        <h3 className="text-2xl font-bold text-charcoal mb-3">Prenotazione Confermata!</h3>
        <p className="text-muted-gray mb-6">{confirmMessage}</p>
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-charcoal mb-2">Dettagli Appuntamento</h4>
          <div className="space-y-1 text-sm text-charcoal">
            <p><strong>Nome:</strong> {firstName} {lastName}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Telefono:</strong> {phone}</p>
            <p><strong>Data:</strong> {selectedDate && formatDate(selectedDate)}</p>
            <p><strong>Orario:</strong> {selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}</p>
          </div>
        </div>
        {onClose && (
          <Button onClick={onClose} className="bg-emerald hover:bg-emerald/90 text-white">
            Chiudi
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="max-w-lg w-full bg-white shadow-xl relative">
      {/* Header */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-charcoal mb-1">{widgetTitle}</h3>
            <p className="text-sm text-muted-gray">{widgetSubtitle}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-gray hover:text-charcoal transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-emerald' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald" />
            <h4 className="font-semibold text-charcoal">I Tuoi Dati</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Nome *
                </label>
                <input
                  type="text"
                  name="given-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mario"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="family-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rossi"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Numero di Telefono *
              </label>
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 123 4567"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@example.com"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Note (opzionale)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Argomenti da discutere..."
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald resize-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
            )}
            <Button
              onClick={() => setStep(2)}
              disabled={!firstName || !lastName || !phone || !email}
              className="bg-emerald hover:bg-emerald/90 text-white"
            >
              Avanti <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald" />
            <h4 className="font-semibold text-charcoal">Scegli il Giorno</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'border-emerald bg-emerald/10 text-emerald font-semibold shadow-sm'
                    : 'border-slate-200 hover:border-emerald/50 hover:bg-emerald/5 text-charcoal'
                }`}
              >
                <div className="text-xs text-muted-gray mb-0.5">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                <div className="text-xl font-bold">{date.getDate()}</div>
                <div className="text-xs text-muted-gray mt-0.5">{date.toLocaleDateString('it-IT', { month: 'short' })}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-between gap-3 mt-6 pt-5 border-t border-slate-200">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedDate}
              className="bg-emerald hover:bg-emerald/90 text-white"
            >
              Avanti <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Time Slot Selection */}
      {step === 3 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-emerald" />
            <h4 className="font-semibold text-charcoal">Scegli l'Orario</h4>
          </div>

          <div className="mb-4 p-3 bg-emerald/5 border border-emerald/20 rounded-lg">
            <p className="text-sm text-charcoal">
              <strong>{selectedDate && formatDate(selectedDate)}</strong>
            </p>
          </div>

          {loadingSlots ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald mx-auto mb-3"></div>
              <p className="text-sm text-muted-gray">Caricamento orari...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-gray mb-4">Nessuno slot disponibile</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(null);
                  setStep(2);
                }}
              >
                Cambia Data
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto mb-4">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedSlot === slot
                        ? 'border-emerald bg-emerald/10 text-emerald font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-emerald/50 hover:bg-emerald/5 text-charcoal'
                    }`}
                  >
                    <div className="text-sm font-medium">{formatTime(slot.start)}</div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h5 className="font-semibold text-charcoal mb-3">Riepilogo</h5>
                  <div className="text-sm space-y-1.5 text-charcoal">
                    <p><strong>Nome:</strong> {firstName} {lastName}</p>
                    <p><strong>Telefono:</strong> {phone}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Data:</strong> {selectedDate && formatDate(selectedDate)}</p>
                    <p><strong>Orario:</strong> {`${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}</p>
                    {notes && <p><strong>Note:</strong> {notes}</p>}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-3 mt-6 pt-5 border-t border-slate-200">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={!selectedSlot || loading}
                  className="bg-emerald hover:bg-emerald/90 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Prenotazione...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Conferma
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
