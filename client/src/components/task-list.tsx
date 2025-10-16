import { CheckCircle2, Circle, ExternalLink, Youtube, Twitter, Instagram, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  completedTaskIds: string[];
  onCompleteTask: (taskId: string) => void;
  isCompletingTask: boolean;
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case "follow_twitter":
      return <Twitter className="h-4 w-4" />;
    case "follow_instagram":
      return <Instagram className="h-4 w-4" />;
    case "youtube_subscribe":
      return <Youtube className="h-4 w-4" />;
    case "share":
      return <Share2 className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

export function TaskList({ tasks, completedTaskIds, onCompleteTask, isCompletingTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tasks available for this giveaway yet.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Complete Tasks to Earn Points
        </CardTitle>
        <CardDescription>
          Each task you complete increases your chances of winning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTasks.map((task) => {
          const isCompleted = completedTaskIds.includes(task.id);
          
          return (
            <div
              key={task.id}
              className={`flex flex-wrap items-center gap-3 p-4 rounded-lg border transition-all ${
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-card border-border hover-elevate"
              }`}
              data-testid={`task-item-${task.id}`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  getTaskIcon(task.type)
                )}
              </div>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-medium ${isCompleted ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                    {task.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs"
                    data-testid={`text-points-${task.id}`}
                  >
                    +{task.points} pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {task.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    {task.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hover-elevate active-elevate-2"
                        data-testid={`button-visit-${task.id}`}
                      >
                        <a href={task.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => onCompleteTask(task.id)}
                      disabled={isCompletingTask}
                      className="hover-elevate active-elevate-2"
                      data-testid={`button-complete-${task.id}`}
                    >
                      {isCompletingTask ? "..." : "Complete"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9C6 8.44772 6.44772 8 7 8H17C17.5523 8 18 8.44772 18 9V11C18 14.866 14.866 18 11 18H10C6.13401 18 3 14.866 3 11V9C3 8.44772 3.44772 8 4 8H6Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 18V21M12 21H15M12 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 8V6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V8" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
