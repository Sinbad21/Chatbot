'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Phone,
  User,
  FileText,
  X,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  appointmentDate: string;
  duration: number;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  customerNotes?: string;
  ownerNotes?: string;
  createdAt: string;
}

interface Stats {
  totalBookings: number;
  activeBookings: number;
  bookingsThisMonth: number;
  upcomingBookings: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CANCELLED'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // TODO: Get from auth
  const accountId = 'booking_account_123';

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const url = `/api/booking/account/${accountId}/bookings${
        filter !== 'all' ? `?status=${filter}` : ''
      }`;

      const response = await fetch(url);
      const data = await response.json();

      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/booking/account/${accountId}/stats`);
      const data = await response.json();

      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const saveOwnerNotes = async () => {
    if (!selectedBooking) return;

    setSavingNotes(true);
    try {
      await fetch(`/api/booking/account/${accountId}/bookings/${selectedBooking.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: ownerNotes }),
      });

      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id ? { ...b, ownerNotes } : b
        )
      );

      setSelectedBooking({ ...selectedBooking, ownerNotes });
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      case 'COMPLETED':
        return 'bg-blue-500 text-white';
      case 'NO_SHOW':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-gray">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Bookings</h1>
        <p className="text-charcoal/70">Manage your appointment bookings</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-gray">Total Bookings</p>
              <Calendar className="w-5 h-5 text-emerald" />
            </div>
            <p className="text-3xl font-bold text-charcoal">{stats.totalBookings}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-gray">Active</p>
              <CheckCircle className="w-5 h-5 text-emerald" />
            </div>
            <p className="text-3xl font-bold text-charcoal">{stats.activeBookings}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-gray">This Month</p>
              <Clock className="w-5 h-5 text-emerald" />
            </div>
            <p className="text-3xl font-bold text-charcoal">{stats.bookingsThisMonth}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-gray">Upcoming</p>
              <Calendar className="w-5 h-5 text-emerald" />
            </div>
            <p className="text-3xl font-bold text-charcoal">{stats.upcomingBookings}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-gray" />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'ACTIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ACTIVE')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'CANCELLED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('CANCELLED')}
            >
              Cancelled
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-gray/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-charcoal mb-2">No bookings yet</p>
          <p className="text-muted-gray">
            When customers book appointments, they'll appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedBooking(booking);
                setOwnerNotes(booking.ownerNotes || '');
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-charcoal">
                      {booking.customerFirstName} {booking.customerLastName}
                    </h3>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-gray">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.appointmentDate)}
                    </div>

                    <div className="flex items-center gap-2 text-muted-gray">
                      <Clock className="w-4 h-4" />
                      {formatTime(booking.appointmentDate)} ({booking.duration} min)
                    </div>

                    <div className="flex items-center gap-2 text-muted-gray">
                      <Phone className="w-4 h-4" />
                      {booking.customerPhone}
                    </div>
                  </div>

                  {booking.customerNotes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                      <p className="text-muted-gray mb-1">Customer Notes:</p>
                      <p className="text-charcoal">{booking.customerNotes}</p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-gray">Booking Reference</p>
                  <p className="text-sm font-mono font-medium text-emerald">
                    {booking.bookingReference}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-muted-gray hover:text-charcoal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-gray" />
                    <span className="text-charcoal">
                      {selectedBooking.customerFirstName} {selectedBooking.customerLastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-gray" />
                    <a
                      href={`tel:${selectedBooking.customerPhone}`}
                      className="text-emerald hover:underline"
                    >
                      {selectedBooking.customerPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Appointment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-gray" />
                    <span className="text-charcoal">{formatDate(selectedBooking.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-gray" />
                    <span className="text-charcoal">
                      {formatTime(selectedBooking.appointmentDate)} ({selectedBooking.duration} minutes)
                    </span>
                  </div>
                  <div>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedBooking.customerNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">Customer Notes</h3>
                  <div className="p-4 bg-slate-50 rounded-lg text-charcoal">
                    {selectedBooking.customerNotes}
                  </div>
                </div>
              )}

              {/* Owner Notes */}
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Your Notes</h3>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald resize-none"
                />
                <Button
                  onClick={saveOwnerNotes}
                  disabled={savingNotes}
                  className="mt-2 bg-emerald hover:bg-emerald/90 text-white"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>

              {/* Booking Reference */}
              <div className="p-4 bg-emerald/10 rounded-lg">
                <p className="text-sm text-muted-gray mb-1">Booking Reference</p>
                <p className="text-lg font-mono font-bold text-emerald">
                  {selectedBooking.bookingReference}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
