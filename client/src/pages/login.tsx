import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    try {
      await signUpWithEmail(signupEmail, signupPassword, signupName);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setError("");
    setAuthLoading(true);
    try {
      await signInAsGuest();
    } catch (err: any) {
      setError(err.message || "Failed to sign in as guest");
    } finally {
      setAuthLoading(false);
    }
  };

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
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm" data-testid="text-error">
              {error}
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-login-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-login-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={authLoading} data-testid="button-email-login">
                  {authLoading ? "Signing in..." : "Sign in with Email"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={signInWithGoogle}
                variant="outline"
                size="lg"
                className="w-full"
                disabled={authLoading}
                data-testid="button-google-signin"
              >
                <Mail className="mr-2 h-5 w-5" />
                Google
              </Button>

              <Button
                onClick={handleGuestAccess}
                variant="outline"
                size="lg"
                className="w-full"
                disabled={authLoading}
                data-testid="button-guest-signin"
              >
                <User className="mr-2 h-5 w-5" />
                Continue as Guest
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-signup-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-signup-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                      data-testid="input-signup-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={authLoading} data-testid="button-email-signup">
                  {authLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">Why join us?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Join exciting giveaways</li>
                <li>✓ Complete tasks to earn points</li>
                <li>✓ Refer friends and get rewards</li>
                <li>✓ Send tips to support creators</li>
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
