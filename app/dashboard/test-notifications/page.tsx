'use client';

// import { useAuth } from '@/app/lib/auth-context';
import { useState } from 'react';
import { Bell, Send, TestTube, Zap } from 'lucide-react';

const TEST_NOTIFICATION_TYPES = [
  {
    type: 'booking_confirmation',
    name: 'Booking Confirmation',
    description: 'Test booking confirmation notification',
    color: 'bg-green-100 text-green-800'
  },
  {
    type: 'class_reminder',
    name: 'Class Reminder',
    description: 'Test class starting soon notification',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'payment_success',
    name: 'Payment Success',
    description: 'Test payment confirmation notification',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    type: 'system_announcement',
    name: 'System Announcement',
    description: 'Test system announcement notification',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    type: 'waitlist_available',
    name: 'Waitlist Spot Available',
    description: 'Test waitlist spot available notification',
    color: 'bg-red-100 text-red-800'
  },
  {
    type: 'test',
    name: 'Generic Test',
    description: 'Generic test notification',
    color: 'bg-gray-100 text-gray-800'
  }
];

export default function TestNotificationsPage() {
  // const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);

  const sendTestNotification = async (type: string) => {
    // Temporarily disabled until auth is implemented
    const mockUserId = 'test-user-id';

    try {
      setLoading(type);
      setError(null);

      const response = await fetch('/api/test/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: mockUserId,
          type
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test notification');
      }

      setResults(prev => ({ ...prev, [type]: result }));
      
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TestTube className="w-8 h-8 mr-3" />
          Test Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          Test the notification system (will be fully functional once authentication is implemented)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <Bell className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Test</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Click any button below to test the notification API endpoints.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEST_NOTIFICATION_TYPES.map((notificationType) => (
            <div key={notificationType.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{notificationType.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notificationType.description}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  notificationType.color
                }`}>
                  {notificationType.type}
                </span>
              </div>
              
              <button
                onClick={() => sendTestNotification(notificationType.type)}
                disabled={loading === notificationType.type}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === notificationType.type ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test
                  </>
                )}
              </button>
              
              {results[notificationType.type] && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <p className="text-green-800 font-medium">✓ API call successful!</p>
                  <p className="text-green-700 mt-1">{results[notificationType.type].message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Zap className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Coming Soon: Full Notification Testing</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>Once user authentication is implemented, this page will allow you to:</p>
              <p>• Send real push notifications to your browser</p>
              <p>• Test in-app notification delivery</p>
              <p>• Verify email and SMS notification channels</p>
              <p>• Monitor notification delivery status and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
