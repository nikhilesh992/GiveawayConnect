import { Trophy, Medal, Award, IndianRupee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DonorLeaderboardEntry } from "@shared/schema";

interface DonorLeaderboardProps {
  monthlyDonors: DonorLeaderboardEntry[];
  allTimeDonors: DonorLeaderboardEntry[];
  currentUserId?: string;
}

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white border-yellow-600">
          <Trophy className="h-3 w-3 mr-1" />
          #1
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-gray-400 hover:bg-gray-400 text-white border-gray-500">
          <Medal className="h-3 w-3 mr-1" />
          #2
        </Badge>
      );
    case 3:
      return (
        <Badge className="bg-orange-600 hover:bg-orange-600 text-white border-orange-700">
          <Award className="h-3 w-3 mr-1" />
          #3
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="font-mono">
          #{rank}
        </Badge>
      );
  }
};

function LeaderboardList({
  donors,
  currentUserId,
}: {
  donors: DonorLeaderboardEntry[];
  currentUserId?: string;
}) {
  if (donors.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No donations yet. Be the first to support!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {donors.map((donor, index) => {
        const rank = index + 1;
        const isCurrentUser = donor.userId === currentUserId;
        const displayName = donor.isAnonymous ? "Anonymous Donor" : donor.displayName;

        return (
          <div
            key={donor.userId + index}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              isCurrentUser
                ? "bg-primary/10 border border-primary/20"
                : "bg-card hover-elevate"
            }`}
            data-testid={`donor-entry-${index}`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-16">
              {getRankBadge(rank)}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                {!donor.isAnonymous && donor.photoURL ? (
                  <AvatarImage src={donor.photoURL} alt={displayName} />
                ) : null}
                <AvatarFallback>
                  {donor.isAnonymous ? "?" : displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                  {displayName}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-primary">(You)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {donor.donationCount} donation{donor.donationCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 font-bold font-mono text-lg">
                <IndianRupee className="h-4 w-4" />
                <span data-testid={`text-amount-${index}`}>
                  {parseFloat(donor.totalAmount.toString()).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonorLeaderboard({
  monthlyDonors,
  allTimeDonors,
  currentUserId,
}: DonorLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Donors
        </CardTitle>
        <CardDescription>
          Thank you to our generous supporters who make this possible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="monthly" data-testid="tab-monthly">
              This Month
            </TabsTrigger>
            <TabsTrigger value="all-time" data-testid="tab-all-time">
              All Time
            </TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <LeaderboardList donors={monthlyDonors} currentUserId={currentUserId} />
          </TabsContent>
          <TabsContent value="all-time">
            <LeaderboardList donors={allTimeDonors} currentUserId={currentUserId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
