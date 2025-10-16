import { Link } from "wouter";
import { Calendar, Users, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Giveaway } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface GiveawayCardProps {
  giveaway: Giveaway;
  showEntryButton?: boolean;
}

export function GiveawayCard({ giveaway, showEntryButton = true }: GiveawayCardProps) {
  const isActive = giveaway.status === "active";
  const isEnded = giveaway.status === "ended";
  const endingSoon = isActive && new Date(giveaway.endDate).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  
  const entryProgress = giveaway.maxEntries 
    ? (giveaway.entryCount / giveaway.maxEntries) * 100 
    : 0;

  const getStatusBadge = () => {
    if (isEnded) {
      return <Badge variant="secondary" className="absolute top-4 right-4">Ended</Badge>;
    }
    if (endingSoon) {
      return (
        <Badge className="absolute top-4 right-4 bg-amber-500 text-white border-amber-600">
          <Clock className="h-3 w-3 mr-1" />
          Ending Soon
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-emerald-600">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden hover-elevate" data-testid={`card-giveaway-${giveaway.id}`}>
      {/* Prize Image */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {giveaway.prizeImage ? (
          <img
            src={giveaway.prizeImage}
            alt={giveaway.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="h-16 w-16 text-primary/40" />
          </div>
        )}
        {getStatusBadge()}
      </div>

      <CardHeader className="pb-3">
        <Link href={`/g/${giveaway.id}`} data-testid={`link-giveaway-${giveaway.id}`}>
          <h3 className="text-xl font-bold line-clamp-1 hover:text-primary transition-colors cursor-pointer">
            {giveaway.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {giveaway.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Prize Description */}
        <div className="flex items-start gap-2">
          <Trophy className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium line-clamp-2">{giveaway.prizeDescription}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-medium" data-testid={`text-entries-${giveaway.id}`}>
              {giveaway.entryCount}
            </span>
            <span className="text-muted-foreground">entries</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground" data-testid={`text-enddate-${giveaway.id}`}>
              {formatDistanceToNow(new Date(giveaway.endDate), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Entry Progress */}
        {giveaway.maxEntries && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Entries</span>
              <span className="font-mono">
                {giveaway.entryCount} / {giveaway.maxEntries}
              </span>
            </div>
            <Progress value={entryProgress} className="h-2" />
          </div>
        )}
      </CardContent>

      {showEntryButton && isActive && (
        <CardFooter className="pt-0">
          <Link href={`/g/${giveaway.id}`} className="w-full">
            <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-join-${giveaway.id}`}>
              Join Giveaway
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
