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
import { Link, useLocation, useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import { Bell, Search, Settings2, Users2 } from "lucide-react";
import { useMemo, useState } from "react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();

  const [keyword, setKeyword] = useState("");

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
    () => getAvatarFallbackText(user?.name || ""),
    [user?.name]
  );

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-2 px-3 md:px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block text-[15px]">
              {pageHeading ? (
                <BreadcrumbLink asChild>
                  <Link to={`/workspace/${workspaceId}`}>Dashboard</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1 ">
                  Dashboard
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {pageHeading && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="text-[15px]">
                  <BreadcrumbPage className="line-clamp-1">
                    {pageHeading}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-1 items-center justify-end gap-2">
          <form
            className="hidden w-full max-w-md items-center md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = keyword.trim();
              navigate(
                `/workspace/${workspaceId}/tasks${
                  trimmed ? `?keyword=${encodeURIComponent(trimmed)}` : ""
                }`
              );
            }}
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search tasks…"
                className="h-9 pl-9"
              />
            </div>
          </form>

          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Link to={`/workspace/${workspaceId}/members`} aria-label="Members">
              <Users2 className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <Button asChild variant="ghost" size="icon" aria-label="Settings">
            <Link to={`/workspace/${workspaceId}/settings`}>
              <Settings2 className="h-4 w-4" />
            </Link>
          </Button>

          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
              <AvatarFallback className="bg-muted text-xs text-muted-foreground">
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
