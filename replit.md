# GiveawayConnect - Community Giveaway & Donation Platform

A professional, user-friendly platform for hosting online giveaways, community participation, and donations. Built with **React + TypeScript + Firebase + Express + TailwindCSS**.

## 🎨 Design System

**Color Palette:**
- Primary: Purple-Blue Gradient (#8B5CF6 to #3B82F6)
- Success/Active: Emerald Green (#10B981)
- Warning/Urgent: Amber (#F59E0B)
- Accent: Energetic Pink (#EC4899)
- Typography: Inter (headings/body), JetBrains Mono (stats/numbers)

**Visual Style:**
- Modern card-based design with gradients
- Smooth animations and hover effects
- Mobile-first responsive layout
- Dark/Light mode support
- Professional spacing and typography hierarchy

## 📋 Features

### User Features
- ✅ **Multiple Authentication Options:**
  - Email/Password registration and login
  - Google Sign-In with Firebase Authentication
  - Guest/Anonymous access for browsing and participation
- ✅ Browse and join active giveaways
- ✅ Complete tasks to earn points (social media follows, shares, etc.)
- ✅ Refer friends with unique referral codes
- ✅ Weighted fairness winner selection algorithm
- ✅ Donate to support the community (PayUMoney integration ready)
- ✅ View leaderboards (winners & donors)
- ✅ User dashboard with stats and activity
- ✅ Privacy controls (anonymous mode)

### Admin Features
- ✅ Admin dashboard with platform KPIs
- ✅ Giveaway management (create, edit, delete)
- ✅ User management and statistics
- ✅ Donation tracking and monitoring
- ✅ Platform settings configuration
- ✅ Manual or automatic winner selection
- ✅ Domain restriction for signups

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Routing:** Wouter
- **State Management:** React Query (TanStack Query)
- **UI Components:** Shadcn UI + Radix UI
- **Styling:** TailwindCSS with custom design tokens
- **Authentication:** Firebase Auth with Email/Password, Google Sign-In, and Anonymous/Guest access
- **Theme:** Dark/Light mode with system preference

### Backend (Express + TypeScript)
- **Storage:** In-memory storage (MemStorage) - easily swappable with database
- **Authentication:** Firebase Admin SDK (mock middleware for development)
- **API Structure:** RESTful endpoints
- **Business Logic:** 
  - Points calculation
  - Referral tracking
  - Weighted fairness algorithm
  - Winner selection

### Data Models
- **Users:** Firebase UID, email, display name, points, referral code
- **Giveaways:** Title, description, prize, end date, status, entry count
- **Tasks:** Giveaway-specific tasks with points rewards
- **Entries:** User giveaway entries with tickets and probability
- **Donations:** Amount, payment status, anonymous option
- **Settings:** Platform configuration, fairness algorithm parameters

## 🎯 Fairness Algorithm

The winner selection uses a weighted probability system:

```
tickets = base + floor(points / P) × alpha + min(referrals, Rcap) × beta + beta × log2(1 + max(0, referrals - Rcap))
tickets = min(tickets, Tmax)
tickets = min(tickets, ratioCap × medianTickets) + epsilon
probability = tickets / totalTickets
```

**Default Parameters:**
- base: 1
- P (points divisor): 50
- alpha (points multiplier): 1
- beta (referral multiplier): 2
- Rcap (referral cap): 20
- Tmax (max tickets): 500
- ratioCap: 5
- epsilon: 0.0001

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Firebase project with authentication enabled:
  - Email/Password provider
  - Google Sign-In provider
  - Anonymous authentication (for guest access)
- Environment secrets configured

### Environment Variables
Required secrets (configured in Replit Secrets):
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- `VITE_FIREBASE_API_KEY` - Your Firebase API key

### Development Workflow

1. **Install Dependencies:** Already handled by Replit
2. **Configure Firebase:** Add your Firebase credentials to Replit Secrets
3. **Run Development Server:** `npm run dev` (runs both frontend and backend)
4. **Access Application:** Open the Webview

### Project Structure

```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities (Firebase, Auth, Theme)
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML template
├── server/                # Backend Express app
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage interface
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # TypeScript types and Drizzle schemas
└── design_guidelines.md   # Design system documentation
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase redirects to Google OAuth
3. Google redirects back to app with credentials
4. Frontend gets Firebase ID token
5. Backend verifies token (currently mock)
6. User data fetched/created in storage
7. Auth context provides user state to app

## 🎨 Key Components

### Public Pages
- **Home:** Hero section, featured giveaways, how it works
- **Giveaways:** Browse all giveaways with filters
- **Giveaway Detail:** Join, view tasks, leaderboard
- **Winners:** Hall of fame for winners
- **Support:** Donation form and donor leaderboard

### User Pages
- **Dashboard:** Stats, active giveaways, referral tracking
- **Profile:** Privacy settings, referral code

### Admin Pages
- **Dashboard:** Platform KPIs and quick actions
- **Giveaways:** Manage all giveaways, select winners
- **Users:** View and manage users
- **Donations:** Track donations and amounts
- **Settings:** Configure domain restrictions, fairness algorithm

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/user` - Get or create current user

### Giveaways
- `GET /api/giveaways/featured` - Get featured giveaways
- `GET /api/giveaways` - List all giveaways (optional ?status filter)
- `GET /api/giveaways/:id` - Get giveaway details with tasks
- `POST /api/giveaways/:id/join` - Join a giveaway
- `GET /api/giveaways/:id/leaderboard` - Get giveaway leaderboard

### Tasks
- `POST /api/tasks/:id/complete` - Complete a task and earn points

### User
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/giveaways` - Get user's joined giveaways
- `GET /api/user/donations` - Get user's donations
- `GET /api/user/referrals/count` - Get referral count
- `PATCH /api/user/profile` - Update user profile

### Donations
- `POST /api/donations` - Create a donation
- `GET /api/donations/leaderboard/:period` - Get donor leaderboard (monthly/all-time)

### Public
- `GET /api/winners` - Get all winners
- `GET /api/stats` - Get platform statistics

### Admin (requires admin role)
- `GET /api/admin/stats` - Get admin dashboard stats
- `GET /api/admin/giveaways` - List all giveaways
- `DELETE /api/admin/giveaways/:id` - Delete a giveaway
- `POST /api/admin/giveaways/:id/select-winner` - Select winner for ended giveaway
- `GET /api/admin/users` - List all users
- `GET /api/admin/donations` - List all donations with user data
- `GET /api/admin/settings` - Get platform settings
- `PATCH /api/admin/settings` - Update platform settings

## 🎯 User Journeys

### Primary User Flow
1. Sign in with Google
2. Browse giveaways
3. Join a giveaway
4. Complete tasks to earn points
5. Refer friends for bonus points
6. View leaderboard to check chances
7. Get notified if you win

### Donation Flow
1. Navigate to Support page
2. Select donation amount
3. Add optional message
4. Choose anonymous or public
5. Process payment (PayUMoney)
6. View on donor leaderboard

### Admin Flow
1. Sign in as admin
2. View dashboard KPIs
3. Create new giveaway
4. Add tasks to giveaway
5. Monitor entries and engagement
6. Select winner (manual or auto)
7. Configure platform settings

## 🔒 Security Notes

**⚠️ CRITICAL: Current Implementation (Development/Demo)**
- **Authentication:** Firebase JWT tokens are decoded and validated for structure, but signature verification should be added for production
- **Storage:** In-memory only (data lost on restart) - PostgreSQL schema ready via Drizzle ORM
- **Admin Access:** Automatic for first user or specific email patterns
- **Guest Access:** Anonymous users can participate in giveaways and send tips

**🚨 REQUIRED for Production:**
1. **Firebase Admin SDK (Recommended):** For enhanced security, implement server-side token verification
   ```typescript
   import * as admin from 'firebase-admin';
   const decodedToken = await admin.auth().verifyIdToken(token);
   ```
   Or use a JWT verification library compatible with Firebase tokens

2. **Database Migration:** Switch from in-memory to PostgreSQL (schema already defined in `shared/schema.ts`)
   ```bash
   npm run db:push  # Push schema to database
   ```

3. **Security Hardening:**
   - Add rate limiting and request validation
   - Implement proper admin user management (not automatic)
   - Add HTTPS enforcement
   - Set up CORS properly
   - Enable Firebase App Check for production

4. **Payment Integration:** Complete PayUMoney setup with proper webhook verification

5. **Email Service:** Configure SMTP for winner notifications

6. **Monitoring:** Add logging, audit trails, and error tracking

**Current State:** Fully functional for development and testing. Authentication flows work correctly (email/password, Google, guest access). For production, implement token signature verification for enhanced security.

## 🚀 Deployment

The app is ready to be published on Replit. The frontend and backend run on the same server, with the frontend served from the Vite build.

### Pre-Deployment Checklist
- [ ] Configure Firebase production credentials
- [ ] Add production domain to Firebase authorized domains
- [ ] Set up PayUMoney merchant account
- [ ] Configure SMTP for email notifications
- [ ] Review and update fairness algorithm parameters
- [ ] Set up database for data persistence
- [ ] Configure admin users

### Admin Access (MVP)
For the MVP, admin access is granted to:
- The first user to sign in (automatically becomes admin)
- Any user with 'admin' in their email address
- Any user with @giveawayconnect.com email domain

In production, implement proper admin management through database flags.

## 📝 Future Enhancements

- Real-time chat for each giveaway
- Email notifications for winners
- Advanced analytics dashboard
- Social media integration (auto-post winners)
- Scheduled giveaway creation
- Recurring donation support
- Mobile app (React Native)

## 🙏 Credits

Built with love for the community. Special thanks to all contributors and supporters who make this platform possible.

---

**Stack:** React, TypeScript, Express, Firebase, TailwindCSS, Shadcn UI, Radix UI, TanStack Query
**Design:** Inter & JetBrains Mono fonts, Purple-Blue gradient theme with emerald accents
