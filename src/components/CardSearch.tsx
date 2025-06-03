import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CardSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [isLoadingAllCards, setIsLoadingAllCards] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);
  
  const cards = useQuery(
    api.cards.searchCards,
    hasSearched ? {
      searchTerm: searchTerm || undefined,
      setId: selectedSet || undefined,
      rarity: selectedRarity || undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
    } : "skip"
  );

  const sets = useQuery(api.sets.getAllSets);
  const fetchCards = useAction(api.cards.fetchCardsFromAPI);
  const fetchSets = useAction(api.cards.fetchSetsFromAPI);
  const fetchRecentSets = useAction(api.cards.fetchRecentSetsFromAPI);
  const fetchAllCardsFromSet = useAction(api.cards.fetchAllCardsFromSet);
  const addToTradeable = useMutation(api.cards.addToTradeableCards);
  const addToWants = useMutation(api.cards.addToWantList);

  const pokemonTypes = [
    "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", 
    "Fighting", "Poison", "Ground", "Flying", "Bug", "Rock", 
    "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Normal"
  ];

  const rarities = [
    "Common", "Uncommon", "Rare", "Rare Holo", "Rare Holo EX", 
    "Rare Holo GX", "Rare Holo V", "Rare Holo VMAX", "Rare Ultra",
    "Rare Secret", "Rare Rainbow", "Promo"
  ];

  useEffect(() => {
    // Load recent sets on component mount
    const loadRecentSets = async () => {
      setIsLoadingSets(true);
      try {
        const result = await fetchRecentSets();
        if (result.newSets > 0) {
          toast.success(result.message);
        }
      } catch (error) {
        console.error("Failed to load recent sets:", error);
        // Fallback to loading all sets
        try {
          await fetchSets();
        } catch (fallbackError) {
          console.error("Failed to load sets:", fallbackError);
        }
      } finally {
        setIsLoadingSets(false);
      }
    };
    loadRecentSets();
  }, []);

  const handleLoadAllSets = async () => {
    setIsLoadingSets(true);
    try {
      const result = await fetchSets();
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to load all sets. Please check your API key configuration.");
    } finally {
      setIsLoadingSets(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      await fetchCards({
        searchTerm: searchTerm || undefined,
        setId: selectedSet || undefined,
        page: currentPage,
        pageSize: 20,
      });
      setHasSearched(true); // Enable the query after fetching
      toast.success("Cards loaded successfully!");
    } catch (error) {
      toast.error("Failed to fetch cards. Please check your API key configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadAllCardsFromSet = async () => {
    if (!selectedSet) {
      toast.error("Please select a set first");
      return;
    }

    setIsLoadingAllCards(true);
    try {
      const result = await fetchAllCardsFromSet({ setId: selectedSet });
      setHasSearched(true); // Enable the query after fetching
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to load all cards from set. Please check your API key configuration.");
    } finally {
      setIsLoadingAllCards(false);
    }
  };

  const handleAddToTradeable = async (cardId: string) => {
    try {
      await addToTradeable({
        cardId,
        condition: "near_mint",
        quantity: 1,
      });
      toast.success("Added to tradeable cards!");
    } catch (error) {
      toast.error("Failed to add card");
    }
  };

  const handleAddToWants = async (cardId: string) => {
    try {
      await addToWants({
        cardId,
        priority: "medium",
        maxCondition: "lightly_played",
      });
      toast.success("Added to want list!");
    } catch (error) {
      toast.error("Failed to add card");
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Sort sets by release date (newest first)
  const sortedSets = sets?.sort((a, b) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Search Pokemon Cards</h2>
          <div className="flex gap-2">
            {/* <button
              onClick={handleLoadAllSets}
              disabled={isLoadingSets}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingSets ? "Loading..." : "Load All Sets"}
            </button> */}
            <button
              onClick={handleLoadAllCardsFromSet}
              disabled={isLoadingAllCards || !selectedSet}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingAllCards ? "Loading..." : "Load All Cards from Set"}
            </button>
          </div>
        </div>
        
        {/* Search filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter card name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set {sets && `(${sets.length} available)`}
            </label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All sets</option>
              {sortedSets?.map(set => (
                <option key={set.setId} value={set.setId}>
                  {set.name} ({set.releaseDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rarity
            </label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All rarities</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Searching..." : "Search Cards"}
            </button>
          </div>
        </div>

        {/* Type filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Types
          </label>
          <div className="flex flex-wrap gap-2">
            {pokemonTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTypes.includes(type)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Search Cards:</strong> Fetches 20 cards per page based on your filters</li>
            <li>• <strong>Load All Cards from Set:</strong> Fetches ALL cards from the selected set (may take a while for large sets)</li>
            <li>• Select a set first, then click "Load All Cards from Set" to get the complete set</li>
          </ul>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cards?.map((card) => (
          <div key={card._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[3/4] bg-gray-100">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{card.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{card.setName}</p>
              {card.rarity && (
                <p className="text-sm text-gray-500 mb-2">{card.rarity}</p>
              )}
              {card.types && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.types.map(type => (
                    <span key={type} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {type}
                    </span>
                  ))}
                </div>
              )}
              {card.marketPrice && (
                <p className="text-lg font-bold text-green-600 mb-3">
                  ${card.marketPrice.toFixed(2)}
                </p>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToTradeable(card.cardId)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Add to Trade
                </button>
                <button
                  onClick={() => handleAddToWants(card.cardId)}
                  className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
                >
                  Add to Wants
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasSearched && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to search for cards
          </h3>
          <p className="text-gray-500 text-lg">
            Use the search filters above and click "Search Cards" or "Load All Cards from Set" to get started.
          </p>
        </div>
      )}

      {hasSearched && cards && cards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No cards found
          </h3>
          <p className="text-gray-500 text-lg">
            Try adjusting your search filters or search for different cards.
          </p>
        </div>
      )}
    </div>
  );
}
