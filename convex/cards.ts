import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const searchCards = query({
  args: {
    searchTerm: v.optional(v.string()),
    setId: v.optional(v.string()),
    rarity: v.optional(v.string()),
    types: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let cards;

    if (args.setId) {
      const setId = args.setId;
      cards = await ctx.db
        .query("cards")
        .withIndex("by_set", (q) => q.eq("set", setId))
        .collect();
    } else {
      cards = await ctx.db.query("cards").collect();
    }

    return cards.filter((card) => {
      if (args.searchTerm && !card.name.toLowerCase().includes(args.searchTerm.toLowerCase())) {
        return false;
      }
      if (args.rarity && card.rarity !== args.rarity) {
        return false;
      }
      if (args.types && args.types.length > 0 && card.types) {
        const hasMatchingType = args.types.some(type => card.types?.includes(type));
        if (!hasMatchingType) return false;
      }
      return true;
    });
  },
});

export const getCard = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cards")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();
  },
});

export const getUserTradeableCards = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;
    
    if (!targetUserId) return [];

    const tradeableCards = await ctx.db
      .query("tradeableCards")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();

    const cardsWithDetails = await Promise.all(
      tradeableCards.map(async (tc) => {
        const card = await ctx.db
          .query("cards")
          .withIndex("by_card_id", (q) => q.eq("cardId", tc.cardId))
          .unique();
        return { ...tc, card };
      })
    );

    return cardsWithDetails;
  },
});

export const getUserWantList = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;
    
    if (!targetUserId) return [];

    const wantList = await ctx.db
      .query("wantList")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();

    const cardsWithDetails = await Promise.all(
      wantList.map(async (wl) => {
        const card = await ctx.db
          .query("cards")
          .withIndex("by_card_id", (q) => q.eq("cardId", wl.cardId))
          .unique();
        return { ...wl, card };
      })
    );

    return cardsWithDetails;
  },
});

export const addToTradeableCards = mutation({
  args: {
    cardId: v.string(),
    condition: v.string(),
    quantity: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if card already exists in tradeable cards
    const existing = await ctx.db
      .query("tradeableCards")
      .withIndex("by_user_and_card", (q) => q.eq("userId", userId).eq("cardId", args.cardId))
      .unique();

    if (existing) {
      // Update quantity
      return await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
        condition: args.condition,
        notes: args.notes,
      });
    } else {
      return await ctx.db.insert("tradeableCards", {
        userId,
        cardId: args.cardId,
        condition: args.condition,
        quantity: args.quantity,
        notes: args.notes,
      });
    }
  },
});

export const addToWantList = mutation({
  args: {
    cardId: v.string(),
    priority: v.string(),
    maxCondition: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if card already exists in want list
    const existing = await ctx.db
      .query("wantList")
      .withIndex("by_user_and_card", (q) => q.eq("userId", userId).eq("cardId", args.cardId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        priority: args.priority,
        maxCondition: args.maxCondition,
        notes: args.notes,
      });
    } else {
      return await ctx.db.insert("wantList", {
        userId,
        cardId: args.cardId,
        priority: args.priority,
        maxCondition: args.maxCondition,
        notes: args.notes,
      });
    }
  },
});

