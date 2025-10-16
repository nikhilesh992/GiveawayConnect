import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth-context";
import { ThemeProvider } from "./lib/theme-provider";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "./pages/home";
import Giveaways from "./pages/giveaways";
import GiveawayDetail from "./pages/giveaway-detail";
import Winners from "./pages/winners";
import Support from "./pages/support";
import Login from "./pages/login";

// User pages
import UserDashboard from "./pages/user-dashboard";
import UserProfile from "./pages/user-profile";

// Admin pages
import AdminDashboard from "./pages/admin-dashboard";
import AdminGiveaways from "./pages/admin-giveaways";
import AdminUsers from "./pages/admin-users";
import AdminDonations from "./pages/admin-donations";
import AdminSettings from "./pages/admin-settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/giveaways" component={Giveaways} />
      <Route path="/g/:id" component={GiveawayDetail} />
      <Route path="/winners" component={Winners} />
      <Route path="/support" component={Support} />
      <Route path="/login" component={Login} />

      {/* User routes */}
      <Route path="/me" component={UserDashboard} />
      <Route path="/me/profile" component={UserProfile} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/giveaways" component={AdminGiveaways} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/donations" component={AdminDonations} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
