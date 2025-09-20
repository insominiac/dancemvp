'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Smartphone, MessageSquare, Clock } from 'lucide-react';
// import { PushNotificationClient } from '@/app/lib/push-client';

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

interface NotificationSettingsProps {
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

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
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
    // Temporarily disabled until auth is implemented
    // const status = await PushNotificationClient.initialize(userId);
    // setPushStatus(status);
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
    // Temporarily disabled until auth is implemented
    console.log('Push notifications toggle - to be implemented with auth');
  };

  // Test push notification
  const testPushNotification = async () => {
    // Temporarily disabled until auth is implemented
    console.log('Test push notification - to be implemented with auth');
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
          <p className="text-sm text-gray-500 mb-6">
            Notification system will be fully functional once user authentication is implemented.
          </p>

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
