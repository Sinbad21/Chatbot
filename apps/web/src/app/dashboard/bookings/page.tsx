'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Trash2,
  Filter,
  Download,
  Search,
  ChevronDown,
} from 'lucide-react';

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  description?: string;
  createdAt: string;
  connection: {
    calendarName: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionId, setConnectionId] = useState<string>('');

  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // TODO: Get from auth context
  const organizationId = 'org_123456789';

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // First get the user's calendar connection
      const connectionsResponse = await fetch(`${apiUrl}/calendar/connections?organizationId=${organizationId}`);
      const connectionsData = await connectionsResponse.json();

      if (connectionsData.connections && connectionsData.connections.length > 0) {
        const activeConnection = connectionsData.connections[0];
        setConnectionId(activeConnection.id);

        // Then fetch events for that connection
        const eventsResponse = await fetch(`${apiUrl}/calendar/events?connectionId=${activeConnection.id}`);
        const eventsData = await eventsResponse.json();

        let filteredBookings = eventsData.events || [];

        // Apply filters
        const now = new Date();
        if (filter === 'upcoming') {
          filteredBookings = filteredBookings.filter((b: Booking) =>
            new Date(b.startTime) > now && b.status !== 'CANCELLED'
          );
        } else if (filter === 'past') {
          filteredBookings = filteredBookings.filter((b: Booking) =>
            new Date(b.startTime) <= now
          );
        } else if (filter === 'cancelled') {
          filteredBookings = filteredBookings.filter((b: Booking) =>
            b.status === 'CANCELLED'
          );
        }

        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/calendar/events/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert('Impossibile cancellare la prenotazione');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Errore durante la cancellazione');
    }
  };

  const exportBookings = () => {
    // Create CSV
    const csv = [
      ['Data', 'Ora', 'Nome', 'Cognome', 'Email', 'Telefono', 'Stato', 'Note'].join(','),
      ...bookings.map(b => [
        new Date(b.startTime).toLocaleDateString('it-IT'),
        new Date(b.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        b.attendeeFirstName || '',
        b.attendeeLastName || '',
        b.attendeeEmail || '',
        b.attendeePhone || '',
        b.status,
        (b.description || '').replace(/,/g, ';'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenotazioni-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      b.attendeeFirstName?.toLowerCase().includes(query) ||
      b.attendeeLastName?.toLowerCase().includes(query) ||
      b.attendeeEmail?.toLowerCase().includes(query) ||
      b.attendeePhone?.includes(query)
    );
  });

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-emerald text-white">Confermato</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancellato</Badge>;
      case 'RESCHEDULED':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Riprogrammato</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-gray">Caricamento prenotazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Prenotazioni</h1>
          <p className="text-charcoal/70">
            Gestisci e visualizza tutte le prenotazioni ricevute
          </p>
        </div>
        <Button
          onClick={exportBookings}
          variant="outline"
          className="gap-2"
          disabled={filteredBookings.length === 0}
        >
          <Download className="w-4 h-4" />
          Esporta CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-gray mb-1">Totali</p>
              <p className="text-2xl font-bold text-charcoal">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-charcoal" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-gray mb-1">Prossime</p>
              <p className="text-2xl font-bold text-emerald">
                {bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'CANCELLED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-gray mb-1">Completate</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => new Date(b.startTime) <= new Date() && b.status !== 'CANCELLED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-gray mb-1">Cancellate</p>
              <p className="text-2xl font-bold text-red-600">
                {bookings.filter(b => b.status === 'CANCELLED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, email o telefono..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-emerald text-white' : ''}
            >
              Tutte
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
              className={filter === 'upcoming' ? 'bg-emerald text-white' : ''}
            >
              Prossime
            </Button>
            <Button
              variant={filter === 'past' ? 'default' : 'outline'}
              onClick={() => setFilter('past')}
              className={filter === 'past' ? 'bg-emerald text-white' : ''}
            >
              Passate
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setFilter('cancelled')}
              className={filter === 'cancelled' ? 'bg-emerald text-white' : ''}
            >
              Cancellate
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-gray/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-charcoal mb-2">
            Nessuna prenotazione
          </h3>
          <p className="text-muted-gray">
            {searchQuery ? 'Nessun risultato per la ricerca' : 'Non ci sono prenotazioni in questa categoria'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-emerald" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal">
                        {booking.attendeeFirstName} {booking.attendeeLastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-gray mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {booking.attendeeEmail && (
                      <div className="flex items-center gap-2 text-charcoal">
                        <Mail className="w-4 h-4 text-muted-gray" />
                        <a href={`mailto:${booking.attendeeEmail}`} className="hover:text-emerald">
                          {booking.attendeeEmail}
                        </a>
                      </div>
                    )}
                    {booking.attendeePhone && (
                      <div className="flex items-center gap-2 text-charcoal">
                        <Phone className="w-4 h-4 text-muted-gray" />
                        <a href={`tel:${booking.attendeePhone}`} className="hover:text-emerald">
                          {booking.attendeePhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {booking.description && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-charcoal"><strong>Note:</strong> {booking.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(booking.status)}

                  {booking.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
