import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

export default function AdminSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
    enabled: !!user?.isAdmin,
  });

  const [allowedDomains, setAllowedDomains] = useState("");

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiRequest("PATCH", "/api/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated",
        description: "Platform settings have been saved",
      });
    },
  });

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const handleSave = () => {
    const domains = allowedDomains
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    updateMutation.mutate({
      allowedDomains: domains.length > 0 ? domains : undefined,
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure platform behavior and restrictions
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Domain Restrictions
              </CardTitle>
              <CardDescription>
                Restrict user signups to specific email domains (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domains">Allowed Domains (one per line)</Label>
                <Textarea
                  id="domains"
                  placeholder={`example.com\ncompany.com\nuniversity.edu`}
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  data-testid="textarea-allowed-domains"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow all domains. Enter one domain per line without @ symbol.
                </p>
              </div>

              {settings?.allowedDomains && settings.allowedDomains.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Current allowed domains:</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedDomains.map((domain) => (
                      <code key={domain} className="px-2 py-1 bg-card rounded text-xs">
                        {domain}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="hover-elevate active-elevate-2"
                data-testid="button-save-settings"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fairness Algorithm</CardTitle>
              <CardDescription>Winner selection algorithm parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm font-mono">
                <p>base: {settings?.fairnessConfig?.base || 1}</p>
                <p>P (points divisor): {settings?.fairnessConfig?.P || 50}</p>
                <p>alpha (points multiplier): {settings?.fairnessConfig?.alpha || 1}</p>
                <p>beta (referral multiplier): {settings?.fairnessConfig?.beta || 2}</p>
                <p>Rcap (referral cap): {settings?.fairnessConfig?.Rcap || 20}</p>
                <p>Tmax (max tickets): {settings?.fairnessConfig?.Tmax || 500}</p>
                <p>ratioCap: {settings?.fairnessConfig?.ratioCap || 5}</p>
                <p>epsilon: {settings?.fairnessConfig?.epsilon || 0.0001}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                These values control how points and referrals affect winning probability. Contact a developer to modify these values.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
