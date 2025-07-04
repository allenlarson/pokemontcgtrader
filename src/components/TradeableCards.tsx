import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { useState } from 'react';

export function TradeableCards() {
  const tradeableCards = useQuery(api.cards.getUserTradeableCards, {});
  const removeFromTradeable = useMutation(api.cards.removeFromTradeableCards);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemove = async (cardId: string) => {
    try {
      await removeFromTradeable({ cardId });
      toast.success('Removed from tradeable cards');
    } catch (error) {
      toast.error('Failed to remove card');
    }
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

  const formatCondition = (condition: string) => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredCards = tradeableCards?.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.card?.name?.toLowerCase().includes(searchLower) ||
      item.card?.setName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            My Tradeable Cards
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredCards && filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map(item => (
              <div
                key={item._id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.card?.name || 'Unknown Card'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.card?.setName || 'Unknown Set'}
                  </p>

                  <button
                    onClick={() => handleRemove(item.cardId)}
                    className="w-full bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? 'No matching cards found'
                : 'No tradeable cards yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start by searching for cards and adding them to your tradeable collection.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
