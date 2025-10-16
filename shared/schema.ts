import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  points: integer("points").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  role: integer("role").notNull().default(0), // 0 = user, 1 = admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Giveaways table
export const giveaways = pgTable("giveaways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prizeImage: text("prize_image"),
  prizeDescription: text("prize_description").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // active, ended, cancelled
  maxEntries: integer("max_entries"),
  entryCount: integer("entry_count").notNull().default(0),
  winnerId: text("winner_id"),
  winnerSelectionMethod: text("winner_selection_method").notNull().default("auto"), // auto, manual
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  giveawayId: text("giveaway_id").notNull().references(() => giveaways.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // follow_twitter, follow_instagram, share, youtube_subscribe, custom
  points: integer("points").notNull(),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User giveaway entries (join table)
export const giveawayEntries = pgTable("giveaway_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  giveawayId: text("giveaway_id").notNull().references(() => giveaways.id),
  tickets: integer("tickets").notNull().default(1),
  probability: decimal("probability", { precision: 10, scale: 6 }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Task completions
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  taskId: text("task_id").notNull().references(() => tasks.id),
  giveawayId: text("giveaway_id").notNull().references(() => giveaways.id),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: text("referrer_id").notNull().references(() => users.id),
  referredUserId: text("referred_user_id").notNull().references(() => users.id),
  pointsAwarded: integer("points_awarded").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Donations
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id),
  donorEmail: text("donor_email").notNull(),
  donorName: text("donor_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  paymentId: text("payment_id").notNull(),
  paymentStatus: text("payment_status").notNull(), // success, failed, pending
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Settings (single row configuration)
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default("settings"),
  allowedDomains: text("allowed_domains").array(),
  fairnessConfig: jsonb("fairness_config").$type<{
    base: number;
    P: number;
    alpha: number;
    beta: number;
    Rcap: number;
    Tmax: number;
    ratioCap: number;
    epsilon: number;
  }>(),
  smtpConfig: jsonb("smtp_config").$type<{
    host: string;
    port: number;
    user: string;
    fromName: string;
    fromEmail: string;
  }>(),
  firebaseConfig: jsonb("firebase_config").$type<{
    apiKey: string;
    projectId: string;
    appId: string;
  }>(),
  payuConfig: jsonb("payu_config").$type<{
    merchantId: string;
    merchantKey: string;
    merchantSalt: string;
    environment: string;
  }>(),
  siteConfig: jsonb("site_config").$type<{
    siteName: string;
    siteDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    featuredGiveawayIds: string[];
  }>(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  points: true,
  referralCode: true,
});

export const insertGiveawaySchema = createInsertSchema(giveaways).omit({
  id: true,
  createdAt: true,
  entryCount: true,
  winnerId: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertGiveawayEntrySchema = createInsertSchema(giveawayEntries).omit({
  id: true,
  joinedAt: true,
  tickets: true,
  probability: true,
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 1;
  }, { message: "Minimum donation amount is 1 INR" }),
  donorEmail: z.string().email("Please provide a valid Gmail address"),
  donorName: z.string().min(1, "Name is required"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGiveaway = z.infer<typeof insertGiveawaySchema>;
export type Giveaway = typeof giveaways.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertGiveawayEntry = z.infer<typeof insertGiveawayEntrySchema>;
export type GiveawayEntry = typeof giveawayEntries.$inferSelect;

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Extended types with relations
export type GiveawayWithTasks = Giveaway & {
  tasks: Task[];
  userEntry?: GiveawayEntry;
  userCompletedTasks?: string[]; // task IDs
};

export type UserStats = {
  totalPoints: number;
  totalReferrals: number;
  totalDonations: number;
  activeGiveaways: number;
};

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  tickets: number;
  probability: number;
};

export type DonorLeaderboardEntry = {
  userId: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  totalAmount: number;
  donationCount: number;
};
