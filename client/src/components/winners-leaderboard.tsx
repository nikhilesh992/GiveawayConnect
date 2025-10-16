import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { LeaderboardEntry } from "@shared/schema";

interface WinnersLeaderboardProps {
  entries: LeaderboardEntry[];
  giveawayTitle?: string;
  currentUserId?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 2:
      return <Medal className="h-4 w-4 text-gray-400" />;
    case 3:
      return <Award className="h-4 w-4 text-orange-600" />;
    default:
      return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
  }
};

export function WinnersLeaderboard({
  entries,
  giveawayTitle,
  currentUserId,
}: WinnersLeaderboardProps) {
  const totalTickets = entries.reduce((sum, entry) => sum + entry.tickets, 0);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No entries yet. Be the first to join!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {giveawayTitle ? `${giveawayTitle} - Leaderboard` : "Leaderboard"}
        </CardTitle>
        <CardDescription>
          Based on points, tasks completed, and referrals. Higher chances = more tickets!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.userId === currentUserId;
          const displayName = entry.isAnonymous ? "Anonymous" : entry.displayName;
          const probability = entry.probability ? parseFloat(entry.probability.toString()) * 100 : 0;

          return (
            <div
              key={entry.userId}
              className={`p-4 rounded-lg transition-all ${
                isCurrentUser
                  ? "bg-primary/10 border-2 border-primary/30 ring-2 ring-primary/20"
                  : "bg-card border border-border hover-elevate"
              }`}
              data-testid={`leaderboard-entry-${index}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Rank Icon */}
                <div className="flex-shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {!entry.isAnonymous && entry.photoURL ? (
                      <AvatarImage src={entry.photoURL} alt={displayName} />
                    ) : null}
                    <AvatarFallback>
                      {entry.isAnonymous ? "?" : displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                        {displayName}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-muted-foreground">
                        Rank <span className="font-mono font-medium">#{rank}</span>
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono font-medium" data-testid={`text-tickets-${index}`}>
                          {entry.tickets}
                        </span> tickets
                      </p>
                    </div>
                  </div>
                </div>

                {/* Win Probability */}
                <div className="text-right flex-shrink-0">
                  <Badge
                    variant={rank <= 3 ? "default" : "secondary"}
                    className="font-mono"
                    data-testid={`text-probability-${index}`}
                  >
                    {probability.toFixed(2)}%
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress
                  value={probability}
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground text-right">
                  Win probability based on {entry.tickets} tickets out of {totalTickets} total
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
