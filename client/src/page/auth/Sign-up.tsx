import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });
  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: () => {
        toast({
          title: "Account Created",
          description: "Please sign in with your new credentials.",
        });
        navigate(returnUrl ? `/?returnUrl=${encodeURIComponent(returnUrl)}` : "/");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 mesh-gradient subtle-grid bg-background">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-sm sm:max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 self-center font-extrabold text-xl text-foreground group tracking-tight"
        >
          <Logo />
          <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            TeamSync Enterprise
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 tracking-wider">
            SLA 99.9%
          </span>
        </Link>
        <div className="flex flex-col gap-6">
          <Card className="border-border/80 shadow-2xl bg-card/85 backdrop-blur-xl rounded-3xl glow-card border-t-2 border-t-primary/60">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-extrabold tracking-tight gradient-text-primary">
                Create an account
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Join your organization workspace or create your new enterprise team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div className="flex flex-col gap-4">
                      <GoogleOauthButton label="Signup with Google SSO" />
                    </div>

                    <div className="grid gap-3.5">
                      <div className="grid gap-1.5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Sarah Connor"
                                  className="h-10 text-sm rounded-xl border-border/80 bg-background/50 focus:border-primary/60"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Corporate Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="admin@enterprise.io"
                                  className="h-10 text-sm rounded-xl border-border/80 bg-background/50 focus:border-primary/60"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">
                                Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="h-10 text-sm rounded-xl border-border/80 bg-background/50 focus:border-primary/60"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full h-11 text-sm font-semibold mt-1 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all"
                      >
                        {isPending && <Loader className="animate-spin mr-2 h-4 w-4" />}
                        Create Workspace Account
                      </Button>
                    </div>
                    <div className="text-center text-xs text-muted-foreground pt-1">
                      Already have an account?{" "}
                      <Link
                        to="/"
                        className="underline underline-offset-4 text-foreground font-semibold hover:text-primary transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2 text-balance text-center text-xs text-muted-foreground">
            <span>SOC-2 Type II Certified</span>
            <span>·</span>
            <span>256-bit Encryption</span>
            <span>·</span>
            <span>99.99% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
