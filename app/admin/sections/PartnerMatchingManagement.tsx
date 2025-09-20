'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Activity, 
  Search,
  Filter,
  ChevronDown,
  Eye,
  Calendar,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';

interface Profile {
  id: string;
  bio: string;
  location: string;
  experienceLevel: string;
  isActiveForMatching: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  danceStyles: Array<{
    level: string;
    style: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    sentRequests: number;
    receivedRequests: number;
  };
}

interface MatchRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  respondedAt?: string;
  sender: {
    id: string;
    user: {
      fullName: string;
      email: string;
      role: string;
    };
  };
  receiver: {
    id: string;
    user: {
      fullName: string;
      email: string;
      role: string;
    };
  };
}

interface Match {
  id: string;
  matchScore: number;
  isActive: boolean;
  createdAt: string;
  user1: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  user2: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

interface Stats {
  overview: {
    totalProfiles: number;
    activeProfiles: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    totalMatches: number;
    activeMatches: number;
    recentRequests: number;
    recentMatches: number;
  };
  distributions: {
    experienceLevel: Array<{
      experienceLevel: string;
      _count: { experienceLevel: number };
    }>;
    locations: Array<{
      location: string;
      _count: { location: number };
    }>;
    danceStyles: Array<{
      styleId: string;
      name: string;
      _count: { styleId: number };
    }>;
  };
  matchSuccessRate: number;
  profileUtilization: number;
}

export default function PartnerMatchingManagement() {
  const [activeTab, setActiveTab] = useState('stats');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    experienceLevel: '',
    status: '',
    isActive: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'stats':
          const statsResponse = await fetch('/api/admin/partner-matching/stats');
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
          break;
          
        case 'profiles':
          const profilesResponse = await fetch(`/api/admin/partner-matching/profiles?search=${searchTerm}&experienceLevel=${filters.experienceLevel}&isActive=${filters.isActive}`);
          const profilesData = await profilesResponse.json();
          if (profilesData.success) {
            setProfiles(profilesData.data.profiles);
          }
          break;
          
        case 'requests':
          const requestsResponse = await fetch(`/api/admin/partner-matching/requests?search=${searchTerm}&status=${filters.status}`);
          const requestsData = await requestsResponse.json();
          if (requestsData.success) {
            setRequests(requestsData.data.requests);
          }
          break;
          
        case 'matches':
          const matchesResponse = await fetch(`/api/admin/partner-matching/matches?search=${searchTerm}&isActive=${filters.isActive}`);
          const matchesData = await matchesResponse.json();
          if (matchesData.success) {
            setMatches(matchesData.data.matches);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading partner matching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getExperienceLevelBadge = (level: string) => {
    const levelStyles = {
      BEGINNER: 'bg-blue-100 text-blue-800',
      INTERMEDIATE: 'bg-purple-100 text-purple-800',
      ADVANCED: 'bg-orange-100 text-orange-800',
      PROFESSIONAL: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${levelStyles[level as keyof typeof levelStyles] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, change }: { title: string; value: number | string; icon: any; change?: number }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Partner Matching Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'stats', label: 'Overview & Stats', icon: Activity },
            { id: 'profiles', label: 'User Profiles', icon: Users },
            { id: 'requests', label: 'Match Requests', icon: MessageCircle },
            { id: 'matches', label: 'Active Matches', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Profiles"
                  value={stats.overview.totalProfiles}
                  icon={Users}
                />
                <StatCard
                  title="Active Profiles"
                  value={stats.overview.activeProfiles}
                  icon={Activity}
                />
                <StatCard
                  title="Match Requests"
                  value={stats.overview.totalRequests}
                  icon={MessageCircle}
                />
                <StatCard
                  title="Successful Matches"
                  value={stats.overview.totalMatches}
                  icon={Heart}
                />
              </div>

              {/* Success Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Success Rate</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.matchSuccessRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.overview.acceptedRequests} accepted out of {stats.overview.totalRequests} requests
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Utilization</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.profileUtilization.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.overview.activeProfiles} active out of {stats.overview.totalProfiles} profiles
                  </p>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Experience Level Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Level</h3>
                  <div className="space-y-3">
                    {stats.distributions.experienceLevel.map((item) => (
                      <div key={item.experienceLevel} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.experienceLevel}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${(item._count.experienceLevel / stats.overview.totalProfiles) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item._count.experienceLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Locations */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    {stats.distributions.locations.slice(0, 5).map((item) => (
                      <div key={item.location} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{item.location}</span>
                        <span className="text-sm font-medium">{item._count.location}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Dance Styles */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Dance Styles</h3>
                  <div className="space-y-3">
                    {stats.distributions.danceStyles.slice(0, 5).map((item) => (
                      <div key={item.styleId} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="text-sm font-medium">{item._count.styleId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search profiles..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                    />
                  </div>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.experienceLevel}
                  onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                >
                  <option value="">All Experience Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PROFESSIONAL">Professional</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                >
                  <option value="">All Profiles</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Profiles Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dance Styles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.map((profile) => (
                      <tr key={profile.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={profile.user.profileImage || '/api/placeholder/40/40'}
                              alt={profile.user.fullName}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{profile.user.fullName}</div>
                              <div className="text-sm text-gray-500">{profile.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getExperienceLevelBadge(profile.experienceLevel)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {profile.location || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {profile.danceStyles.slice(0, 3).map((style, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                              >
                                {style.style.name}
                              </span>
                            ))}
                            {profile.danceStyles.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                +{profile.danceStyles.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>Sent: {profile._count.sentRequests}</div>
                            <div>Received: {profile._count.receivedRequests}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.isActiveForMatching 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.isActiveForMatching ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Match Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search match requests..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                    />
                  </div>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Match Requests Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.sender.user.fullName}</div>
                            <div className="text-sm text-gray-500">{request.sender.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.receiver.user.fullName}</div>
                            <div className="text-sm text-gray-500">{request.receiver.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {request.message || 'No message'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search matches..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                    />
                  </div>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                >
                  <option value="">All Matches</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Matches Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matches.map((match) => (
                      <tr key={match.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{match.user1.fullName}</div>
                              <div className="text-sm text-gray-500">{match.user1.email}</div>
                            </div>
                            <Heart className="h-4 w-4 text-red-500" />
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{match.user2.fullName}</div>
                              <div className="text-sm text-gray-500">{match.user2.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">
                              {(match.matchScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            match.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {match.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(match.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}