export const removeFromTradeableCards = mutation({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("tradeableCards")
      .withIndex("by_user_and_card", (q) => q.eq("userId", userId).eq("cardId", args.cardId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const removeFromWantList = mutation({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("wantList")
      .withIndex("by_user_and_card", (q) => q.eq("userId", userId).eq("cardId", args.cardId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Action to fetch cards from Pokemon TCG API
export const fetchCardsFromAPI = action({
  args: {
    searchTerm: v.optional(v.string()),
    setId: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.POKEMON_TCG_API_KEY;
    if (!apiKey) {
      throw new Error("Pokemon TCG API key not configured");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Build search query
    let searchQuery = "";
    if (args.searchTerm) {
      searchQuery += `name:"*${args.searchTerm}*"`;
    }
    if (args.setId) {
      if (searchQuery) searchQuery += " AND ";
      searchQuery += `set.id:${args.setId}`;
    }
    
    if (searchQuery) {
      queryParams.append("q", searchQuery);
    }
    
    queryParams.append("page", String(args.page || 1));
    queryParams.append("pageSize", String(args.pageSize || 20));
    queryParams.append("orderBy", "name");

    const url = `https://api.pokemontcg.io/v2/cards?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pokemon TCG API error: ${response.status}`);
      }

      const data = await response.json();
      const cards = data.data || [];

      // Store cards in database and return processed data
      const processedCards = [];
      
      for (const apiCard of cards) {
        const cardData = {
          cardId: apiCard.id,
          name: apiCard.name,
          set: apiCard.set.id,
          setName: apiCard.set.name,
          rarity: apiCard.rarity || undefined,
          types: apiCard.types || undefined,
          imageUrl: apiCard.images?.large || apiCard.images?.small || undefined,
          marketPrice: apiCard.tcgplayer?.prices?.holofoil?.market || 
                      apiCard.tcgplayer?.prices?.normal?.market || 
                      apiCard.tcgplayer?.prices?.reverseHolofoil?.market || 
                      undefined,
          lastUpdated: Date.now(),
        };

        // Check if card already exists
        const existing = await ctx.runQuery(api.cards.getCard, { cardId: cardData.cardId });
        if (!existing) {
          await ctx.runMutation(api.cards.storeCard, cardData);
        }

        processedCards.push(cardData);
      }

      return {
        cards: processedCards,
        totalCount: data.totalCount || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
      };
    } catch (error) {
      console.error("Error fetching from Pokemon TCG API:", error);
      throw new Error("Failed to fetch cards from Pokemon TCG API");
    }
  },
});

// NEW: Action to fetch ALL cards from a specific set
export const fetchAllCardsFromSet = action({
  args: {
    setId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.POKEMON_TCG_API_KEY;
    if (!apiKey) {
      throw new Error("Pokemon TCG API key not configured");
    }

    let allCards = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalCardsProcessed = 0;

    try {
      // First, get the set info to know how many cards to expect
      const setResponse = await fetch(`https://api.pokemontcg.io/v2/sets/${args.setId}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!setResponse.ok) {
        throw new Error(`Pokemon TCG API error: ${setResponse.status}`);
      }

      const setData = await setResponse.json();
      const expectedCards = setData.data?.total || 0;

      // Fetch all pages of cards for this set
      do {
        const queryParams = new URLSearchParams();
        queryParams.append("q", `set.id:${args.setId}`);
        queryParams.append("page", String(currentPage));
        queryParams.append("pageSize", "250"); // Maximum page size
        queryParams.append("orderBy", "number");

        const url = `https://api.pokemontcg.io/v2/cards?${queryParams.toString()}`;

        const response = await fetch(url, {
          headers: {
            "X-Api-Key": apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Pokemon TCG API error: ${response.status}`);
        }

        const data = await response.json();
        const cards = data.data || [];
        
        // Calculate total pages from the response
        totalPages = Math.ceil((data.totalCount || 0) / (data.pageSize || 250));

        // Process and store each card
        for (const apiCard of cards) {
          const cardData = {
            cardId: apiCard.id,
            name: apiCard.name,
            set: apiCard.set.id,
            setName: apiCard.set.name,
            rarity: apiCard.rarity || undefined,
            types: apiCard.types || undefined,
            imageUrl: apiCard.images?.large || apiCard.images?.small || undefined,
            marketPrice: apiCard.tcgplayer?.prices?.holofoil?.market || 
                        apiCard.tcgplayer?.prices?.normal?.market || 
                        apiCard.tcgplayer?.prices?.reverseHolofoil?.market || 
                        undefined,
            lastUpdated: Date.now(),
          };

          // Check if card already exists
          const existing = await ctx.runQuery(api.cards.getCard, { cardId: cardData.cardId });
          if (!existing) {
            await ctx.runMutation(api.cards.storeCard, cardData);
          }

          allCards.push(cardData);
          totalCardsProcessed++;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      return {
        setId: args.setId,
        totalCardsProcessed,
        expectedCards,
        pagesProcessed: totalPages,
        message: `Successfully loaded ${totalCardsProcessed} cards from set ${args.setId}${expectedCards > 0 ? ` (expected ${expectedCards})` : ''}`
      };

    } catch (error) {
      console.error("Error fetching all cards from set:", error);
      throw new Error(`Failed to fetch all cards from set ${args.setId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Action to fetch and store Pokemon sets - Updated to get recent sets
export const fetchSetsFromAPI = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.POKEMON_TCG_API_KEY;
    if (!apiKey) {
      throw new Error("Pokemon TCG API key not configured");
    }

    try {
      // Fetch sets ordered by release date (newest first) with pagination
      const queryParams = new URLSearchParams();
      queryParams.append("orderBy", "-releaseDate"); // Negative sign for descending order
      queryParams.append("pageSize", "250"); // Get more sets per request
      
      const response = await fetch(`https://api.pokemontcg.io/v2/sets?${queryParams.toString()}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pokemon TCG API error: ${response.status}`);
      }

      const data = await response.json();
      const sets = data.data || [];

      // Store sets in database
      let newSetsCount = 0;
      for (const apiSet of sets) {
        const existing = await ctx.runQuery(api.sets.getSetById, { setId: apiSet.id });
        if (!existing) {
          await ctx.runMutation(api.sets.createSet, {
            setId: apiSet.id,
            name: apiSet.name,
            series: apiSet.series,
            releaseDate: apiSet.releaseDate,
            totalCards: apiSet.total,
            imageUrl: apiSet.images?.logo || undefined,
          });
          newSetsCount++;
        }
      }

      return {
        totalSets: sets.length,
        newSets: newSetsCount,
        message: `Loaded ${sets.length} sets (${newSetsCount} new)`
      };
    } catch (error) {
      console.error("Error fetching sets from Pokemon TCG API:", error);
      throw new Error("Failed to fetch sets from Pokemon TCG API");
    }
  },
});

// Action to fetch recent sets only (last 2 years)
export const fetchRecentSetsFromAPI = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.POKEMON_TCG_API_KEY;
    if (!apiKey) {
      throw new Error("Pokemon TCG API key not configured");
    }

    try {
      // Calculate date 2 years ago
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const dateFilter = twoYearsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      // Build query for recent sets
      const queryParams = new URLSearchParams();
      queryParams.append("q", `releaseDate:[${dateFilter} TO *]`); // Sets released after dateFilter
      queryParams.append("orderBy", "-releaseDate"); // Newest first
      queryParams.append("pageSize", "250");
      
      const response = await fetch(`https://api.pokemontcg.io/v2/sets?${queryParams.toString()}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pokemon TCG API error: ${response.status}`);
      }

      const data = await response.json();
      const sets = data.data || [];

      // Store sets in database
      let newSetsCount = 0;
      for (const apiSet of sets) {
        const existing = await ctx.runQuery(api.sets.getSetById, { setId: apiSet.id });
        if (!existing) {
          await ctx.runMutation(api.sets.createSet, {
            setId: apiSet.id,
            name: apiSet.name,
            series: apiSet.series,
            releaseDate: apiSet.releaseDate,
            totalCards: apiSet.total,
            imageUrl: apiSet.images?.logo || undefined,
          });
          newSetsCount++;
        }
      }

      return {
        totalSets: sets.length,
        newSets: newSetsCount,
        message: `Loaded ${sets.length} recent sets (${newSetsCount} new)`
      };
    } catch (error) {
      console.error("Error fetching recent sets from Pokemon TCG API:", error);
      throw new Error("Failed to fetch recent sets from Pokemon TCG API");
    }
  },
});

export const storeCard = mutation({
  args: {
    cardId: v.string(),
    name: v.string(),
    set: v.string(),
    setName: v.string(),
    rarity: v.optional(v.string()),
    types: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    marketPrice: v.optional(v.number()),
    lastUpdated: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cards", args);
  },
});
