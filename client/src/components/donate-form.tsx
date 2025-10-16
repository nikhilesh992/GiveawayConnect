import { useState } from "react";
import { Heart, IndianRupee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000];

interface DonateFormProps {
  onSubmit: (amount: number, isAnonymous: boolean, message: string, donorEmail: string, donorName: string) => Promise<void>;
  isPending: boolean;
  userEmail?: string;
  userName?: string;
}

export function DonateForm({ onSubmit, isPending, userEmail, userName }: DonateFormProps) {
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [donorEmail, setDonorEmail] = useState(userEmail || "");
  const [donorName, setDonorName] = useState(userName || "");
  const { toast } = useToast();

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Minimum donation amount is ₹1",
        variant: "destructive",
      });
      return;
    }

    if (!donorEmail || !donorName) {
      toast({
        title: "Required fields",
        description: "Please provide your email and name",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(amount, isAnonymous, message, donorEmail, donorName);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-current" />
          Support the Community
        </CardTitle>
        <CardDescription>
          Your donations help us run amazing giveaways and support the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="donor-name">Your Name *</Label>
              <Input
                id="donor-name"
                type="text"
                placeholder="Enter your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                data-testid="input-donor-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor-email">Your Email *</Label>
              <Input
                id="donor-email"
                type="email"
                placeholder="Enter your email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                required
                data-testid="input-donor-email"
              />
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <Label>Select Amount</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset && !customAmount ? "default" : "outline"}
                  onClick={() => handlePresetClick(preset)}
                  className="font-mono hover-elevate active-elevate-2"
                  data-testid={`button-amount-${preset}`}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="custom-amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount (minimum ₹1)"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-9 font-mono"
                data-testid="input-custom-amount"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave a message of support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              className="resize-none"
              rows={3}
              data-testid="textarea-message"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="font-medium">
                Donate Anonymously
              </Label>
              <p className="text-sm text-muted-foreground">
                Your name won't appear on the donor leaderboard
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              data-testid="switch-anonymous"
            />
          </div>

          {/* Summary */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Donation Amount:</span>
              <span className="text-2xl font-bold font-mono" data-testid="text-donation-total">
                ₹{amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full hover-elevate active-elevate-2"
            disabled={isPending || amount < 1}
            data-testid="button-donate-submit"
          >
            {isPending ? (
              "Processing..."
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Donate ₹{amount.toFixed(0)}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by PayUMoney. All transactions are encrypted and safe.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
