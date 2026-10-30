import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAvatarFallbackText } from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { Users, Clock, Zap } from "lucide-react";

interface TeamWorkloadProps {
  members: any[];
  tasks: TaskType[];
}

export function TeamWorkload({ members, tasks }: TeamWorkloadProps) {
  const memberStats = useMemo(() => {
    return members.map((member) => {
      const user = member.userId || {};
      const userId = user._id;
      const userName = user.name || "Unknown";

      // Count tasks assigned to this user
      const assignedTasks = tasks.filter(
        (t) => t.assignedTo?._id === userId || t.assignedTo?.name === userName
      );
      const openTasks = assignedTasks.filter((t) => t.status !== "DONE");
      const doneTasks = assignedTasks.filter((t) => t.status === "DONE");

      // Estimate 6 hours per open task average if not explicitly defined
      const estimatedHours = openTasks.length * 6;
      const capacityHours = member.capacityHours || 40;
      const utilization = Math.round((estimatedHours / capacityHours) * 100);

      let status: "Optimal" | "High Load" | "Overloaded" = "Optimal";
      let statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      let barColor = "bg-emerald-500";

      if (utilization > 100) {
        status = "Overloaded";
        statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
        barColor = "bg-rose-500";
      } else if (utilization >= 75) {
        status = "High Load";
        statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
        barColor = "bg-amber-500";
      }

      return {
        member,
        userName,
        userEmail: user.email || "",
        avatar: user.profilePicture || "",
        role: member.role?.name || "Member",
        openCount: openTasks.length,
        doneCount: doneTasks.length,
        totalCount: assignedTasks.length,
        estimatedHours,
        capacityHours,
        utilization,
        status,
        statusColor,
        barColor,
      };
    });
  }, [members, tasks]);

  const totalCapacity = memberStats.reduce((sum, m) => sum + m.capacityHours, 0);
  const totalAllocated = memberStats.reduce((sum, m) => sum + m.estimatedHours, 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Team Capacity
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity} hrs / week</div>
            <p className="text-xs text-muted-foreground mt-1">Based on active workspace roster</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Allocated Workload
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated} hrs</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated sprint commitment</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Capacity Utilization
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization}%</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-2">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(overallUtilization, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Capacity Roster */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Member Load & Availability Matrix</CardTitle>
          <CardDescription className="text-xs">
            Monitor individual member bandwidth to prevent burnout and balance sprint assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {memberStats.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No team members available.</p>
          ) : (
            memberStats.map((item) => (
              <div
                key={item.member._id || item.userName}
                className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/10 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-1 ring-border">
                      <AvatarImage src={item.avatar} alt={item.userName} />
                      <AvatarFallback className="text-xs font-bold">
                        {getAvatarFallbackText(item.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{item.userName}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.role}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.userEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 font-medium ${item.statusColor}`}>
                      {item.status}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">
                      {item.openCount} active tasks ({item.doneCount} completed)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {item.estimatedHours}h allocated / {item.capacityHours}h capacity
                    </span>
                    <span className="font-semibold text-foreground">{item.utilization}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${item.barColor} transition-all duration-300`}
                      style={{ width: `${Math.min(item.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
