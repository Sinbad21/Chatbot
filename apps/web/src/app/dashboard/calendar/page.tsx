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

  // TODO: Get from auth context
  const organizationId = 'org_123456789';
  const userPlan = 'advanced'; // or 'custom', 'enterprise'

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/connections?organizationId=${organizationId}`);
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
      const response = await fetch(`/api/calendar/connect/google?organizationId=${organizationId}`);
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
      const response = await fetch(`/api/calendar/connections/${connectionId}`, {
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
      const response = await fetch(`/api/calendar/connections/${connectionId}`, {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-gray">Loading calendar connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Calendar Integration</h1>
        <p className="text-charcoal/70">
          Connect your calendar to enable appointment booking through your chatbot.
        </p>
      </div>

      {/* Plan Badge */}
      {!hasAccess && (
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Upgrade Required</p>
                <p className="text-sm text-charcoal/80 mt-1">
                  Calendar integration is available on Advanced and Custom plans.
                </p>
              </div>
            </div>
            <a href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap">
              Upgrade Now
            </a>
          </div>
        </Card>
      )}

      {/* Connection Status */}
      {hasAccess && connections.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-16 h-16 text-emerald/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-charcoal mb-2">
            No Calendar Connected
          </h3>
          <p className="text-muted-gray mb-6 max-w-md mx-auto">
            Connect your Google Calendar to start accepting appointment bookings through your chatbot.
          </p>
          <Button
            onClick={handleConnectGoogle}
            className="bg-emerald hover:bg-emerald/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        </Card>
      )}

      {/* Connections List */}
      {hasAccess && connections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-charcoal">Connected Calendars</h2>
            <Button
              onClick={handleConnectGoogle}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Calendar
            </Button>
          </div>

          {connections.map((connection) => (
            <Card key={connection.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-emerald" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-charcoal">
                        {connection.calendarName}
                      </h3>
                      {connection.isActive ? (
                        <Badge className="bg-emerald text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-gray">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-gray">
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
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Connection Details */}
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">Slot Duration</p>
                  <p className="text-sm text-muted-gray">{connection.slotDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">Buffer Time</p>
                  <p className="text-sm text-muted-gray">{connection.bufferTime} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">Daily Limit</p>
                  <p className="text-sm text-muted-gray">{connection.maxDailyBookings} bookings</p>
                </div>
              </div>
            </Card>
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
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold text-charcoal mb-4">Calendar Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Automatic Availability</p>
                <p className="text-muted-gray">Checks your calendar for free/busy times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Google Meet Integration</p>
                <p className="text-muted-gray">Automatic video conference links</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Email Notifications</p>
                <p className="text-muted-gray">Automatic reminders to attendees</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Working Hours</p>
                <p className="text-muted-gray">Customize available booking times</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
