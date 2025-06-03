import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

export function WantList() {
  const wantList = useQuery(api.cards.getUserWantList, {});
  const removeFromWants = useMutation(api.cards.removeFromWantList);

  const handleRemove = async (cardId: string) => {
    try {
      await removeFromWants({ cardId });
      toast.success('Removed from want list');
    } catch (error) {
      toast.error('Failed to remove card');
    }
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

  const formatCondition = (condition: string) => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Want List</h2>

        {wantList && wantList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wantList.map(item => (
              <div
                key={item._id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
            <div className="text-gray-400 text-6xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No cards in your want list yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by searching for cards and adding them to your want list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
