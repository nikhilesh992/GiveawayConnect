import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { isAnonymous: boolean }) =>
      apiRequest("PATCH", "/api/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your privacy settings have been saved",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({ isAnonymous });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and privacy preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your profile details from Google account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                  <AvatarFallback className="text-2xl">{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold" data-testid="text-display-name">
                    {user.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-email">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm" data-testid="text-referral-code">
                      {user.referralCode}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this code with friends to earn referral points
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Total Points</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-primary/10 rounded-md font-mono text-lg font-bold text-primary" data-testid="text-points">
                      {user.points}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earn more points by completing tasks and referring friends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control how your information appears to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {isAnonymous ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="anonymous" className="font-medium">
                      Anonymous Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, your name and photo will be hidden on leaderboards and public listings. You'll appear as "Anonymous" to others.
                    </p>
                  </div>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  data-testid="switch-anonymous-mode"
                />
              </div>

              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">What stays visible?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your participation in giveaways (anonymous)</li>
                  <li>• Your chances and tickets (anonymous)</li>
                  <li>• Your donations (if you choose anonymous donation)</li>
                </ul>
              </div>

              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || isAnonymous === user.isAnonymous}
                className="hover-elevate active-elevate-2"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-sm">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Account Type:</span>
                <span className="font-medium">{user.isAdmin ? "Admin" : "User"}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
