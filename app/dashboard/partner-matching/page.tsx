'use client';

import { useState, useEffect } from 'react';
import { Heart, Users, MessageCircle, Settings, Filter, Star, Lock } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { useRouter } from 'next/navigation';

interface DanceStyle {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  bio: string;
  location: string;
  experienceLevel: string;
  lookingFor: string;
  ageRangeMin: number;
  ageRangeMax: number;
  isActive: boolean;
  user: {
    id: string;
    fullName: string;
    profileImage: string;
    age?: number;
  };
  danceStyles: Array<{
    style: DanceStyle;
    level: string;
  }>;
  compatibilityScore: number;
  compatibilityReasons: string[];
  commonDanceStyles: DanceStyle[];
}

interface MatchRequest {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  sender: {
    user: {
      id: string;
      fullName: string;
      profileImage: string;
    };
  };
  receiver: {
    user: {
      id: string;
      fullName: string;
      profileImage: string;
    };
  };
}

export default function PartnerMatchingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('discover');
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [filters, setFilters] = useState({
    experienceLevel: '',
    ageRangeMin: '',
    ageRangeMax: '',
    location: '',
    danceStyleId: '',
    lookingFor: ''
  });

  // Check if user has access to partner matching
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Restrict access to students/users and instructors only
  if (!user || (user.role !== 'USER' && user.role !== 'INSTRUCTOR')) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            Partner matching is only available to students and instructors. 
            {user?.role === 'ADMIN' ? 'As an admin, you can monitor partner matching activity from the admin panel.' : ''}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const userId = user.id;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if user has a profile
      const profileResponse = await fetch(`/api/user/profile/${userId}`);
      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        setHasProfile(true);
        
        // Load potential matches
        const matchesResponse = await fetch(`/api/user/partner-discovery/${userId}`);
        const matchesData = await matchesResponse.json();
        
        if (matchesData.success) {
          setPotentialMatches(matchesData.data.matches);
        }

        // Load match requests
        const requestsResponse = await fetch(`/api/user/match-requests/${userId}`);
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
          setMatchRequests(requestsData.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMatchRequest = async (requesteeId: string, message: string) => {
    try {
      const response = await fetch(`/api/user/match-requests/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesteeId,
          message
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Match request sent successfully!');
        loadData(); // Refresh data
      } else {
        alert(data.message || 'Failed to send match request');
      }
    } catch (error) {
      console.error('Error sending match request:', error);
      alert('Failed to send match request');
    }
  };

  const handleMatchRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/user/match-requests/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        loadData(); // Refresh data
      } else {
        alert(data.message || `Failed to ${action} match request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing match request:`, error);
      alert(`Failed to ${action} match request`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Heart className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Create Your Partner Profile
          </h2>
          <p className="text-gray-600 mb-4">
            To start finding dance partners, you need to create your partner matching profile first.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/partner-matching/profile'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Matching</h1>
        <p className="text-gray-600">Find your perfect dance partner</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline-block mr-2" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline-block mr-2" />
            Match Requests
            {matchRequests.filter(r => r.status === 'PENDING' && r.receiver?.user?.id === userId).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {matchRequests.filter(r => r.status === 'PENDING' && r.receiver?.user?.id === userId).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline-block mr-2" />
            My Profile
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'discover' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Potential Partners</h2>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potentialMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={match.user.profileImage || '/api/placeholder/50/50'}
                      alt={match.user.fullName}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {match.user.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {match.user.age ? `${match.user.age} years old` : 'Age not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {Math.round(match.compatibilityScore * 100)}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {match.compatibilityReasons.join(', ')}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Experience:</strong> {match.experienceLevel}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Location:</strong> {match.location}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Looking for:</strong> {Array.isArray(match.lookingFor) ? match.lookingFor.join(', ') : match.lookingFor}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2"><strong>Dance Styles:</strong></p>
                    <div className="flex flex-wrap gap-1">
                      {match.danceStyles.map((style, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${
                            match.commonDanceStyles.some(common => common.id === style.style.id)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {style.style.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">{match.bio}</p>
                  </div>

                  <button
                    onClick={() => {
                      const message = prompt('Add a personal message (optional):');
                      sendMatchRequest(match.user.id, message || '');
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send Match Request
                  </button>
                </div>
              </div>
            ))}
          </div>

          {potentialMatches.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">Try adjusting your profile or check back later for new members.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Match Requests</h2>

          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Received Requests</h3>
              <div className="space-y-4">
                {matchRequests
                  .filter(request => request.receiver?.user?.id === userId && request.status === 'PENDING')
                  .map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={request.sender?.user?.profileImage || '/api/placeholder/50/50'}
                            alt={request.sender?.user?.fullName || 'User'}
                            className="w-12 h-12 rounded-full mr-4"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.sender?.user?.fullName || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMatchRequest(request.id, 'accept')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleMatchRequest(request.id, 'reject')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Sent Requests */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sent Requests</h3>
              <div className="space-y-4">
                {matchRequests
                  .filter(request => request.sender?.user?.id === userId)
                  .map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={request.receiver?.user?.profileImage || '/api/placeholder/50/50'}
                            alt={request.receiver?.user?.fullName || 'User'}
                            className="w-12 h-12 rounded-full mr-4"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.receiver?.user?.fullName || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {matchRequests.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No match requests</h3>
              <p className="text-gray-600">Start discovering potential partners to send match requests.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Partner Profile</h2>
            <button
              onClick={() => window.location.href = '/dashboard/partner-matching/profile'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">
              Click "Edit Profile" to view and update your partner matching profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
