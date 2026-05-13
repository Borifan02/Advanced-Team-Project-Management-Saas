import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Access denied</CardTitle>
          <CardDescription>
            You don’t have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button asChild>
            <Link to="/">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
