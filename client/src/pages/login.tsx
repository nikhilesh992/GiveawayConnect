import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const { user, signInWithGoogle, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to GiveawayConnect</CardTitle>
            <CardDescription className="mt-2">
              Sign in to join giveaways, complete tasks, and win amazing prizes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            size="lg"
            className="w-full hover-elevate active-elevate-2"
            data-testid="button-google-signin"
          >
            <SiGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>

          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">Why sign in?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Join exciting giveaways</li>
                <li>✓ Complete tasks to earn points</li>
                <li>✓ Refer friends and get rewards</li>
                <li>✓ Track your winning chances</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
