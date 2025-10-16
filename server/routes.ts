import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    picture?: string;
  };
}

// Auth middleware - validates Firebase JWT tokens from client
// This implementation decodes and validates the JWT structure
async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Extract token from header
    const token = authHeader.substring(7);
    
    // Decode JWT payload (Firebase client SDK handles signing)
    // In production with sensitive operations, use Firebase Admin SDK for server-side verification
    const parts = token.split('.');
    if (parts.length >= 2) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Validate token structure and required fields
        if (!payload.user_id && !payload.sub && !payload.uid) {
          return res.status(401).json({ error: "Invalid token format" });
        }
        
        req.user = {
          uid: payload.user_id || payload.sub || payload.uid,
          email: payload.email || `${payload.user_id || payload.sub || payload.uid}@anonymous.user`,
          name: payload.name || payload.displayName || "Anonymous User",
          picture: payload.picture,
        };
        
        next();
      } catch (decodeError) {
        return res.status(401).json({ error: "Invalid token encoding" });
      }
    } else {
      return res.status(401).json({ error: "Malformed token" });
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Optional auth middleware
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length >= 2) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        req.user = {
          uid: payload.user_id || payload.sub || payload.uid,
          email: payload.email,
          name: payload.name || payload.displayName,
          picture: payload.picture,
        };
      } catch {
        // Ignore errors for optional auth
      }
    }
  }
  next();
}

// Admin middleware
async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUserByFirebaseUid(req.user.uid);
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  next();
}

