import { useQuery } from "@tanstack/react-query";
import { Trophy, Gift, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Giveaway, User } from "@shared/schema";
import { format } from "date-fns";

type Winner = {
  giveaway: Giveaway;
  winner: User;
};

export default function Winners() {
  const { data: winners, isLoading } = useQuery<Winner[]>({
    queryKey: ["/api/winners"],
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/10 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Winners Hall of Fame</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Congratulations to all our winners! Your participation and support make this community amazing.
          </p>
        </div>

        {/* Winners List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : winners && winners.length > 0 ? (
          <div className="space-y-6">
            {winners.map((winner, index) => {
              const displayName = winner.winner.isAnonymous
                ? "Anonymous Winner"
                : winner.winner.displayName;

              return (
                <Card
                  key={winner.giveaway.id}
                  className="overflow-hidden hover-elevate transition-all"
                  data-testid={`winner-card-${index}`}
                >
                  <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 p-6">
                    {/* Winner Avatar */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-4 border-yellow-500/20">
                          {!winner.winner.isAnonymous && winner.winner.photoURL ? (
                            <AvatarImage src={winner.winner.photoURL} alt={displayName} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10">
                            {winner.winner.isAnonymous ? "?" : displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Giveaway Info */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg" data-testid={`text-winner-name-${index}`}>
                            {displayName}
                          </h3>
                          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
                            Winner
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Won on {format(new Date(winner.giveaway.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold" data-testid={`text-giveaway-title-${index}`}>
                            {winner.giveaway.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {winner.giveaway.prizeDescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Element */}
                    <div className="flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No winners yet</h3>
              <p className="text-muted-foreground">
                Be the first to win! Join an active giveaway and complete tasks to increase your chances.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Fair & Transparent Selection
            </CardTitle>
            <CardDescription>
              Our winner selection process is completely fair and transparent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Winners are selected using a weighted random algorithm based on points earned
            </p>
            <p>
              • More tasks completed = more points = higher chances of winning
            </p>
            <p>
              • Referrals and community participation also increase your winning probability
            </p>
            <p>
              • All selections are logged and auditable for complete transparency
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
