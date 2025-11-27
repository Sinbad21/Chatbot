'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CalendarConnection {
  id: string;
  provider: string;
  calendarName: string;
  timeZone: string;
  slotDuration: number;
  bufferTime: number;
  maxDailyBookings: number;
  widgetId?: string;
  workingHours?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  isActive: boolean;
  _count?: {
    events: number;
  };
}

export default function CalendarPage() {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<CalendarConnection | null>(null);
  const [editMode, setEditMode] = useState(false);

  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // TODO: Get from auth context
  const organizationId = 'cmi4xuoi80001hs74layh08yz'; // Real organization ID
  const userPlan = 'advanced'; // or 'custom', 'enterprise'

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/calendar/connections?organizationId=${organizationId}`);
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await fetch(`${apiUrl}/calendar/connect/google?organizationId=${organizationId}`);
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.upgrade) {
        alert('Calendar integration requires Advanced or Custom plan');
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      alert('Failed to connect to Google Calendar');
    }
  };

  const handleUpdateConnection = async (connectionId: string, updates: Partial<CalendarConnection>) => {
    try {
      const response = await fetch(`${apiUrl}/calendar/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchConnections();
        setEditMode(false);
        setSelectedConnection(null);
      }
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this calendar?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/calendar/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const allowedPlans = ['advanced', 'custom', 'enterprise'];
  const hasAccess = allowedPlans.includes(userPlan.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/60">Loading calendar connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Plan Badge */}
      {!hasAccess && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Upgrade Required</p>
                <p className="text-sm text-white/60 mt-1">
                  Calendar integration is available on Advanced and Custom plans.
                </p>
              </div>
            </div>
            <a href="/pricing" className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium whitespace-nowrap">
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {hasAccess && connections.length === 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
          <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Calendar Connected
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Connect your Google Calendar to start accepting appointment bookings through your chatbot.
          </p>
          <Button
            onClick={handleConnectGoogle}
            className="bg-white text-black hover:bg-white/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        </div>
      )}

      {/* Connections List */}
      {hasAccess && connections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Connected Calendars</h2>
            <Button
              onClick={handleConnectGoogle}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Calendar
            </Button>
          </div>

          {connections.map((connection) => (
            <div key={connection.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {connection.calendarName}
                      </h3>
                      {connection.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1 inline" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-500/20 text-slate-300 border-slate-500/30">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{connection.provider}</span>
                      <span>•</span>
                      <span>{connection.timeZone}</span>
                      {connection._count && (
                        <>
                          <span>•</span>
                          <span>{connection._count.events} events</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedConnection(connection);
                      setEditMode(true);
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Connection Details */}
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm font-medium text-white mb-1">Slot Duration</p>
                  <p className="text-sm text-white/60">{connection.slotDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Buffer Time</p>
                  <p className="text-sm text-white/60">{connection.bufferTime} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Daily Limit</p>
                  <p className="text-sm text-white/60">{connection.maxDailyBookings} bookings</p>
                </div>
              </div>

              {/* Widget Embed Section */}
              {connection.widgetId && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-white" />
                      <h4 className="text-sm font-semibold text-white">Widget Embed Code</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const code = `<script src="${window.location.origin}/booking-widget.js" data-widget-id="${connection.widgetId}"></script>`;
                        navigator.clipboard.writeText(code);
                        alert('Embed code copied to clipboard!');
                      }}
                      className="text-xs border-white/20 text-white hover:bg-white/10"
                    >
                      Copy Embed Code
                    </Button>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 overflow-x-auto border border-white/10">
                    <code className="text-xs text-emerald-400 font-mono">
                      {`<script src="${window.location.origin}/booking-widget.js" data-widget-id="${connection.widgetId}"></script>`}
                    </code>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    Add this code to your website to embed the booking widget. Widget ID: <span className="font-mono font-semibold text-white/60">{connection.widgetId}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      {editMode && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">Calendar Configuration</h2>
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedConnection(null);
                }}
                className="text-muted-gray hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Slot Duration */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Slot Duration (minutes)
                </label>
                <input
                  type="number"
                  value={selectedConnection.slotDuration}
                  onChange={(e) =>
                    setSelectedConnection({
                      ...selectedConnection,
                      slotDuration: parseInt(e.target.value) || 30,
                    })
                  }
                  min="15"
                  max="240"
                  step="15"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                />
                <p className="text-xs text-muted-gray mt-1">
                  How long each appointment slot should be
                </p>
              </div>

              {/* Buffer Time */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Buffer Time (minutes)
                </label>
                <input
                  type="number"
                  value={selectedConnection.bufferTime}
                  onChange={(e) =>
                    setSelectedConnection({
                      ...selectedConnection,
                      bufferTime: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="60"
                  step="5"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                />
                <p className="text-xs text-muted-gray mt-1">
                  Time between appointments for preparation
                </p>
              </div>

              {/* Max Daily Bookings */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Maximum Daily Bookings
                </label>
                <input
                  type="number"
                  value={selectedConnection.maxDailyBookings}
                  onChange={(e) =>
                    setSelectedConnection({
                      ...selectedConnection,
                      maxDailyBookings: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                />
                <p className="text-xs text-muted-gray mt-1">
                  Maximum number of appointments allowed per day
                </p>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">
                  Working Hours
                </label>
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                    const workingHours = selectedConnection.workingHours as any || {};
                    const dayHours = workingHours[day] || { start: '09:00', end: '18:00', enabled: day !== 'sunday' };

                    return (
                      <div key={day} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <label className="flex items-center gap-2 w-28">
                          <input
                            type="checkbox"
                            checked={dayHours.enabled !== false}
                            onChange={(e) => {
                              const newWorkingHours = { ...workingHours };
                              newWorkingHours[day] = { ...dayHours, enabled: e.target.checked };
                              setSelectedConnection({
                                ...selectedConnection,
                                workingHours: newWorkingHours,
                              });
                            }}
                            className="w-4 h-4 text-emerald border-slate-300 rounded focus:ring-emerald"
                          />
                          <span className="text-sm font-medium text-charcoal">{dayLabel}</span>
                        </label>

                        {dayHours.enabled !== false && (
                          <>
                            <input
                              type="time"
                              value={dayHours.start || '09:00'}
                              onChange={(e) => {
                                const newWorkingHours = { ...workingHours };
                                newWorkingHours[day] = { ...dayHours, start: e.target.value };
                                setSelectedConnection({
                                  ...selectedConnection,
                                  workingHours: newWorkingHours,
                                });
                              }}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald"
                            />
                            <span className="text-muted-gray">-</span>
                            <input
                              type="time"
                              value={dayHours.end || '18:00'}
                              onChange={(e) => {
                                const newWorkingHours = { ...workingHours };
                                newWorkingHours[day] = { ...dayHours, end: e.target.value };
                                setSelectedConnection({
                                  ...selectedConnection,
                                  workingHours: newWorkingHours,
                                });
                              }}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-gray mt-2">
                  Set your available hours for each day of the week
                </p>
              </div>

              {/* Widget Customization */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Widget Customization</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Widget Title
                    </label>
                    <input
                      type="text"
                      value={(selectedConnection as any).widgetTitle || 'Book an Appointment'}
                      onChange={(e) =>
                        setSelectedConnection({
                          ...selectedConnection,
                          widgetTitle: e.target.value,
                        } as any)
                      }
                      placeholder="Book an Appointment"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Widget Subtitle
                    </label>
                    <input
                      type="text"
                      value={(selectedConnection as any).widgetSubtitle || 'Choose a date and time that works for you'}
                      onChange={(e) =>
                        setSelectedConnection({
                          ...selectedConnection,
                          widgetSubtitle: e.target.value,
                        } as any)
                      }
                      placeholder="Choose a date and time that works for you"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Confirmation Message
                    </label>
                    <textarea
                      value={(selectedConnection as any).confirmMessage || 'Your appointment has been confirmed! Check your email for details.'}
                      onChange={(e) =>
                        setSelectedConnection({
                          ...selectedConnection,
                          confirmMessage: e.target.value,
                        } as any)
                      }
                      placeholder="Your appointment has been confirmed!"
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Email Notifications</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      value={(selectedConnection as any).ownerEmail || ''}
                      onChange={(e) =>
                        setSelectedConnection({
                          ...selectedConnection,
                          ownerEmail: e.target.value,
                        } as any)
                      }
                      placeholder="your-email@example.com"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                    />
                    <p className="text-xs text-muted-gray mt-1">
                      Email address to receive booking notifications
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-charcoal">Notify on New Bookings</p>
                      <p className="text-sm text-muted-gray">
                        Receive email when someone books an appointment
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(selectedConnection as any).notifyOwner !== false}
                        onChange={(e) =>
                          setSelectedConnection({
                            ...selectedConnection,
                            notifyOwner: e.target.checked,
                          } as any)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Blocked Dates */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Giorni Bloccati / Festività</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Aggiungi Data Bloccata
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        id="blocked-date-input"
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('blocked-date-input') as HTMLInputElement;
                          if (input.value) {
                            const blockedDates = (selectedConnection as any).blockedDates || [];
                            if (!blockedDates.includes(input.value)) {
                              setSelectedConnection({
                                ...selectedConnection,
                                blockedDates: [...blockedDates, input.value],
                              } as any);
                              input.value = '';
                            }
                          }
                        }}
                        className="bg-emerald hover:bg-emerald/90 text-white"
                      >
                        Aggiungi
                      </Button>
                    </div>
                    <p className="text-xs text-muted-gray mt-1">
                      Le date bloccate non saranno disponibili per le prenotazioni
                    </p>
                  </div>

                  {/* List of blocked dates */}
                  {((selectedConnection as any).blockedDates || []).length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-charcoal mb-3">Date Bloccate:</p>
                      <div className="flex flex-wrap gap-2">
                        {((selectedConnection as any).blockedDates || []).map((date: string, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <span className="text-charcoal">
                              {new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <button
                              onClick={() => {
                                const blockedDates = (selectedConnection as any).blockedDates || [];
                                setSelectedConnection({
                                  ...selectedConnection,
                                  blockedDates: blockedDates.filter((_: string, i: number) => i !== index),
                                } as any);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-charcoal">Calendar Active</p>
                  <p className="text-sm text-muted-gray">
                    Allow bookings through this calendar
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConnection.isActive}
                    onChange={(e) =>
                      setSelectedConnection({
                        ...selectedConnection,
                        isActive: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald"></div>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setSelectedConnection(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateConnection(selectedConnection.id, selectedConnection)}
                className="bg-emerald hover:bg-emerald/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Features Info */}
      {hasAccess && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="font-semibold text-white mb-4">Calendar Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Automatic Availability</p>
                <p className="text-white/60">Checks your calendar for free/busy times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Google Meet Integration</p>
                <p className="text-white/60">Automatic video conference links</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-white/60">Automatic reminders to attendees</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Working Hours</p>
                <p className="text-white/60">Customize available booking times</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
