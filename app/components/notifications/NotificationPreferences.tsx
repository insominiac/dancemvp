'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Smartphone, MessageSquare, Volume2, VolumeX, Clock } from 'lucide-react';
import { PushNotificationClient } from '@/app/lib/push-client';

interface NotificationPreference {
  id: string | null;
  userId: string;
  type: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

interface NotificationPreferencesProps {
  userId: string;
}

const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMATION: { label: 'Booking Confirmations', icon: '🎉' },
  BOOKING_REMINDER: { label: 'Booking Reminders', icon: '⏰' },
  CLASS_CANCELLED: { label: 'Class Cancellations', icon: '🚫' },
  CLASS_RESCHEDULED: { label: 'Class Rescheduling', icon: '📅' },
  PAYMENT_CONFIRMATION: { label: 'Payment Confirmations', icon: '💳' },
  PAYMENT_FAILED: { label: 'Payment Failures', icon: '❌' },
  WAITLIST_SPOT_AVAILABLE: { label: 'Waitlist Spots Available', icon: '🎯' },
  INSTRUCTOR_MESSAGE: { label: 'Messages from Instructors', icon: '💬' },
  SYSTEM_ANNOUNCEMENT: { label: 'System Announcements', icon: '📢' },
  CLASS_REMINDER: { label: 'Class Reminders', icon: '⏰' },
  EVENT_REMINDER: { label: 'Event Reminders', icon: '🎭' },
  MATCH_REQUEST: { label: 'Partner Match Requests', icon: '💃' },
  MATCH_ACCEPTED: { label: 'Partner Match Accepted', icon: '✅' }
};

const FREQUENCY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediately' },
  { value: 'HOURLY', label: 'Hourly digest' },
  { value: 'DAILY', label: 'Daily digest' },
  { value: 'WEEKLY', label: 'Weekly digest' },
  { value: 'NEVER', label: 'Never' }
];

export default function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState({
    supported: false,
    permission: 'default' as NotificationPermission,
    subscribed: false
  });
  const [globalQuietHours, setGlobalQuietHours] = useState({
    start: '22:00',
    end: '08:00',
    enabled: false
  });

  // Fetch preferences from API
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  // Initialize push notification status
  const initializePushStatus = async () => {
    const status = await PushNotificationClient.initialize(userId);
    setPushStatus(status);
  };

  // Save preferences to API
  const savePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          preferences: preferences.map(pref => ({
            type: pref.type,
            inAppEnabled: pref.inAppEnabled,
            pushEnabled: pref.pushEnabled,
            emailEnabled: pref.emailEnabled,
            smsEnabled: pref.smsEnabled,
            frequency: pref.frequency,
            quietHoursStart: globalQuietHours.enabled ? globalQuietHours.start : null,
            quietHoursEnd: globalQuietHours.enabled ? globalQuietHours.end : null
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      const result = await response.json();
      setSuccess('Notification preferences saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  // Update a specific preference
  const updatePreference = (type: string, field: keyof NotificationPreference, value: any) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.type === type ? { ...pref, [field]: value } : pref
      )
    );
  };

  // Toggle push notifications
  const togglePushNotifications = async () => {
    try {
      if (pushStatus.subscribed) {
        // Unsubscribe
        const success = await PushNotificationClient.unsubscribe(userId);
        if (success) {
          setPushStatus(prev => ({ ...prev, subscribed: false }));
          // Disable push for all preferences
          setPreferences(prev => 
            prev.map(pref => ({ ...pref, pushEnabled: false }))
          );
        }
      } else {
        // Subscribe
        const result = await PushNotificationClient.subscribe(userId);
        if (result.success) {
          setPushStatus(prev => ({ ...prev, subscribed: true, permission: 'granted' }));
        } else {
          setError('Failed to enable push notifications. Please check your browser settings.');
        }
      }
    } catch (err) {
      console.error('Error toggling push notifications:', err);
      setError('Failed to update push notification settings');
    }
  };

  // Test push notification
  const testPushNotification = async () => {
    try {
      await PushNotificationClient.testNotification();
    } catch (err) {
      console.error('Error testing push notification:', err);
      setError('Failed to send test notification');
    }
  };

  useEffect(() => {
    fetchPreferences();
    initializePushStatus();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage how and when you receive notifications
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="p-6">
          {/* Global Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Global Settings</h3>
            
            {/* Push Notification Master Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">
                      {pushStatus.supported 
                        ? pushStatus.subscribed 
                          ? 'You will receive push notifications in your browser'
                          : 'Enable to receive push notifications in your browser'
                        : 'Push notifications are not supported in your browser'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {pushStatus.subscribed && (
                    <button
                      onClick={testPushNotification}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Test
                    </button>
                  )}
                  <button
                    onClick={togglePushNotifications}
                    disabled={!pushStatus.supported}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushStatus.subscribed
                        ? 'bg-blue-600'
                        : pushStatus.supported
                        ? 'bg-gray-200'
                        : 'bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushStatus.subscribed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                    <p className="text-sm text-gray-600">
                      Disable notifications during specified hours
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGlobalQuietHours(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    globalQuietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      globalQuietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {globalQuietHours.enabled && (
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={globalQuietHours.start}
                      onChange={(e) => setGlobalQuietHours(prev => ({ ...prev, start: e.target.value }))}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={globalQuietHours.end}
                      onChange={(e) => setGlobalQuietHours(prev => ({ ...prev, end: e.target.value }))}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Individual Notification Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
            
            <div className="space-y-4">
              {preferences.map((pref) => {
                const typeInfo = NOTIFICATION_TYPES[pref.type as keyof typeof NOTIFICATION_TYPES];
                if (!typeInfo) return null;

                return (
                  <div key={pref.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{typeInfo.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{typeInfo.label}</h4>
                        </div>
                      </div>
                      <select
                        value={pref.frequency}
                        onChange={(e) => updatePreference(pref.type, 'frequency', e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                      >
                        {FREQUENCY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {pref.frequency !== 'NEVER' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={pref.inAppEnabled}
                            onChange={(e) => updatePreference(pref.type, 'inAppEnabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Bell className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">In-app</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={pref.pushEnabled && pushStatus.subscribed}
                            onChange={(e) => updatePreference(pref.type, 'pushEnabled', e.target.checked)}
                            disabled={!pushStatus.subscribed}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <Smartphone className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">Push</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={pref.emailEnabled}
                            onChange={(e) => updatePreference(pref.type, 'emailEnabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Mail className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">Email</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={pref.smsEnabled}
                            onChange={(e) => updatePreference(pref.type, 'smsEnabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <MessageSquare className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">SMS</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
