'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, Lock } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { useRouter } from 'next/navigation';

interface DanceStyle {
  id: string;
  name: string;
}

interface UserProfileDanceStyle {
  styleId: string;
  level: string;
  style: DanceStyle;
}

interface UserProfile {
  id?: string;
  bio: string;
  location: string;
  experienceLevel: string;
  lookingFor: string[];
  ageRange?: string;
  isActiveForMatching: boolean;
  danceStyles: UserProfileDanceStyle[];
}

export default function PartnerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    bio: '',
    location: '',
    experienceLevel: 'BEGINNER',
    lookingFor: ['PRACTICE_PARTNER'],
    ageRange: '18-65',
    isActiveForMatching: true,
    danceStyles: []
  });
  const [availableDanceStyles, setAvailableDanceStyles] = useState<DanceStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const experienceLevels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'PROFESSIONAL', label: 'Professional' }
  ];

  const lookingForOptions = [
    { value: 'PRACTICE_PARTNER', label: 'Practice Partner' },
    { value: 'COMPETITION_PARTNER', label: 'Competition Partner' },
    { value: 'SOCIAL_PARTNER', label: 'Social Dancing Partner' },
    { value: 'LEARNING_BUDDY', label: 'Learning Partner' }
  ];

  const proficiencyLevels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available dance styles
      const stylesResponse = await fetch('/api/admin/dance-styles');
      const stylesData = await stylesResponse.json();
      
      if (stylesData.success) {
        setAvailableDanceStyles(stylesData.data.filter((style: DanceStyle & { isActive: boolean }) => style.isActive));
      }

      // Load existing profile
      const profileResponse = await fetch(`/api/user/profile/${userId}`);
      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profile saved successfully!');
        setIsEditing(true);
        setProfile(data.data);
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your partner profile? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profile deleted successfully!');
        window.location.href = '/dashboard/partner-matching';
      } else {
        alert(data.message || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  const addDanceStyle = () => {
    setProfile({
      ...profile,
      danceStyles: [
        ...profile.danceStyles,
        {
          styleId: '',
          level: 'BEGINNER',
          style: { id: '', name: '' }
        }
      ]
    });
  };

  const updateDanceStyle = (index: number, field: 'styleId' | 'level', value: string) => {
    const updatedStyles = [...profile.danceStyles];
    updatedStyles[index] = {
      ...updatedStyles[index],
      [field]: value
    };

    // If updating styleId, also update the style object for display
    if (field === 'styleId') {
      const selectedStyle = availableDanceStyles.find(style => style.id === value);
      if (selectedStyle) {
        updatedStyles[index].style = selectedStyle;
      }
    }

    setProfile({
      ...profile,
      danceStyles: updatedStyles
    });
  };

  const removeDanceStyle = (index: number) => {
    setProfile({
      ...profile,
      danceStyles: profile.danceStyles.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => window.location.href = '/dashboard/partner-matching'}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Partner Matching
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Partner Profile' : 'Create Partner Profile'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell potential partners about yourself, your dance goals, and what you're looking for..."
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New York, NY"
                required
              />
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={profile.experienceLevel}
                onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Looking For */}
            <div>
              <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-2">
                Looking For
              </label>
              <select
                id="lookingFor"
                value={profile.lookingFor[0] || ''}
                onChange={(e) => setProfile({ ...profile, lookingFor: [e.target.value] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {lookingForOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Range */}
            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Partner Age Range
              </label>
              <input
                type="text"
                id="ageRange"
                value={profile.ageRange || ''}
                onChange={(e) => setProfile({ ...profile, ageRange: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25-40"
                pattern="\d+-\d+"
                title="Please enter age range in format: min-max (e.g., 25-40)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter age range in format: minimum-maximum (e.g., 25-40)
              </p>
            </div>

            {/* Dance Styles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Dance Styles & Proficiency
                </label>
                <button
                  type="button"
                  onClick={addDanceStyle}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Style
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.danceStyles.map((style, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <select
                        value={style.styleId}
                        onChange={(e) => updateDanceStyle(index, 'styleId', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Dance Style</option>
                        {availableDanceStyles.map((danceStyle) => (
                          <option key={danceStyle.id} value={danceStyle.id}>
                            {danceStyle.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        value={style.level}
                        onChange={(e) => updateDanceStyle(index, 'level', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {proficiencyLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDanceStyle(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {profile.danceStyles.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No dance styles added yet. Click "Add Style" to get started.
                  </p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveForMatching"
                  checked={profile.isActiveForMatching}
                  onChange={(e) => setProfile({ ...profile, isActiveForMatching: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActiveForMatching" className="ml-2 block text-sm text-gray-700">
                  Make my profile visible to other users
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uncheck this if you want to temporarily hide your profile from partner matching
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete Profile
                  </button>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => window.location.href = '/dashboard/partner-matching'}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
