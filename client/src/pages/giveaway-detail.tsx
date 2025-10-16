import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Users, Trophy, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task-list";
import { WinnersLeaderboard } from "@/components/winners-leaderboard";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GiveawayWithTasks, LeaderboardEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function GiveawayDetail() {
  const [, params] = useRoute("/g/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: giveaway, isLoading } = useQuery<GiveawayWithTasks>({
    queryKey: ["/api/giveaways", params?.id],
    enabled: !!params?.id,
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/giveaways", params?.id, "leaderboard"],
    enabled: !!params?.id,
  });

  const joinMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/giveaways/${params?.id}/join`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways", params?.id] });
      toast({
        title: "Success!",
        description: "You've joined the giveaway",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiRequest("POST", `/api/tasks/${taskId}/complete`, { giveawayId: params?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways", params?.id, "leaderboard"] });
      toast({
        title: "Task completed!",
        description: "Points have been added to your account",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 bg-card rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Giveaway not found</h1>
          <Button onClick={() => setLocation("/giveaways")}>Browse Giveaways</Button>
        </div>
      </div>
    );
  }

  const isActive = giveaway.status === "active";
  const hasJoined = !!giveaway.userEntry;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/giveaways")}
          className="mb-6 hover-elevate active-elevate-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Giveaways
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Giveaway Header */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                {giveaway.prizeImage ? (
                  <img
                    src={giveaway.prizeImage}
                    alt={giveaway.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="h-20 w-20 text-primary/40" />
                  </div>
                )}
                {isActive && (
                  <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-emerald-600">
                    Live
                  </Badge>
                )}
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-giveaway-title">
                    {giveaway.title}
                  </h1>
                  <p className="text-muted-foreground">{giveaway.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <p className="font-semibold">{giveaway.prizeDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Ends</span>
                    </div>
                    <p className="font-medium" data-testid="text-end-date">
                      {formatDistanceToNow(new Date(giveaway.endDate), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Entries</span>
                    </div>
                    <p className="font-medium font-mono" data-testid="text-entry-count">
                      {giveaway.entryCount}
                    </p>
                  </div>
                </div>

                {!user && isActive && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-center">
                      Please <a href="/login" className="text-primary hover:underline">sign in</a> to join this giveaway
                    </p>
                  </div>
                )}

                {user && !hasJoined && isActive && (
                  <Button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    size="lg"
                    className="w-full hover-elevate active-elevate-2"
                    data-testid="button-join-giveaway"
                  >
                    {joinMutation.isPending ? "Joining..." : "Join Giveaway"}
                  </Button>
                )}

                {hasJoined && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You're entered in this giveaway!</span>
                    </div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Complete tasks below to increase your chances
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            {hasJoined && giveaway.tasks && (
              <TaskList
                tasks={giveaway.tasks}
                completedTaskIds={giveaway.userCompletedTasks || []}
                onCompleteTask={(taskId) => completeTaskMutation.mutate(taskId)}
                isCompletingTask={completeTaskMutation.isPending}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
              <WinnersLeaderboard
                entries={leaderboard.slice(0, 10)}
                giveawayTitle={giveaway.title}
                currentUserId={user?.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
