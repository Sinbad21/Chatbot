'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, User, Mail, Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface BookingWizardProps {
  botId: string;
  conversationId: string;
  onComplete: (eventId: string) => void;
  onCancel: () => void;
}

export function BookingWizard({ botId, conversationId, onComplete, onCancel }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Step 1: Date selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Step 2: Time slot selection
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3: User details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCalendarConnection();
    generateAvailableDates();
  }, [botId]);

  useEffect(() => {
    if (selectedDate && connectionId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, connectionId]);

  const fetchCalendarConnection = async () => {
    try {
      // Get the active calendar connection for this bot
      const response = await fetch(`/api/calendar/connections?botId=${botId}`);
      const data = await response.json();

      const activeConnection = data.connections?.find((c: any) => c.isActive && c.botId === botId);
      if (activeConnection) {
        setConnectionId(activeConnection.id);
      }
    } catch (error) {
      console.error('Failed to fetch calendar connection:', error);
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

      // Skip Sundays (optional)
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
    if (!selectedSlot || !name || !email || !connectionId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          conversationId,
          summary: `Appointment with ${name}`,
          description: notes || 'Booked via chatbot',
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          attendeeEmail: email,
          attendeeName: name,
          organizerEmail: 'your-email@example.com', // TODO: Get from bot config
          idempotencyKey: `${conversationId}-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onComplete(data.event.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!connectionId) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="w-12 h-12 text-muted-gray mx-auto mb-3" />
        <p className="text-charcoal/70">Calendar not configured for this bot</p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Close
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg w-full bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-charcoal">Book an Appointment</h3>
          <button onClick={onCancel} className="text-muted-gray hover:text-charcoal">
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? 'bg-emerald' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald" />
            <h4 className="font-medium text-charcoal">Select a Date</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'border-emerald bg-emerald/10 text-emerald font-medium'
                    : 'border-slate-200 hover:border-emerald/50 text-charcoal'
                }`}
              >
                <div className="text-xs text-muted-gray">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                <div className="text-lg font-semibold">{date.getDate()}</div>
                <div className="text-xs text-muted-gray">{date.toLocaleDateString('it-IT', { month: 'short' })}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDate}
              className="bg-emerald hover:bg-emerald/90 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Time Slot Selection */}
      {step === 2 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-emerald" />
            <h4 className="font-medium text-charcoal">Select a Time</h4>
          </div>

          <div className="mb-4 p-3 bg-emerald/10 rounded-lg">
            <p className="text-sm text-charcoal">
              <strong>{selectedDate && formatDate(selectedDate)}</strong>
            </p>
          </div>

          {loadingSlots ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald mx-auto mb-2"></div>
              <p className="text-sm text-muted-gray">Loading available times...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-gray">No available slots for this date</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(null);
                  setStep(1);
                }}
                className="mt-4"
              >
                Choose Another Date
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedSlot === slot
                        ? 'border-emerald bg-emerald/10 text-emerald font-medium'
                        : 'border-slate-200 hover:border-emerald/50 text-charcoal'
                    }`}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                  className="bg-emerald hover:bg-emerald/90 text-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: User Details */}
      {step === 3 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald" />
            <h4 className="font-medium text-charcoal">Your Information</h4>
          </div>

          <div className="mb-4 p-3 bg-emerald/10 rounded-lg space-y-1">
            <p className="text-sm text-charcoal">
              <strong>{selectedDate && formatDate(selectedDate)}</strong>
            </p>
            <p className="text-sm text-charcoal">
              {selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                required
              />
              <p className="text-xs text-muted-gray mt-1">
                We'll send you a confirmation email with a calendar invite
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics you'd like to discuss..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={!name || !email || loading}
              className="bg-emerald hover:bg-emerald/90 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
