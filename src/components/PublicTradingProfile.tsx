import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useParams, Link } from 'react-router-dom';
import { SEO } from './SEO';

export function PublicTradingProfile() {
  const { username } = useParams<{ username: string }>();
  const profile = useQuery(
    api.profiles.getProfileByUsername,
    username ? { username } : 'skip'
  );
  const tradeableCards = useQuery(
    api.cards.getUserTradeableCards,
    profile ? { userId: profile.userId } : 'skip'
  );
  const wantList = useQuery(
    api.cards.getUserWantList,
    profile ? { userId: profile.userId } : 'skip'
  );

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

  const totalValue =
    tradeableCards?.reduce(
      (sum, item) => sum + (item.card?.marketPrice || 0) * item.quantity,
      0
    ) || 0;

  return (
    <>
      <SEO
        title={`${profile.username}'s Pokemon TCG Trading Profile`}
        description={`View ${profile.username}'s Pokemon TCG collection and want list. Connect to trade Pokemon cards!`}
        url={`https://pokemontcgtrader.com/trade/${username}`}
        type="profile"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Pokemon TCG Trader
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.username}
                </h1>
                <p className="text-gray-600 mt-1">Pokemon TCG Trader</p>
                {profile.bio && (
                  <p className="text-gray-700 mt-2">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {profile.socialLinks && (
              <div className="mt-6 flex gap-4">
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tradeableCards?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Cards for Trade</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {wantList?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Cards Wanted</div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to={`/trade/${username}/cards`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Cards for Trade
                  </h3>
                  <p className="text-gray-600">
                    Browse {profile.username}'s available cards
                  </p>
                  <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-700">
                    View {tradeableCards?.length || 0} cards →
                  </div>
                </div>
                <div className="text-4xl text-blue-600">📦</div>
              </div>
            </Link>

            <Link
              to={`/trade/${username}/wants`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Want List
                  </h3>
                  <p className="text-gray-600">
                    See what {profile.username} is looking for
                  </p>
                  <div className="mt-4 text-yellow-600 font-medium group-hover:text-yellow-700">
                    View {wantList?.length || 0} cards →
                  </div>
                </div>
                <div className="text-4xl text-yellow-600">⭐</div>
              </div>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Interested in Trading?
            </h2>
            <p className="text-gray-600 mb-4">
              Contact {profile.username} through their social media links above
              to discuss potential trades.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Trading Tip:</strong> Always verify card conditions and
                use secure payment methods when trading online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
