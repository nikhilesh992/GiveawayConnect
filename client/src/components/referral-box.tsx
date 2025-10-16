import { useState } from "react";
import { Copy, Check, Users, Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ReferralBoxProps {
  referralCode: string;
  totalReferrals: number;
  pointsPerReferral?: number;
}

export function ReferralBox({ referralCode, totalReferrals, pointsPerReferral = 50 }: ReferralBoxProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Invite Friends & Earn Points
        </CardTitle>
        <CardDescription>
          Share your referral link and earn {pointsPerReferral} points for each friend who joins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="font-mono text-sm"
              data-testid="input-referral-url"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-shrink-0 hover-elevate active-elevate-2"
              data-testid="button-copy-referral"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" />
              <span>Total Referrals</span>
            </div>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-referrals">
              {totalReferrals}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Gift className="h-4 w-4" />
              <span>Points Earned</span>
            </div>
            <p className="text-2xl font-bold font-mono text-primary" data-testid="text-referral-points">
              {totalReferrals * pointsPerReferral}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p>
            💡 <span className="font-medium">Pro tip:</span> Your friends must sign up using your link and verify their account to count as a valid referral.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
