# GiveawayConnect Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Gaming/Community Platform Inspiration

Drawing from: Dribbble contests, Behance community features, and modern SaaS dashboards (Linear, Notion) combined with the trust-building elements of donation platforms (GoFundMe, Patreon).

**Core Principle:** Create an exciting, trustworthy platform that balances the thrill of giveaways with the professionalism needed for donations.

---

## Color Palette

### Primary Colors
- **Primary Brand:** 262 80% 50% (Vibrant Purple-Blue) - excitement, community, trust
- **Primary Dark:** 262 75% 35% (Deeper variant for depth)

### Supporting Colors
- **Success/Active:** 142 76% 45% (Fresh Green) - completed tasks, wins
- **Warning:** 38 92% 50% (Warm Orange) - time-sensitive giveaways
- **Accent:** 333 85% 55% (Energetic Pink) - CTAs, highlights, new badges

### Neutrals
- **Dark Mode Background:** 240 10% 8% (Rich dark base)
- **Dark Mode Surface:** 240 8% 12% (Cards, elevated elements)
- **Dark Mode Border:** 240 6% 18% (Subtle divisions)
- **Text Primary:** 0 0% 98% (High contrast white)
- **Text Secondary:** 240 5% 65% (Muted text)

### Light Mode
- **Background:** 0 0% 98% (Soft white)
- **Surface:** 0 0% 100% (Pure white cards)
- **Border:** 240 6% 90% (Light gray borders)
- **Text Primary:** 240 10% 10% (Near black)
- **Text Secondary:** 240 5% 45% (Gray text)

---

## Typography

**Font Families:**
- **Display/Headings:** 'Inter' (700-800 weight) - modern, clean, professional
- **Body/UI:** 'Inter' (400-600 weight) - excellent readability
- **Monospace (stats/numbers):** 'JetBrains Mono' - leaderboards, points display

**Type Scale:**
- Hero Headlines: text-6xl md:text-7xl font-bold
- Section Headings: text-3xl md:text-4xl font-bold
- Card Titles: text-xl font-semibold
- Body: text-base leading-relaxed
- Small/Meta: text-sm text-secondary

---

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy:**
- Full-width sections: w-full
- Content containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Forms: max-w-md mx-auto

**Vertical Rhythm:**
- Section spacing: py-16 md:py-24
- Component spacing: space-y-8 or gap-8
- Card padding: p-6

---

## Component Library

### Hero Section (Homepage)
- Full-width gradient background (primary → accent subtle gradient)
- Large hero image showing community/prizes/celebration (right side, 50% width on desktop)
- Left-aligned headline + subheadline + dual CTAs
- Floating stats cards (active giveaways, total winners, points distributed)
- Height: min-h-[600px] to min-h-screen

### Giveaway Cards
- Elevated cards with hover lift effect (shadow-lg hover:shadow-2xl transition)
- Prize image at top (aspect-ratio-video, rounded-t-xl)
- Badge overlay (top-right): "LIVE" (success), "ENDING SOON" (warning), "ENDED" (neutral)
- Card body: Title, description (2-line clamp), entry count, end date
- Progress bar showing entries/participation
- Footer: Points required, "Join Now" CTA button

### Task Lists
- Checklist design with completion states
- Icon (left) + Task description + Points value (right)
- Completed tasks: muted with checkmark, green accent border
- Pending tasks: vibrant, call-to-action styling
- Interactive: click to complete (with loading state)

### Leaderboards
- Table layout with alternating row backgrounds
- Rank badges (1st gold, 2nd silver, 3rd bronze styled chips)
- Avatar + username + stats columns
- "You" row highlighted with accent background
- Sticky header on scroll

### Donation Flow
- Multi-step form with progress indicator
- Amount selection: preset chips (₹100, ₹500, ₹1000, custom)
- Donor recognition toggle (anonymous option)
- PayUMoney branding integration
- Success state: celebration animation + receipt display

### Admin Dashboard
- Sidebar navigation (fixed left, icons + labels)
- Data-rich KPI cards (grid layout, 4 columns)
- Charts: Use Chart.js with brand color scheme
- Tables: Sortable, filterable, with action buttons
- Settings: Grouped sections with collapsible panels

### Navigation
- Sticky top navbar: Logo left, nav center, user/admin right
- Mobile: Hamburger menu with slide-in drawer
- User dropdown: Profile, dashboard, logout
- Active state: Accent underline or background highlight

### Forms & Inputs
- Floating labels or top-aligned labels
- Input fields: Consistent height (h-12), rounded-lg borders
- Focus states: Accent color ring
- Error states: Red border + error message below
- Dark mode: Proper contrast on input backgrounds (use surface color)

### Buttons
- Primary: Accent color background, white text, rounded-lg, shadow
- Secondary: Outline variant with accent border
- Ghost: Transparent with hover background
- Sizes: sm (h-9 px-4), md (h-12 px-6), lg (h-14 px-8)
- Icons: Left or right aligned with appropriate spacing

### Modals/Overlays
- Backdrop: Semi-transparent dark overlay (bg-black/60)
- Content: Centered card with rounded-xl, max-w-lg
- Close button: Top-right, ghost style
- Actions: Right-aligned button group at bottom

---

## Animations

**Use Sparingly:**
- Giveaway card hover: Subtle lift (translateY(-2px) with shadow change)
- Task completion: Checkmark spring animation
- Winner announcement: Confetti burst (use canvas-confetti library)
- Page transitions: Fade in content on route change
- Loading states: Skeleton screens (not spinners) with shimmer effect

---

## Images

**Hero Image:** 
Vibrant, high-energy photo showing diverse people celebrating, opening gifts, or community gathering. Optimistic and inclusive mood. Aspect ratio 16:9, positioned on right side (50% width desktop, full-width mobile stacked below headline).

**Giveaway Prize Images:**
Product shots or prize visuals, crisp and well-lit. Consistent aspect ratio across all cards (16:9 or 4:3). Use placeholder with gradient + icon when no image provided.

**User Avatars:**
Circular, consistent sizing. Fallback: Gradient background with initials.

**Success/Empty States:**
Illustrated graphics (use services like unDraw or create simple SVG illustrations) for empty giveaways, successful donations, profile completion prompts.

---

## Key Patterns

- **Trust Indicators:** Display verified badges, donor count, total distributed, testimonials
- **Scarcity/Urgency:** Countdown timers, "X entries left," "Ending in Y hours"
- **Social Proof:** Recent winners carousel, donor leaderboard prominence, testimonial quotes
- **Gamification:** Progress bars, point displays, achievement badges, level-up notifications
- **Transparency:** Clear odds display, fairness formula explanation, winner selection process
- **Mobile-First:** All interactions touch-friendly (min-h-12 for tap targets), responsive grids collapse gracefully