"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  Kanban,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { useEnterpriseStore, ViewType } from "@/context/enterprise-store";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { hasPermission } = useAuthContext();
  const { activeView, setActiveView } = useEnterpriseStore();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const workspaceId = useWorkspaceId();
  const location = useLocation();

  const pathname = location.pathname;
  const isTasksPage = pathname.includes("/tasks");

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tasks & Views",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Team & Workload",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },

    ...(canManageSettings
      ? [
          {
            title: "Settings & API",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];

  const subViews: { label: string; view: ViewType; icon: LucideIcon }[] = [
    { label: "Table", view: "table", icon: CheckCircle },
    { label: "Board", view: "kanban", icon: Kanban },
    { label: "Timeline", view: "timeline", icon: Clock },
    { label: "Calendar", view: "calendar", icon: Calendar },
    { label: "Analytics", view: "analytics", icon: BarChart3 },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url === pathname;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                asChild
                className={`!text-[13.5px] font-medium transition-all rounded-xl ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-sm border border-primary/20"
                    : "hover:bg-sidebar-accent/70 hover:text-foreground text-muted-foreground"
                }`}
              >
                <Link to={item.url} className="flex items-center gap-2.5">
                  <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>

              {/* Sub-views for Tasks */}
              {item.title.startsWith("Tasks") && isTasksPage && (
                <SidebarMenuSub className="my-1.5 ml-3 border-l border-border/60 pl-2.5 space-y-1">
                  {subViews.map((sub) => {
                    const isSubActive = activeView === sub.view;
                    return (
                      <SidebarMenuSubItem key={sub.view}>
                        <SidebarMenuSubButton
                          isActive={isSubActive}
                          onClick={() => setActiveView(sub.view)}
                          className={`cursor-pointer text-xs rounded-lg transition-all ${
                            isSubActive
                              ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <sub.icon className={`h-3 w-3 ${isSubActive ? "text-primary" : "text-muted-foreground"}`} />
                          <span>{sub.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
