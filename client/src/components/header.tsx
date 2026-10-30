import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import {
  Search,
  Settings2,
  Users2,
  Sun,
  Moon,
  Command,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import { NotificationCenter } from "./notification-center";
import { useTheme } from "@/context/theme-provider";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { Badge } from "./ui/badge";

const Header = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const { setCommandPaletteOpen } = useEnterpriseStore();

  const pathname = location.pathname;

  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/project/")) return "Project";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/tasks")) return "Tasks";
    if (pathname.includes("/members")) return "Members";
    return null; // Default label
  };

  const pageHeading = getPageLabel(pathname);

  const userInitials = useMemo(
    () => getAvatarFallbackText(user?.name || "User"),
    [user?.name]
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-3 md:px-5 transition-all">
      <div className="flex flex-1 items-center justify-between gap-3">
        {/* Left: Trigger & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block opacity-60" />
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem className="text-sm font-medium">
                {pageHeading ? (
                  <BreadcrumbLink asChild>
                    <Link to={`/workspace/${workspaceId}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    Dashboard
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {pageHeading && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="text-sm">
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {pageHeading}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Enterprise Status Badge with live pulse */}
          <Badge
            variant="outline"
            className="ml-2 hidden lg:flex items-center gap-1.5 text-[11px] font-medium border-primary/30 bg-primary/10 text-primary py-0.5 px-2.5 rounded-full shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="h-3 w-3 text-primary ml-0.5" />
            <span>SOC-2 SLA 99.99%</span>
          </Badge>
        </div>

        {/* Center: Command Palette Trigger Button (Linear/Raycast style) */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full h-9 px-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-card/90 hover:border-primary/50 text-muted-foreground text-xs flex items-center justify-between transition-all group shadow-xs hover:shadow-[0_0_15px_-3px_hsla(246,86%,65%,0.25)]"
          >
            <span className="flex items-center gap-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="group-hover:text-foreground transition-colors">Search tasks, specs, views...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/80 bg-muted/60 px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Theme, Notifications, User */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Members Link */}
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex h-9 w-9">
            <Link to={`/workspace/${workspaceId}/members`} aria-label="Members">
              <Users2 className="h-4 w-4" />
            </Link>
          </Button>

          {/* Notifications Dropdown */}
          <NotificationCenter />

          {/* Theme Switcher Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-sky-500" />
            )}
          </Button>

          {/* Settings Link */}
          <Button asChild variant="ghost" size="icon" className="h-9 w-9" aria-label="Settings">
            <Link to={`/workspace/${workspaceId}/settings`}>
              <Settings2 className="h-4 w-4" />
            </Link>
          </Button>

          {/* User Avatar */}
          <div className="ml-1 items-center gap-2 flex">
            <Avatar className="h-8 w-8 ring-1 ring-border shadow-sm">
              <AvatarImage src={user?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
