import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignedTo: v.id("users"),
    createdBy: v.id("users"),
    dueDate: v.optional(v.number()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    estimatedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAllTasks = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();

    // Populate user data for each taskId
    const tasksWithUsers = await Promise.all(
      tasks.map(async (task) => {
        const creator = await ctx.db.get(task.createdBy);
        const assignee = task.assignedTo
          ? await ctx.db.get(task.assignedTo)
          : null;

        return {
          ...task,
          creator,
          assignee,
        };
      })
    );

    return tasksWithUsers;
  },
});

export const getTasksByAssignee = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", args.userId))
      .collect();

    const tasksWithCreator = await Promise.all(
      tasks.map(async (task) => {
        const creator = await ctx.db.get(task.createdBy);
        return {
          ...task,
          creator,
        };
      })
    );

    return tasksWithCreator;
  },
});

export const getTasksByCreator = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const tasksWithAssignee = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assignedTo
          ? await ctx.db.get(task.assignedTo)
          : null;
        return {
          ...task,
          assignee,
        };
      })
    );

    return tasksWithAssignee;
  },
});

export const getTasks = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;

    if (updates.status === "completed") {
      updates.completedAt = Date.now();
    }

    return await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.taskId);
  },
});

export const overdueTasks = query({
  handler: async (ctx) => {
    const now = Date.now();
    const tasks = ctx.db.query("tasks").collect();

    return (await tasks).filter((task) => {
      task.dueDate &&
        task.dueDate < now &&
        task.status !== "completed" &&
        task.status !== "cancelled";
    });
  },
});

// Tasks due too soon (within next 7 days)
export const getTasksDueSoon = query({
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const tasks = ctx.db.query("tasks").collect();

    return (await tasks).filter((task) => {
      task.dueDate &&
        task.dueDate >= now &&
        task.dueDate <= sevenDaysFromNow &&
        task.status !== "completed" &&
        task.status !== "cancelled";
    });
  },
});