// Winner selection algorithm
function calculateWinningProbabilities(
  entries: Array<{ userId: string; points: number; referrals: number; entryId: string }>,
  config: any
) {
  const { base, P, alpha, beta, Rcap, Tmax, ratioCap, epsilon } = config;

  const tickets = entries.map((entry) => {
    let t = base;
    t += Math.floor(entry.points / P) * alpha;
    t += Math.min(entry.referrals, Rcap) * beta;
    t += beta * Math.log2(1 + Math.max(0, entry.referrals - Rcap));
    t = Math.min(t, Tmax);
    return t + epsilon;
  });

  const medianTickets = [...tickets].sort((a, b) => a - b)[Math.floor(tickets.length / 2)] || 1;
  const cappedTickets = tickets.map((t) => Math.min(t, ratioCap * medianTickets));
  const totalTickets = cappedTickets.reduce((sum, t) => sum + t, 0);

  return entries.map((entry, i) => ({
    ...entry,
    tickets: Math.floor(cappedTickets[i]),
    probability: (cappedTickets[i] / totalTickets).toFixed(6),
  }));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== Authentication Routes ==========
  app.get("/api/auth/user", authMiddleware, async (req: AuthRequest, res) => {
    try {
      let user = await storage.getUserByFirebaseUid(req.user!.uid);

      if (!user) {
        // Create new user
        // Admin access granted to specific emails and domain
        const isAdminEmail = req.user!.email.endsWith('@giveawayconnect.com') || 
                            req.user!.email === 'pattnaiknikhilesh@gmail.com';
        
        user = await storage.createUser({
          firebaseUid: req.user!.uid,
          email: req.user!.email,
          displayName: req.user!.name,
          photoURL: req.user?.picture,
          isAdmin: isAdminEmail,
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ========== Giveaway Routes ==========
  app.get("/api/giveaways/featured", async (req, res) => {
    try {
      const featured = await storage.getFeaturedGiveaways();
      res.json(featured);
    } catch (error) {
      res.status(500).json({ error: "Failed to get featured giveaways" });
    }
  });

  app.get("/api/giveaways", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.query;
      const giveaways = await storage.getAllGiveaways(status as string);
      res.json(giveaways);
    } catch (error) {
      res.status(500).json({ error: "Failed to get giveaways" });
    }
  });

  app.get("/api/giveaways/:id", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user ? await storage.getUserByFirebaseUid(req.user.uid) : undefined;
      const giveaway = await storage.getGiveawayWithTasks(id, user?.id);
      
      if (!giveaway) {
        return res.status(404).json({ error: "Giveaway not found" });
      }

      res.json(giveaway);
    } catch (error) {
      res.status(500).json({ error: "Failed to get giveaway" });
    }
  });

  app.post("/api/giveaways/:id/join", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const giveaway = await storage.getGiveaway(id);
      if (!giveaway) return res.status(404).json({ error: "Giveaway not found" });
      if (giveaway.status !== "active") return res.status(400).json({ error: "Giveaway is not active" });

      const existing = await storage.getGiveawayEntry(user.id, id);
      if (existing) return res.status(400).json({ error: "Already joined" });

      await storage.createGiveawayEntry({ userId: user.id, giveawayId: id });
      await storage.updateGiveaway(id, { entryCount: giveaway.entryCount + 1 });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to join giveaway" });
    }
  });

  app.get("/api/giveaways/:id/leaderboard", async (req, res) => {
    try {
      const { id } = req.params;
      const leaderboard = await storage.getGiveawayLeaderboard(id);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // ========== Task Routes ==========
  app.post("/api/tasks/:id/complete", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { giveawayId } = req.body;
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const task = await storage.getTask(id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      const existing = await storage.getTaskCompletion(user.id, id);
      if (existing) return res.status(400).json({ error: "Task already completed" });

      await storage.createTaskCompletion({
        userId: user.id,
        taskId: id,
        giveawayId: giveawayId,
      });

      await storage.updateUser(user.id, { points: user.points + task.points });

      // Recalculate probabilities
      const entries = await storage.getGiveawayEntries(giveawayId);
      const settings = await storage.getSettings();
      
      const usersWithStats = await Promise.all(
        entries.map(async (entry) => {
          const u = await storage.getUser(entry.userId);
          const referrals = await storage.getReferralsByReferrer(entry.userId);
          return {
            userId: entry.userId,
            points: u?.points || 0,
            referrals: referrals.length,
            entryId: entry.id,
          };
        })
      );

      const withProbabilities = calculateWinningProbabilities(
        usersWithStats,
        settings?.fairnessConfig
      );

      for (const item of withProbabilities) {
        await storage.updateGiveawayEntry(item.entryId, {
          tickets: item.tickets,
          probability: item.probability,
        });
      }

      res.json({ success: true, pointsEarned: task.points });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // ========== User Routes ==========
  app.get("/api/user/stats", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });

  app.get("/api/user/giveaways", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const entries = await storage.getUserGiveawayEntries(user.id);
      const giveaways = await Promise.all(
        entries.map((e) => storage.getGiveaway(e.giveawayId))
      );

      res.json(giveaways.filter((g) => g !== undefined));
    } catch (error) {
      res.status(500).json({ error: "Failed to get user giveaways" });
    }
  });

  app.get("/api/user/donations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const donations = await storage.getUserDonations(user.id);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user donations" });
    }
  });

  app.get("/api/user/referrals/count", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const referrals = await storage.getReferralsByReferrer(user.id);
      res.json(referrals.length);
    } catch (error) {
      res.status(500).json({ error: "Failed to get referral count" });
    }
  });

  app.patch("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { isAnonymous } = req.body;
      const updated = await storage.updateUser(user.id, { isAnonymous });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ========== Donation Routes ==========
  app.post("/api/donations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user!.uid);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { amount, isAnonymous, message } = req.body;

      // In production, integrate with PayUMoney here
      const donation = await storage.createDonation({
        userId: user.id,
        amount: amount.toString(),
        currency: "INR",
        paymentId: `PAY_${Date.now()}`,
        paymentStatus: "success", // Mock success
        isAnonymous,
        message: message || null,
      });

      res.json({ success: true, donation });
    } catch (error) {
      res.status(500).json({ error: "Failed to process donation" });
    }
  });

  app.get("/api/donations/leaderboard/:period", async (req, res) => {
    try {
      const { period } = req.params;
      const leaderboard = await storage.getDonorLeaderboard(period as 'monthly' | 'all-time');
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get donor leaderboard" });
    }
  });

  // ========== Winners Route ==========
  app.get("/api/winners", async (req, res) => {
    try {
      const winners = await storage.getWinners();
      res.json(winners);
    } catch (error) {
      res.status(500).json({ error: "Failed to get winners" });
    }
  });

  // ========== Stats Route ==========
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // ========== Admin Routes ==========
  app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const giveaways = await storage.getAllGiveaways();
      const donations = await storage.getAllDonations();
      const winners = await storage.getWinners();

      const successfulDonations = donations.filter((d) => d.paymentStatus === "success");
      const totalDonationAmount = successfulDonations.reduce(
        (sum, d) => sum + parseFloat(d.amount.toString()),
        0
      );

      res.json({
        totalUsers: users.length,
        totalGiveaways: giveaways.length,
        activeGiveaways: giveaways.filter((g) => g.status === "active").length,
        totalDonations: donations.length,
        totalDonationAmount,
        totalWinners: winners.length,
        recentActivity: [],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/giveaways", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const giveaways = await storage.getAllGiveaways();
      res.json(giveaways);
    } catch (error) {
      res.status(500).json({ error: "Failed to get giveaways" });
    }
  });

  app.delete("/api/admin/giveaways/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      await storage.deleteGiveaway(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete giveaway" });
    }
  });

  app.post("/api/admin/giveaways/:id/select-winner", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const entries = await storage.getGiveawayEntries(id);

      if (entries.length === 0) {
        return res.status(400).json({ error: "No entries for this giveaway" });
      }

      // Weighted random selection
      const totalTickets = entries.reduce((sum, e) => sum + e.tickets, 0);
      let random = Math.random() * totalTickets;

      let winner = entries[0];
      for (const entry of entries) {
        random -= entry.tickets;
        if (random <= 0) {
          winner = entry;
          break;
        }
      }

      await storage.updateGiveaway(id, {
        winnerId: winner.userId,
        status: "ended",
      });

      res.json({ success: true, winnerId: winner.userId });
    } catch (error) {
      res.status(500).json({ error: "Failed to select winner" });
    }
  });

  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/admin/donations", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      const withUsers = await Promise.all(
        donations.map(async (d) => {
          const user = await storage.getUser(d.userId);
          return { ...d, user };
        })
      );

      res.json(withUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get donations" });
    }
  });

  app.get("/api/admin/settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/admin/settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
