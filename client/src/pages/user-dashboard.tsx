import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Gift, Users, TrendingUp, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GiveawayCard } from "@/components/giveaway-card";
import { ReferralBox } from "@/components/referral-box";
import { Progress } from "@/components/ui/progress";
import type { Giveaway, UserStats, Donation } from "@shared/schema";

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: myGiveaways } = useQuery<Giveaway[]>({
    queryKey: ["/api/user/giveaways"],
    enabled: !!user,
  });

  const { data: myDonations } = useQuery<Donation[]>({
    queryKey: ["/api/user/donations"],
    enabled: !!user,
  });

  const { data: totalReferrals } = useQuery<number>({
    queryKey: ["/api/user/referrals/count"],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your giveaways, points, and contributions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-total-points">
                {user.points}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Earn more by completing tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Giveaways</CardTitle>
              <Gift className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-active-giveaways">
                {stats?.activeGiveaways || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently entered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-referrals">
                {totalReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Friends joined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-total-donated">
                ₹{stats?.totalDonations || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supporting the community
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Giveaways */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Giveaways</CardTitle>
                    <CardDescription>Giveaways you've entered</CardDescription>
                  </div>
                  <Link href="/giveaways">
                    <button className="inline-flex items-center text-sm font-medium text-primary hover:underline" data-testid="link-browse-more">
                      Browse More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {myGiveaways && myGiveaways.length > 0 ? (
                  <div className="space-y-4">
                    {myGiveaways.slice(0, 3).map((giveaway) => (
                      <GiveawayCard
                        key={giveaway.id}
                        giveaway={giveaway}
                        showEntryButton={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">You haven't joined any giveaways yet</p>
                    <Link href="/giveaways">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                        Browse Giveaways
                      </button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Donations */}
            {myDonations && myDonations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Your contributions to the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myDonations.slice(0, 5).map((donation, index) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`donation-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </div>
                          <div>
                            <p className="font-medium">
                              ₹{parseFloat(donation.amount.toString()).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          donation.paymentStatus === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {donation.paymentStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Box */}
            <ReferralBox
              referralCode={user.referralCode}
              totalReferrals={totalReferrals || 0}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/giveaways" className="block">
                  <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3" data-testid="button-browse-giveaways-sidebar">
                    <Gift className="mr-2 h-4 w-4" />
                    Browse Giveaways
                  </button>
                </Link>
                <Link href="/support" className="block">
                  <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3" data-testid="button-support-sidebar">
                    <Heart className="mr-2 h-4 w-4" />
                    Support Community
                  </button>
                </Link>
                <Link href="/me/profile" className="block">
                  <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3" data-testid="button-profile-sidebar">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Edit Profile
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
