import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with custom usernames
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    bio: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      discord: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  // Pokemon cards cache from API
  cards: defineTable({
    cardId: v.string(), // Pokemon TCG API card ID
    name: v.string(),
    set: v.string(),
    setName: v.string(),
    rarity: v.optional(v.string()),
    types: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    marketPrice: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_card_id", ["cardId"])
    .index("by_set", ["set"])
    .index("by_name", ["name"]),

  // User's tradeable cards
  tradeableCards: defineTable({
    userId: v.id("users"),
    cardId: v.string(),
    condition: v.string(), // "mint", "near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged"
    quantity: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_card", ["cardId"])
    .index("by_user_and_card", ["userId", "cardId"]),

  // User's want list
  wantList: defineTable({
    userId: v.id("users"),
    cardId: v.string(),
    priority: v.string(), // "high", "medium", "low"
    maxCondition: v.string(), // worst condition they'll accept
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_card", ["cardId"])
    .index("by_user_and_card", ["userId", "cardId"]),

  // Trade notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "match_found", "trade_request", "trade_accepted"
    title: v.string(),
    message: v.string(),
    relatedCardId: v.optional(v.string()),
    relatedUserId: v.optional(v.id("users")),
    read: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  // Pokemon sets for filtering
  sets: defineTable({
    setId: v.string(),
    name: v.string(),
    series: v.string(),
    releaseDate: v.string(),
    totalCards: v.number(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_set_id", ["setId"])
    .index("by_series", ["series"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
