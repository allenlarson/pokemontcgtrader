import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

export function PublicWantList() {
  const { username } = useParams<{ username: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const profile = useQuery(
    api.profiles.getProfileByUsername,
    username ? { username } : 'skip'
  );
  const wantList = useQuery(
    api.cards.getUserWantList,
    profile ? { userId: profile.userId } : 'skip'
  );

  // Filter cards based on search query
  const filteredWantList = wantList?.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.card?.name?.toLowerCase().includes(searchLower) ||
      item.card?.setName?.toLowerCase().includes(searchLower)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
            <span className="text-gray-600">Want List</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-yellow-600">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.username}'s Want List
              </h1>
              <p className="text-gray-600">Cards they're looking to acquire</p>
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
              to={`/trade/${username}/cards`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Cards for Trade
            </Link>
          </div>
        </div>

        {/* Want List Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Wanted Cards ({filteredWantList?.length || 0})
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

          {filteredWantList && filteredWantList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredWantList.map(item => (
                <div
                  key={item._id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[3/4] bg-gray-100">
                    {item.card?.imageUrl ? (
                      <img
                        src={item.card.imageUrl}
                        alt={item.card.name}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  {/* <div className="p-4"> */}
                  {/* <h3 className="font-semibold text-gray-900 mb-1">
                      {item.card?.name || 'Unknown Card'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.card?.setName || 'Unknown Set'}
                    </p> */}
                  {/* {item.card?.rarity && (
                      <p className="text-sm text-gray-500 mb-2">{item.card.rarity}</p>
                    )}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Priority:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max Condition:</span>
                        <span className="font-medium">
                          {formatCondition(item.maxCondition)}
                        </span>
                      </div>
                      {item.card?.marketPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Market Price:</span>
                          <span className="font-bold text-green-600">
                            ${item.card.marketPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 italic mb-3">
                        "{item.notes}"
                      </p>
                    )} */}
                  {/* </div> */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cards in want list
              </h3>
              <p className="text-gray-500">
                {profile.username} hasn't added any cards to their want list
                yet.
              </p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Have These Cards?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any of the cards {profile.username} is looking for,
            contact them to discuss a trade!
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
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Trading Tip:</strong> Check the priority levels and
              condition requirements before reaching out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
