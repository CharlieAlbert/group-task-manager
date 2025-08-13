import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    timezone: v.optional(v.string()),
    notifications: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),

    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),

    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),

    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_assignee", ["assignedTo"])
    .index("by_creator", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .index("by_priority", ["priority"]),

  groups: defineTable({
    name: v.string(),
    description: v.string(),
    createdBy: v.id("users"),
    members: v.array(v.id("users")),
    isPrivate: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"]),

    groupTasks: defineTable({
        groupId: v.id("groups"),
        taskId: v.id("tasks"),
        createAt: v.number()
    })
    .index("by_group", ["groupId"])
    .index("by_task", ["taskId"])
    .index("by_group_and_task", ["groupId", "taskId"])
});
