import { useMemo } from "react";
import { TaskType } from "@/types/api.type";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock,
  Download,
  FileSpreadsheet,
  PieChart,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AnalyticsViewProps {
  tasks: TaskType[];
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW"
  ).length;
  const todoTasks = tasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length;

  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority breakdown
  const priorityBreakdown = useMemo(() => {
    const counts = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    tasks.forEach((t) => {
      if (counts[t.priority as keyof typeof counts] !== undefined) {
        counts[t.priority as keyof typeof counts]++;
      }
    });
    return counts;
  }, [tasks]);

  // Assignee distribution
  const memberWorkload = useMemo(() => {
    const map: Record<string, { name: string; count: number; completed: number }> = {};
    tasks.forEach((t) => {
      const name = t.assignedTo?.name || "Unassigned";
      if (!map[name]) {
        map[name] = { name, count: 0, completed: 0 };
      }
      map[name].count++;
      if (t.status === "DONE") map[name].completed++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [tasks]);

  // Export functions
  const handleExportCSV = () => {
    const headers = ["Task Code", "Title", "Status", "Priority", "Assignee", "Due Date", "Project"];
    const rows = tasks.map((t) => [
      `"${t.taskCode || ""}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.assignedTo?.name || "Unassigned"}"`,
      `"${t.dueDate || ""}"`,
      `"${t.project?.name || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `teamsync-tasks-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Export Successful",
      description: `Exported ${tasks.length} tasks to CSV file.`,
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `teamsync-workspace-data-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast({
      title: "JSON Export Complete",
      description: "Full workspace tasks structure exported.",
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/10 via-background to-muted/40 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Enterprise Velocity & Compliance Analytics</h3>
          <p className="text-xs text-muted-foreground">
            Real-time delivery burndown, workload distribution, and compliance audit metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-sm" onClick={handleExportJSON}>
            <Download className="h-3.5 w-3.5 text-primary" /> Export JSON
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Completion Velocity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks resolved
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-2">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              In Flight (WIP)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in Progress or Review
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Overdue Risk
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueTasks > 0 ? "Requires sprint reprioritization" : "All deliverables on schedule"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Backlog & Planned
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for future sprints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Deep Dive */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priority Breakdown Card */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Priority Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of tasks by urgency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Urgent", count: priorityBreakdown.URGENT, color: "bg-rose-500" },
              { label: "High", count: priorityBreakdown.HIGH, color: "bg-orange-500" },
              { label: "Medium", count: priorityBreakdown.MEDIUM, color: "bg-amber-500" },
              { label: "Low", count: priorityBreakdown.LOW, color: "bg-slate-400" },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{p.label}</span>
                    <span className="text-muted-foreground">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team Workload Distribution */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Team Workload Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Task assignment count and resolution progress per team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberWorkload.length === 0 ? (
              <p className="text-xs text-muted-foreground">No member workload data available.</p>
            ) : (
              memberWorkload.map((m) => {
                const memberPct = m.count > 0 ? Math.round((m.completed / m.count) * 100) : 0;
                return (
                  <div key={m.name} className="p-3 rounded-xl border border-border/40 bg-card space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{m.name}</span>
                      <span className="text-muted-foreground">
                        {m.completed}/{m.count} done ({memberPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${memberPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
