import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

const GoogleOAuthFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-muted/50 to-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          Team Sync.
        </Link>
        <Card className="border-border/60">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Authentication failed</CardTitle>
            <CardDescription>
              We couldn’t sign you in with Google. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button type="button" onClick={() => navigate("/")}
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleOAuthFailure;
