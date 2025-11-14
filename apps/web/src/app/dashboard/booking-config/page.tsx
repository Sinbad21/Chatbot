'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Settings,
  Palette,
  Bell,
  Code,
  Save,
  Check,
} from 'lucide-react';

interface WorkingHoursSlot {
  start: string;
  end: string;
}

interface WorkingHoursDay {
  enabled: boolean;
  slots: WorkingHoursSlot[];
}

interface WorkingHours {
  monday: WorkingHoursDay;
  tuesday: WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday: WorkingHoursDay;
  friday: WorkingHoursDay;
  saturday: WorkingHoursDay;
  sunday: WorkingHoursDay;
}

export default function BookingConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // TODO: Get from auth
  const accountId = 'booking_account_123';
  const widgetId = 'widget_abc123';

  // Configuration state
  const [timezone, setTimezone] = useState('Europe/Rome');
  const [locale, setLocale] = useState('it');
  const [slotDuration, setSlotDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(0);
  const [maxDailyBookings, setMaxDailyBookings] = useState(20);
  const [minAdvanceBooking, setMinAdvanceBooking] = useState(60);
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState(90);

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
    tuesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
    wednesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
    thursday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Widget customization
  const [widgetTitle, setWidgetTitle] = useState('Prenota un appuntamento');
  const [widgetSubtitle, setWidgetSubtitle] = useState('Scegli data e ora per il tuo appuntamento');
  const [widgetPrimaryColor, setWidgetPrimaryColor] = useState('#10B981');
  const [confirmationMessage, setConfirmationMessage] = useState('Grazie! La tua prenotazione è stata confermata.');

  // Notifications
  const [notificationEmail, setNotificationEmail] = useState('');
  const [sendOwnerNotifications, setSendOwnerNotifications] = useState(true);
  const [sendCustomerNotifications, setSendCustomerNotifications] = useState(true);

  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking/account/${accountId}/configuration`);

      if (response.ok) {
        const { config } = await response.json();

        setTimezone(config.timezone);
        setLocale(config.locale);
        setSlotDuration(config.slotDuration);
        setBufferTime(config.bufferTime);
        setMaxDailyBookings(config.maxDailyBookings);
        setMinAdvanceBooking(config.minAdvanceBooking);
        setMaxAdvanceBooking(config.maxAdvanceBooking);
        setWorkingHours(config.workingHours);
        setBlockedDates(config.blockedDates || []);
        setWidgetTitle(config.widgetTitle);
        setWidgetSubtitle(config.widgetSubtitle);
        setWidgetPrimaryColor(config.widgetPrimaryColor);
        setConfirmationMessage(config.confirmationMessage);
        setNotificationEmail(config.notificationEmail || '');
        setSendOwnerNotifications(config.sendOwnerNotifications);
        setSendCustomerNotifications(config.sendCustomerNotifications);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch(`/api/booking/account/${accountId}/configuration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timezone,
          locale,
          slotDuration,
          bufferTime,
          maxDailyBookings,
          minAdvanceBooking,
          maxAdvanceBooking,
          workingHours,
          blockedDates,
          widgetTitle,
          widgetSubtitle,
          widgetPrimaryColor,
          confirmationMessage,
          notificationEmail,
          sendOwnerNotifications,
          sendCustomerNotifications,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (day: keyof WorkingHours, enabled: boolean, start?: string, end?: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        enabled,
        slots: enabled && start && end ? [{ start, end }] : [],
      },
    }));
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates([...blockedDates, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== date));
  };

  const embedCode = `<!-- Booking Widget -->
<div id="booking-widget-root"></div>
<script src="https://yourdomain.com/widget.js"></script>
<script>
  BookingWidget.init({
    widgetId: '${widgetId}',
    apiUrl: 'https://yourdomain.com/api'
  });
</script>`;

  const days: Array<{ key: keyof WorkingHours; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-gray">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Booking Configuration</h1>
          <p className="text-charcoal/70">Configure your booking widget settings and availability</p>
        </div>

        <Button
          onClick={saveConfiguration}
          disabled={saving || saved}
          className="bg-emerald hover:bg-emerald/90 text-white"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {[
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'embed', label: 'Embed Code', icon: Code },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald border-b-2 border-emerald'
                  : 'text-muted-gray hover:text-charcoal'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Working Hours</h3>

            <div className="space-y-3">
              {days.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-24">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={workingHours[key].enabled}
                        onChange={(e) => updateDayHours(key, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-charcoal">{label}</span>
                    </label>
                  </div>

                  {workingHours[key].enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={workingHours[key].slots[0]?.start || '09:00'}
                        onChange={(e) =>
                          updateDayHours(
                            key,
                            true,
                            e.target.value,
                            workingHours[key].slots[0]?.end || '18:00'
                          )
                        }
                        className="px-3 py-2 border border-slate-200 rounded-lg"
                      />
                      <span className="text-muted-gray">to</span>
                      <input
                        type="time"
                        value={workingHours[key].slots[0]?.end || '18:00'}
                        onChange={(e) =>
                          updateDayHours(
                            key,
                            true,
                            workingHours[key].slots[0]?.start || '09:00',
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  )}

                  {!workingHours[key].enabled && (
                    <span className="text-sm text-muted-gray">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Blocked Dates</h3>

            <div className="flex gap-2 mb-4">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
              />
              <Button onClick={addBlockedDate} variant="outline">
                Add
              </Button>
            </div>

            {blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blockedDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-sm"
                  >
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <button
                      onClick={() => removeBlockedDate(date)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Booking Settings</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Slot Duration (minutes)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Buffer Time (minutes)
                </label>
                <input
                  type="number"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  min={0}
                  max={60}
                  step={5}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Max Daily Bookings
                </label>
                <input
                  type="number"
                  value={maxDailyBookings}
                  onChange={(e) => setMaxDailyBookings(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Minimum Advance Booking (minutes)
                </label>
                <input
                  type="number"
                  value={minAdvanceBooking}
                  onChange={(e) => setMinAdvanceBooking(Number(e.target.value))}
                  min={0}
                  step={15}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Max Advance Booking (days)
                </label>
                <input
                  type="number"
                  value={maxAdvanceBooking}
                  onChange={(e) => setMaxAdvanceBooking(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="Europe/Rome">Europe/Rome</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Widget Appearance</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Widget Title
              </label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Widget Subtitle
              </label>
              <input
                type="text"
                value={widgetSubtitle}
                onChange={(e) => setWidgetSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={widgetPrimaryColor}
                  onChange={(e) => setWidgetPrimaryColor(e.target.value)}
                  className="w-16 h-10 rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={widgetPrimaryColor}
                  onChange={(e) => setWidgetPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Confirmation Message
              </label>
              <textarea
                value={confirmationMessage}
                onChange={(e) => setConfirmationMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Email Notifications</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Notification Email
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="sendOwnerNotifications"
                checked={sendOwnerNotifications}
                onChange={(e) => setSendOwnerNotifications(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sendOwnerNotifications" className="text-sm text-charcoal">
                Send me email notifications for new bookings
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="sendCustomerNotifications"
                checked={sendCustomerNotifications}
                onChange={(e) => setSendCustomerNotifications(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sendCustomerNotifications" className="text-sm text-charcoal">
                Send confirmation emails to customers
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Embed Code Tab */}
      {activeTab === 'embed' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Embed Code</h3>

          <p className="text-sm text-muted-gray mb-4">
            Copy and paste this code into your website to add the booking widget:
          </p>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
              }}
              variant="outline"
              className="absolute top-2 right-2"
            >
              Copy
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Widget ID:</strong> <code className="font-mono">{widgetId}</code>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
