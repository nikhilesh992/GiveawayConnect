import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Gift, Trophy, Users, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiveawayCard } from "@/components/giveaway-card";
import type { Giveaway } from "@shared/schema";

export default function Home() {
  const { data: featuredGiveaways, isLoading } = useQuery<Giveaway[]>({
    queryKey: ["/api/giveaways/featured"],
  });

  const { data: stats } = useQuery<{
    activeGiveaways: number;
    totalWinners: number;
    pointsDistributed: number;
  }>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Join the Community</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Win Amazing Prizes,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Support the Community</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Join exciting giveaways, complete tasks to earn points, refer friends, and increase your chances of winning. Fair, transparent, and fun!
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/giveaways" data-testid="button-browse-giveaways">
                  <Button size="lg" className="hover-elevate active-elevate-2 text-base">
                    Browse Giveaways
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/support" data-testid="button-donate">
                  <Button size="lg" variant="outline" className="hover-elevate active-elevate-2 text-base">
                    <Gift className="mr-2 h-5 w-5" />
                    Support Us
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-stat-giveaways">
                      {stats.activeGiveaways}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Giveaways</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-stat-winners">
                      {stats.totalWinners}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Winners</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-stat-points">
                      {stats.pointsDistributed.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Points Awarded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Complete Tasks</p>
                      <p className="text-sm text-muted-foreground">Earn points and increase chances</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Refer Friends</p>
                      <p className="text-sm text-muted-foreground">Get bonus points for each referral</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Fair Chances</p>
                      <p className="text-sm text-muted-foreground">Transparent winner selection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Giveaways */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Giveaways</h2>
              <p className="text-muted-foreground mt-2">Join now and win amazing prizes</p>
            </div>
            <Link href="/giveaways" data-testid="link-view-all">
              <Button variant="outline" className="hover-elevate active-elevate-2">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-card rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : featuredGiveaways && featuredGiveaways.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGiveaways.map((giveaway) => (
                <GiveawayCard key={giveaway.id} giveaway={giveaway} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No featured giveaways available at the moment.</p>
              <Link href="/giveaways" className="mt-4 inline-block">
                <Button variant="outline" className="hover-elevate active-elevate-2">
                  Browse All Giveaways
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Simple steps to win amazing prizes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create your free account with Google in seconds",
                icon: Users,
              },
              {
                step: "2",
                title: "Join Giveaways",
                description: "Browse and join giveaways that interest you",
                icon: Gift,
              },
              {
                step: "3",
                title: "Complete Tasks",
                description: "Earn points by completing simple tasks",
                icon: Trophy,
              },
              {
                step: "4",
                title: "Win Prizes",
                description: "Fair selection process gives you real chances",
                icon: Sparkles,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="relative h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">Step {item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
