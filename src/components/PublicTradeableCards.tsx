import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

export function PublicTradeableCards() {
  const { username } = useParams<{ username: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const profile = useQuery(
    api.profiles.getProfileByUsername,
    username ? { username } : 'skip'
  );
  const tradeableCards = useQuery(
    api.cards.getUserTradeableCards,
    profile ? { userId: profile.userId } : 'skip'
  );

  // Filter cards based on search query
  const filteredCards = tradeableCards?.filter(card => {
    const searchLower = searchQuery.toLowerCase();
    return (
      card.card?.name?.toLowerCase().includes(searchLower) ||
      card.card?.setName?.toLowerCase().includes(searchLower)
    );
  });

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The user "{username}" doesn't exist.
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const formatCondition = (condition: string) => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'mint':
        return 'text-green-600';
      case 'near_mint':
        return 'text-green-500';
      case 'lightly_played':
        return 'text-yellow-600';
      case 'moderately_played':
        return 'text-orange-500';
      case 'heavily_played':
        return 'text-red-500';
      case 'damaged':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              PokéTrader App
            </Link>
            <Link
              to="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to={`/trade/${username}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {profile.username}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Cards for Trade</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.username}'s Cards for Trade
              </h1>
              <p className="text-gray-600">
                Browse available cards and contact for trades
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              to={`/trade/${username}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Profile
            </Link>
            <Link
              to={`/trade/${username}/wants`}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              View Want List
            </Link>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Available Cards ({filteredCards?.length || 0})
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {filteredCards && filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map(item => (
                <div
                  key={item._id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[3/4] bg-gray-100">
                    {item.card?.imageUrl ? (
                      <img
                        src={item.card.imageUrl}
                        alt={item.card.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.card?.name || 'Unknown Card'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.card?.setName || 'Unknown Set'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cards available for trade
              </h3>
              <p className="text-gray-500">
                {profile.username} hasn't added any cards for trade yet.
              </p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Interested in Trading?
          </h2>
          <p className="text-gray-600 mb-4">
            Contact {profile.username} through their social media links to
            discuss potential trades.
          </p>
          {profile.socialLinks && (
            <div className="flex gap-4 mb-4">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Twitter: {profile.socialLinks.twitter}
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600"
                >
                  Instagram: {profile.socialLinks.instagram}
                </a>
              )}
              {profile.socialLinks.discord && (
                <span className="text-indigo-500">
                  Discord: {profile.socialLinks.discord}
                </span>
              )}
            </div>
          )}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Trading Tip:</strong> Always verify card conditions and
              use secure payment methods when trading online.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
