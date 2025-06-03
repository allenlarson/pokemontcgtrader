import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAllSets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sets").collect();
  },
});

export const getSetById = query({
  args: { setId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sets")
      .withIndex("by_set_id", (q) => q.eq("setId", args.setId))
      .unique();
  },
});

export const createSet = mutation({
  args: {
    setId: v.string(),
    name: v.string(),
    series: v.string(),
    releaseDate: v.string(),
    totalCards: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sets", args);
  },
});
