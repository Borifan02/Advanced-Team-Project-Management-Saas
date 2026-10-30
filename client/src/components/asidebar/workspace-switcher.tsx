import * as React from "react";
import { Check, ChevronDown, Loader, Plus, ShieldCheck } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";

type WorkspaceType = {
  _id: string;
  name: string;
};

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();

  const [activeWorkspace, setActiveWorkspace] = React.useState<WorkspaceType>();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: 1,
    refetchOnMount: true,
    retry: 1,
  });

  const workspaces = data?.workspaces || [];

  React.useEffect(() => {
    if (workspaces?.length) {
      const workspace = workspaceId
        ? workspaces.find((ws) => ws._id === workspaceId)
        : workspaces[0];

      if (workspace) {
        setActiveWorkspace(workspace);
        if (!workspaceId) navigate(`/workspace/${workspace._id}`);
      }
    }
  }, [workspaceId, workspaces, navigate]);

  const onSelect = (workspace: WorkspaceType) => {
    setActiveWorkspace(workspace);
    navigate(`/workspace/${workspace._id}`);
  };

  return (
    <>
      <SidebarGroupLabel className="w-full justify-between pr-0">
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Workspace
        </span>
        <button
          onClick={onOpen}
          className="flex size-5 items-center justify-center rounded-full border border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          title="Create Workspace"
        >
          <Plus className="size-3" />
        </button>
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors"
              >
                {activeWorkspace ? (
                  <>
                    <div className="flex aspect-square size-8 items-center font-bold justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      {activeWorkspace?.name?.split(" ")?.[0]?.charAt(0)}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">
                        {activeWorkspace?.name}
                      </span>
                      <span className="truncate text-[11px] text-primary flex items-center gap-1 font-medium">
                        <ShieldCheck className="h-3 w-3" /> Enterprise Tier
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      TeamSync Enterprise
                    </span>
                  </div>
                )}
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                Organizations & Workspaces
              </DropdownMenuLabel>
              {isPending && !workspaces?.length ? (
                <div className="p-2 flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : null}

              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace._id}
                  onClick={() => onSelect(workspace)}
                  className="gap-2.5 p-2 rounded-lg !cursor-pointer text-xs font-medium"
                >
                  <div className="flex size-7 items-center justify-center rounded-md border font-bold bg-muted/40">
                    {workspace?.name?.split(" ")?.[0]?.charAt(0)}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-foreground font-semibold">{workspace.name}</p>
                    <p className="text-[10px] text-muted-foreground">SOC-2 Enterprise</p>
                  </div>

                  {workspace._id === workspaceId && (
                    <DropdownMenuShortcut className="tracking-normal !opacity-100 text-primary">
                      <Check className="w-4 h-4" />
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2 rounded-lg !cursor-pointer text-xs"
                onClick={onOpen}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-3.5" />
                </div>
                <div className="font-semibold text-muted-foreground">
                  New Workspace
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
