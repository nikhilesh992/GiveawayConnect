import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { IndianRupee, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Donation, User } from "@shared/schema";
import { format } from "date-fns";

type DonationWithUser = Donation & { user: User };

export default function AdminDonations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: donations, isLoading } = useQuery<DonationWithUser[]>({
    queryKey: ["/api/admin/donations"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const totalAmount = donations?.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) || 0;
  const successfulDonations = donations?.filter((d) => d.paymentStatus === "success").length || 0;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Donations</h1>
          <p className="text-muted-foreground">Track and manage community donations</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="text-total-amount">
                ₹{totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-successful-count">
                {successfulDonations}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-total-count">
                {donations?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Latest community contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : donations && donations.length > 0 ? (
              <div className="space-y-3">
                {donations.map((donation, index) => {
                  const displayName = donation.isAnonymous
                    ? "Anonymous"
                    : donation.user.displayName;

                  return (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      data-testid={`donation-row-${index}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" data-testid={`text-donor-${index}`}>
                            {displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(donation.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-bold font-mono text-lg" data-testid={`text-amount-${index}`}>
                          ₹{parseFloat(donation.amount.toString()).toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            donation.paymentStatus === "success"
                              ? "default"
                              : donation.paymentStatus === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="mt-1"
                        >
                          {donation.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No donations yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
