import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DonateForm } from "@/components/donate-form";
import { DonorLeaderboard } from "@/components/donor-leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DonorLeaderboardEntry } from "@shared/schema";

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: monthlyDonors } = useQuery<DonorLeaderboardEntry[]>({
    queryKey: ["/api/donations/leaderboard/monthly"],
  });

  const { data: allTimeDonors } = useQuery<DonorLeaderboardEntry[]>({
    queryKey: ["/api/donations/leaderboard/all-time"],
  });

  const donateMutation = useMutation({
    mutationFn: (data: { amount: number; isAnonymous: boolean; message: string }) =>
      apiRequest("POST", "/api/donations", data),
    onSuccess: (data: any) => {
      // Redirect to PayUMoney payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/donations/leaderboard/monthly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/donations/leaderboard/all-time"] });
        toast({
          title: "Thank you!",
          description: "Your donation has been processed",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Support the Community</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your generous donations help us run amazing giveaways and support the community. Every contribution makes a difference!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div>
            {user ? (
              <DonateForm
                onSubmit={(amount, isAnonymous, message) =>
                  donateMutation.mutateAsync({ amount, isAnonymous, message })
                }
                isPending={donateMutation.isPending}
              />
            ) : (
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center space-y-4">
                  <Heart className="h-12 w-12 text-red-500 fill-current mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sign in to Donate</h3>
                    <p className="text-muted-foreground">
                      Please sign in to support the community with a donation
                    </p>
                  </div>
                  <a href="/login">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                      Sign In
                    </button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Impact Card */}
            <Card className="mt-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Your Impact
                </CardTitle>
                <CardDescription>
                  How your donation helps the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Fund Prize Pools</p>
                    <p className="text-muted-foreground">Help us offer better and bigger prizes to the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Platform Maintenance</p>
                    <p className="text-muted-foreground">Keep the platform running smoothly and add new features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Community Growth</p>
                    <p className="text-muted-foreground">Support events, contests, and community initiatives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donor Leaderboard */}
          <div>
            <DonorLeaderboard
              monthlyDonors={monthlyDonors || []}
              allTimeDonors={allTimeDonors || []}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
