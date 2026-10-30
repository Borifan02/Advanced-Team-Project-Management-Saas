import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { TeamWorkload } from "@/components/workspace/member/team-workload";
import { Button } from "@/components/ui/button";
import { Users, BarChart3 } from "lucide-react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";

export default function Members() {
  const [activeTab, setActiveTab] = useState<"members" | "workload">("members");
  const workspaceId = useWorkspaceId();

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  const { data: taskData } = useQuery({
    queryKey: ["all-tasks", workspaceId, 50, 1],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        pageNumber: 1,
        pageSize: 50,
      }),
    staleTime: 0,
    retry: 1,
  });

  const members = memberData?.members || [];
  const tasks = taskData?.tasks || [];

  return (
    <div className="w-full h-auto pt-2 space-y-4">
      <WorkspaceHeader />
      <Separator />

      {/* Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/75 border border-border/70 max-w-md backdrop-blur-md shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "members"
              ? "bg-primary/15 text-primary border border-primary/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("members")}
        >
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>Team Roster & Roles</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "workload"
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("workload")}
        >
          <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
          <span>Workload & Capacity</span>
        </Button>
      </div>

      <main>
        {activeTab === "members" ? (
          <div className="w-full max-w-3xl mx-auto pt-2 space-y-4">
            <div>
              <h2 className="text-lg leading-[30px] font-semibold mb-1">
                Workspace Members & Roles
              </h2>
              <p className="text-sm text-muted-foreground">
                Workspace members can collaborate across all projects, participate in sprint boards,
                and track issues based on their allocated permissions.
              </p>
            </div>
            <Separator />

            <InviteMember />
            <Separator className="!h-[0.5px]" />

            <AllMembers />
          </div>
        ) : (
          <div className="w-full pt-2">
            <TeamWorkload members={members} tasks={tasks} />
          </div>
        )}
      </main>
    </div>
  );
}
