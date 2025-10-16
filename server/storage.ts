import {
  type User,
  type InsertUser,
  type Giveaway,
  type InsertGiveaway,
  type Task,
  type InsertTask,
  type GiveawayEntry,
  type InsertGiveawayEntry,
  type TaskCompletion,
  type InsertTaskCompletion,
  type Referral,
  type InsertReferral,
  type Donation,
  type InsertDonation,
  type Settings,
  type InsertSettings,
  type GiveawayWithTasks,
  type UserStats,
  type LeaderboardEntry,
  type DonorLeaderboardEntry,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { firebaseUid: string; email: string; displayName: string; isAdmin?: boolean }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Giveaways
  getGiveaway(id: string): Promise<Giveaway | undefined>;
  getGiveawayWithTasks(id: string, userId?: string): Promise<GiveawayWithTasks | undefined>;
  getAllGiveaways(status?: string): Promise<Giveaway[]>;
  getFeaturedGiveaways(): Promise<Giveaway[]>;
  createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway>;
  updateGiveaway(id: string, updates: Partial<Giveaway>): Promise<Giveaway | undefined>;
  deleteGiveaway(id: string): Promise<void>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByGiveaway(giveawayId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Giveaway Entries
  getGiveawayEntry(userId: string, giveawayId: string): Promise<GiveawayEntry | undefined>;
  getUserGiveawayEntries(userId: string): Promise<GiveawayEntry[]>;
  getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]>;
  createGiveawayEntry(entry: InsertGiveawayEntry): Promise<GiveawayEntry>;
  updateGiveawayEntry(id: string, updates: Partial<GiveawayEntry>): Promise<GiveawayEntry | undefined>;

  // Task Completions
  getTaskCompletion(userId: string, taskId: string): Promise<TaskCompletion | undefined>;
  getUserTaskCompletions(userId: string, giveawayId: string): Promise<TaskCompletion[]>;
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;

  // Referrals
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;

  // Donations
  getDonation(id: string): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  getUserDonations(userId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;

  // Stats & Leaderboards
  getUserStats(userId: string): Promise<UserStats>;
  getGiveawayLeaderboard(giveawayId: string): Promise<LeaderboardEntry[]>;
  getDonorLeaderboard(period: 'monthly' | 'all-time'): Promise<DonorLeaderboardEntry[]>;
  getWinners(): Promise<Array<{ giveaway: Giveaway; winner: User }>>;
  getPlatformStats(): Promise<{
    activeGiveaways: number;
    totalWinners: number;
    pointsDistributed: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private giveaways: Map<string, Giveaway>;
  private tasks: Map<string, Task>;
  private giveawayEntries: Map<string, GiveawayEntry>;
  private taskCompletions: Map<string, TaskCompletion>;
  private referrals: Map<string, Referral>;
  private donations: Map<string, Donation>;
  private settings: Settings | undefined;

  constructor() {
    this.users = new Map();
    this.giveaways = new Map();
    this.tasks = new Map();
    this.giveawayEntries = new Map();
    this.taskCompletions = new Map();
    this.referrals = new Map();
    this.donations = new Map();
    
    // Initialize default settings
    this.settings = {
      id: "settings",
      allowedDomains: [],
      fairnessConfig: {
        base: 1,
        P: 50,
        alpha: 1,
        beta: 2,
        Rcap: 20,
        Tmax: 500,
        ratioCap: 5,
        epsilon: 0.0001,
      },
      smtpConfig: undefined,
      payuConfig: undefined,
      siteConfig: {
        siteName: "GiveawayConnect",
        siteDescription: "Community Giveaway & Donation Platform",
        heroTitle: "Win Amazing Prizes, Support the Community",
        heroSubtitle: "Join exciting giveaways, complete tasks to earn points, refer friends, and increase your chances of winning.",
        featuredGiveawayIds: [],
      },
      updatedAt: new Date(),
    };
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.firebaseUid === firebaseUid);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser & { firebaseUid: string; email: string; displayName: string; isAdmin?: boolean }): Promise<User> {
    const id = randomUUID();
    const referralCode = randomUUID().substring(0, 8).toUpperCase();
    const user: User = {
      ...insertUser,
      id,
      referralCode,
      points: 0,
      referredBy: insertUser.referredBy || null,
      isAnonymous: insertUser.isAnonymous ?? false,
      isAdmin: insertUser.isAdmin ?? false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Giveaways
  async getGiveaway(id: string): Promise<Giveaway | undefined> {
    return this.giveaways.get(id);
  }

  async getGiveawayWithTasks(id: string, userId?: string): Promise<GiveawayWithTasks | undefined> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) return undefined;

    const tasks = await this.getTasksByGiveaway(id);
    const userEntry = userId ? await this.getGiveawayEntry(userId, id) : undefined;
    const userCompletedTasks = userId ? (await this.getUserTaskCompletions(userId, id)).map((tc) => tc.taskId) : [];

    return {
      ...giveaway,
      tasks,
      userEntry,
      userCompletedTasks,
    };
  }

  async getAllGiveaways(status?: string): Promise<Giveaway[]> {
    const all = Array.from(this.giveaways.values());
    if (status && status !== "all") {
      return all.filter((g) => g.status === status);
    }
    return all;
  }

  async getFeaturedGiveaways(): Promise<Giveaway[]> {
    const featured = this.settings?.siteConfig?.featuredGiveawayIds || [];
    if (featured.length === 0) {
      return Array.from(this.giveaways.values())
        .filter((g) => g.status === "active")
        .slice(0, 3);
    }
    return featured
      .map((id) => this.giveaways.get(id))
      .filter((g): g is Giveaway => g !== undefined);
  }

  async createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway> {
    const id = randomUUID();
    const newGiveaway: Giveaway = {
      ...giveaway,
      id,
      entryCount: 0,
      winnerId: null,
      createdAt: new Date(),
    };
    this.giveaways.set(id, newGiveaway);
    return newGiveaway;
  }

  async updateGiveaway(id: string, updates: Partial<Giveaway>): Promise<Giveaway | undefined> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) return undefined;
    const updated = { ...giveaway, ...updates };
    this.giveaways.set(id, updated);
    return updated;
  }

  async deleteGiveaway(id: string): Promise<void> {
    this.giveaways.delete(id);
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByGiveaway(giveawayId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((t) => t.giveawayId === giveawayId)
      .sort((a, b) => a.order - b.order);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  // Giveaway Entries
  async getGiveawayEntry(userId: string, giveawayId: string): Promise<GiveawayEntry | undefined> {
    return Array.from(this.giveawayEntries.values()).find(
      (e) => e.userId === userId && e.giveawayId === giveawayId
    );
  }

  async getUserGiveawayEntries(userId: string): Promise<GiveawayEntry[]> {
    return Array.from(this.giveawayEntries.values()).filter((e) => e.userId === userId);
  }

  async getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]> {
    return Array.from(this.giveawayEntries.values()).filter((e) => e.giveawayId === giveawayId);
  }

  async createGiveawayEntry(entry: InsertGiveawayEntry): Promise<GiveawayEntry> {
    const id = randomUUID();
    const newEntry: GiveawayEntry = {
      ...entry,
      id,
      tickets: 1,
      probability: "0",
      joinedAt: new Date(),
    };
    this.giveawayEntries.set(id, newEntry);
    return newEntry;
  }

  async updateGiveawayEntry(id: string, updates: Partial<GiveawayEntry>): Promise<GiveawayEntry | undefined> {
    const entry = this.giveawayEntries.get(id);
    if (!entry) return undefined;
    const updated = { ...entry, ...updates };
    this.giveawayEntries.set(id, updated);
    return updated;
  }

  // Task Completions
  async getTaskCompletion(userId: string, taskId: string): Promise<TaskCompletion | undefined> {
    return Array.from(this.taskCompletions.values()).find(
      (tc) => tc.userId === userId && tc.taskId === taskId
    );
  }

  async getUserTaskCompletions(userId: string, giveawayId: string): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values()).filter(
      (tc) => tc.userId === userId && tc.giveawayId === giveawayId
    );
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const id = randomUUID();
    const newCompletion: TaskCompletion = {
      ...completion,
      id,
      completedAt: new Date(),
    };
    this.taskCompletions.set(id, newCompletion);
    return newCompletion;
  }

  // Referrals
  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter((r) => r.referrerId === referrerId);
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = randomUUID();
    const newReferral: Referral = {
      ...referral,
      id,
      createdAt: new Date(),
    };
    this.referrals.set(id, newReferral);
    return newReferral;
  }

  // Donations
  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getUserDonations(userId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter((d) => d.userId === userId);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const newDonation: Donation = {
      ...donation,
      id,
      createdAt: new Date(),
    };
    this.donations.set(id, newDonation);
    return newDonation;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;
    const updated = { ...donation, ...updates };
    this.donations.set(id, updated);
    return updated;
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    this.settings = {
      ...this.settings!,
      ...updates,
      updatedAt: new Date(),
    };
    return this.settings;
  }

  // Stats & Leaderboards
  async getUserStats(userId: string): Promise<UserStats> {
    const entries = await this.getUserGiveawayEntries(userId);
    const activeGiveaways = entries.filter((e) => {
      const giveaway = this.giveaways.get(e.giveawayId);
      return giveaway?.status === "active";
    }).length;

    const referrals = await this.getReferralsByReferrer(userId);
    const donations = await this.getUserDonations(userId);
    const totalDonations = donations
      .filter((d) => d.paymentStatus === "success")
      .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);

    const user = this.users.get(userId);

    return {
      totalPoints: user?.points || 0,
      totalReferrals: referrals.length,
      totalDonations,
      activeGiveaways,
    };
  }

  async getGiveawayLeaderboard(giveawayId: string): Promise<LeaderboardEntry[]> {
    const entries = await this.getGiveawayEntries(giveawayId);
    
    return entries
      .map((entry) => {
        const user = this.users.get(entry.userId);
        if (!user) return null;

        return {
          userId: user.id,
          displayName: user.displayName,
          photoURL: user.photoURL || undefined,
          isAnonymous: user.isAnonymous,
          tickets: entry.tickets,
          probability: parseFloat(entry.probability || "0"),
        };
      })
      .filter((e): e is LeaderboardEntry => e !== null)
      .sort((a, b) => b.tickets - a.tickets);
  }

  async getDonorLeaderboard(period: 'monthly' | 'all-time'): Promise<DonorLeaderboardEntry[]> {
    let donations = Array.from(this.donations.values()).filter((d) => d.paymentStatus === "success");

    if (period === "monthly") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      donations = donations.filter((d) => new Date(d.createdAt) >= monthStart);
    }

    const donorMap = new Map<string, { total: number; count: number; donation: Donation }>();
    
    donations.forEach((d) => {
      const key = d.userId || d.donorEmail;
      const existing = donorMap.get(key) || { total: 0, count: 0, donation: d };
      donorMap.set(key, {
        total: existing.total + parseFloat(d.amount.toString()),
        count: existing.count + 1,
        donation: d,
      });
    });

    return Array.from(donorMap.entries())
      .map(([key, data]) => {
        const user = data.donation.userId ? this.users.get(data.donation.userId) : null;
        
        return {
          userId: data.donation.userId || key,
          displayName: user ? user.displayName : data.donation.donorName,
          photoURL: user?.photoURL || undefined,
          isAnonymous: data.donation.isAnonymous,
          totalAmount: data.total,
          donationCount: data.count,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getWinners(): Promise<Array<{ giveaway: Giveaway; winner: User }>> {
    return Array.from(this.giveaways.values())
      .filter((g) => g.winnerId)
      .map((g) => {
        const winner = this.users.get(g.winnerId!);
        if (!winner) return null;
        return { giveaway: g, winner };
      })
      .filter((w): w is { giveaway: Giveaway; winner: User } => w !== null);
  }

  async getPlatformStats(): Promise<{
    activeGiveaways: number;
    totalWinners: number;
    pointsDistributed: number;
  }> {
    const activeGiveaways = Array.from(this.giveaways.values()).filter((g) => g.status === "active").length;
    const totalWinners = Array.from(this.giveaways.values()).filter((g) => g.winnerId).length;
    const pointsDistributed = Array.from(this.users.values()).reduce((sum, u) => sum + u.points, 0);

    return {
      activeGiveaways,
      totalWinners,
      pointsDistributed,
    };
  }
}

export const storage = new MemStorage();
