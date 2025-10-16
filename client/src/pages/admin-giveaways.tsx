import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Giveaway } from "@shared/schema";
import { format } from "date-fns";

export default function AdminGiveaways() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: giveaways, isLoading } = useQuery<Giveaway[]>({
    queryKey: ["/api/admin/giveaways"],
    enabled: !!user?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/giveaways/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/giveaways"] });
      toast({
        title: "Giveaway deleted",
        description: "The giveaway has been removed",
      });
    },
  });

  const selectWinnerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/giveaways/${id}/select-winner`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/giveaways"] });
      toast({
        title: "Winner selected",
        description: "A winner has been randomly selected for this giveaway",
      });
    },
  });

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Giveaways</h1>
            <p className="text-muted-foreground">Create and manage platform giveaways</p>
          </div>
          <Button className="hover-elevate active-elevate-2" data-testid="button-create-giveaway">
            <Plus className="h-4 w-4 mr-2" />
            Create Giveaway
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Giveaways</CardTitle>
            <CardDescription>
              {giveaways?.length || 0} total giveaways
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : giveaways && giveaways.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giveaways.map((giveaway) => (
                      <TableRow key={giveaway.id} data-testid={`row-giveaway-${giveaway.id}`}>
                        <TableCell className="font-medium">{giveaway.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              giveaway.status === "active"
                                ? "default"
                                : giveaway.status === "ended"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {giveaway.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{giveaway.entryCount}</TableCell>
                        <TableCell>{format(new Date(giveaway.endDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {giveaway.winnerId ? (
                            <Badge className="bg-yellow-500 hover:bg-yellow-500">
                              <Trophy className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          ) : giveaway.status === "ended" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => selectWinnerMutation.mutate(giveaway.id)}
                              disabled={selectWinnerMutation.isPending}
                              data-testid={`button-select-winner-${giveaway.id}`}
                            >
                              Select Winner
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover-elevate active-elevate-2"
                              data-testid={`button-edit-${giveaway.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this giveaway?")) {
                                  deleteMutation.mutate(giveaway.id);
                                }
                              }}
                              className="hover-elevate active-elevate-2 text-destructive"
                              data-testid={`button-delete-${giveaway.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No giveaways created yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
