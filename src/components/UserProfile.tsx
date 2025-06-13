import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

export function UserProfile() {
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);
  const tradeableCards = useQuery(api.cards.getUserTradeableCards, {});
  const wantList = useQuery(api.cards.getUserWantList, {});
  const updateProfile = useMutation(api.profiles.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    discord: '',
  });

  // Initialize form when profile loads
  if (userProfile && !isEditing && bio === '') {
    setBio(userProfile.bio || '');
    const links = userProfile.socialLinks || {};
    setSocialLinks({
      twitter: links.twitter || '',
      instagram: links.instagram || '',
      discord: links.discord || '',
    });
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        bio: bio || undefined,
        socialLinks: {
          twitter: socialLinks.twitter || undefined,
          instagram: socialLinks.instagram || undefined,
          discord: socialLinks.discord || undefined,
        },
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      const links = userProfile.socialLinks || {};
      setSocialLinks({
        twitter: links.twitter || '',
        instagram: links.instagram || '',
        discord: links.discord || '',
      });
    }
    setIsEditing(false);
  };

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/trade/${userProfile?.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied to clipboard!');
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/trade/${userProfile.username}`;
  const totalValue =
    tradeableCards?.reduce(
      (sum, item) => sum + (item.card?.marketPrice || 0) * item.quantity,
      0
    ) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-600 mt-1">Your public trading profile</p>
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={() => (window.location.href = profileUrl)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-color ml-2"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Public Profile Link */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Public Profile Link
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-blue-200 rounded-md bg-white text-sm"
            />
            <button
              onClick={copyProfileLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Copy Link
            </button>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Share this link with other traders to show your cards and want list
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={userProfile.username}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Username cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell other traders about yourself, your collecting interests, trading preferences, etc."
              />
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px]">
                {bio || (
                  <span className="text-gray-500 italic">No bio added yet</span>
                )}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={socialLinks.twitter}
                    onChange={e =>
                      setSocialLinks(prev => ({
                        ...prev,
                        twitter: e.target.value,
                      }))
                    }
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {socialLinks.twitter || (
                      <span className="text-gray-500 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={socialLinks.instagram}
                    onChange={e =>
                      setSocialLinks(prev => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {socialLinks.instagram || (
                      <span className="text-gray-500 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={socialLinks.discord}
                    onChange={e =>
                      setSocialLinks(prev => ({
                        ...prev,
                        discord: e.target.value,
                      }))
                    }
                    placeholder="username#1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {socialLinks.discord || (
                      <span className="text-gray-500 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
