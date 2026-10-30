import { useState } from "react";
import { Link } from "react-router-dom";
import {
  EllipsisIcon,
  Loader,
  LogOut,
  Moon,
  Sun,
  Command,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import LogoutDialog from "./logout-dialog";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { Separator } from "../ui/separator";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { toast } from "@/hooks/use-toast";

const Asidebar = () => {
  const { isLoading, user } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const { setCommandPaletteOpen } = useEnterpriseStore();

  const { open } = useSidebar();
  const workspaceId = useWorkspaceId();

  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${nextTheme} theme.`,
    });
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="!py-0 border-b border-border/40 bg-sidebar/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-start w-full px-2">
            <Logo url={`/workspace/${workspaceId}`} />
            {open && (
              <Link
                to={`/workspace/${workspaceId}`}
                className="hidden md:flex ml-2.5 items-center gap-2 self-center font-bold text-base tracking-tight"
              >
                <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  TeamSync
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 tracking-wide">
                  ENTERPRISE
                </span>
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="!mt-0 bg-sidebar/50 scrollbar">
          <SidebarGroup className="!py-1">
            <SidebarGroupContent>
              <WorkspaceSwitcher />
              <Separator className="my-1.5 opacity-60" />
              <NavMain />
              <Separator className="my-1.5 opacity-60" />
              <NavProjects />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-sidebar/80 border-t border-border/40 backdrop-blur-md">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size="24px"
                  className="place-self-center self-center animate-spin"
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-all rounded-xl border border-transparent hover:border-border/40"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8 rounded-full ring-1 ring-border shadow-sm">
                          <AvatarImage src={user?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} />
                          <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {displayName?.split(" ")?.[0]?.charAt(0)}
                            {displayName?.split(" ")?.[1]?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                        <span className="truncate font-semibold text-foreground flex items-center gap-1.5">
                          {displayName}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">{displayEmail}</span>
                      </div>
                      <EllipsisIcon className="ml-auto size-4 text-muted-foreground" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1"
                    side={"bottom"}
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-xs"
                        onClick={toggleTheme}
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Moon className="h-4 w-4 text-sky-400" />
                        )}
                        <span>Toggle Theme ({theme})</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-xs"
                        onClick={() => setCommandPaletteOpen(true)}
                      >
                        <Command className="h-4 w-4 text-primary" />
                        <span>Command Palette (⌘K)</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsOpen(true)}
                      className="gap-2 text-rose-500 cursor-pointer text-xs"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Asidebar;
