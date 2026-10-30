import { type ReactNode, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Users2,
  Kanban,
  Calendar,
  Clock,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict, isBefore } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { getAllTasksQueryFn, getMembersInWorkspaceQueryFn } from "@/lib/api";
import { TaskStatusEnum } from "@/constant";
import { getAvatarFallbackText, transformStatusEnum } from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { TaskDetailSheet } from "@/components/workspace/task/task-detail-sheet";

type DonutSegment = { label: string; value: number; className: string };

const StatCard = (props: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  iconClassName: string;
  trend?: string;
  trendPositive?: boolean;
  accentBorder: string;
}) => {
  const { title, value, subtitle, icon, iconClassName, trend, trendPositive, accentBorder } = props;

  return (
    <Card className={`group relative overflow-hidden border-border/70 bg-card/75 backdrop-blur-md shadow-sm hover:shadow-xl transition-all glow-card border-t-2 ${accentBorder}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 shadow-inner transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 " +
            iconClassName
          }
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            {trend && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trendPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {trend}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Donut = (props: { segments: DonutSegment[] }) => {
  const total = props.segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 38;
  const stroke = 10;
  const c = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28">
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={stroke}
      />
      {props.segments
        .filter((s) => s.value > 0)
        .map((segment) => {
          const dash = total > 0 ? (segment.value / total) * c : 0;
          const dashArray = `${dash} ${c - dash}`;
          const dashOffset = -offset;
          offset += dash;

          return (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className={segment.className}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 60 60)"
            />
          );
        })}
    </svg>
  );
};

const TaskRow = (props: { task: TaskType; workspaceId: string }) => {
  const task = props.task;
  const { setSelectedTask } = useEnterpriseStore();

  const assigneeName = task.assignedTo?.name || "Unassigned";
  const initials = getAvatarFallbackText(assigneeName);

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due ? isBefore(due, new Date()) && task.status !== "DONE" : false;

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 transition-all hover:bg-muted/40 hover:border-primary/40 cursor-pointer shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            {task.taskCode || "TASK"}
          </span>
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {task.title}
          </p>
          {task.project?.name ? (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              · {task.project.emoji} {task.project.name}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant={TaskStatusEnum[task.status]}
            className="border-0 px-2 py-0 text-[10px] font-semibold uppercase shadow-none"
          >
            {transformStatusEnum(task.status)}
          </Badge>
          {due ? (
            <span className={isOverdue ? "text-rose-500 font-medium" : ""}>
              Due {format(due, "MMM d")}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 ring-1 ring-border">
          <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={assigneeName} />
          <AvatarFallback className="bg-muted text-[10px] text-muted-foreground font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

const WorkspaceDashboard = () => {
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();
  const { onOpen } = useCreateProjectDialog();
  const { setActiveView } = useEnterpriseStore();

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    enabled: !!workspaceId,
    staleTime: 0,
    retry: 1,
  });

  const projectsQuery = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 10,
    skip: !workspaceId,
  });

  const tasksQuery = useQuery({
    queryKey: ["dashboard-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        pageNumber: 1,
        pageSize: 60,
      }),
    enabled: !!workspaceId,
    staleTime: 0,
    retry: 1,
  });

  const tasks = tasksQuery.data?.tasks ?? [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), new Date()) && t.status !== "DONE"
  ).length;
  const openTasks = Math.max(totalTasks - completedTasks, 0);
  const onTrackTasks = Math.max(openTasks - overdueTasks, 0);

  const rawProjects = projectsQuery.data?.projects ?? [];
  const projectCount =
    projectsQuery.data?.pagination?.totalCount ?? rawProjects.length;

  const rawMembers = membersQuery.data?.members ?? [];
  const memberCount = rawMembers.length;

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return [...tasks]
      .filter((t) => t.dueDate && t.status !== "DONE")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .filter((t) => !isBefore(new Date(t.dueDate), now))
      .slice(0, 5);
  }, [tasks]);

  const recentActivity = useMemo(() => {
    const score = (t: TaskType) =>
      new Date(t.updatedAt || t.createdAt || 0).getTime() || 0;
    return [...tasks].sort((a, b) => score(b) - score(a)).slice(0, 6);
  }, [tasks]);

  const board = useMemo(() => {
    const groups: Record<string, TaskType[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const task of tasks) {
      if (task.status === "BACKLOG" || task.status === "TODO") groups.TODO.push(task);
      else if (task.status === "IN_PROGRESS") groups.IN_PROGRESS.push(task);
      else if (task.status === "IN_REVIEW") groups.IN_REVIEW.push(task);
      else if (task.status === "DONE") groups.DONE.push(task);
    }
    for (const key of Object.keys(groups)) {
      groups[key] = groups[key]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 4);
    }
    return groups;
  }, [tasks]);

  const donutSegments: DonutSegment[] = [
    { label: "Completed", value: completedTasks, className: "stroke-emerald-500" },
    { label: "On track", value: onTrackTasks, className: "stroke-sky-500" },
    { label: "Overdue", value: overdueTasks, className: "stroke-rose-500" },
  ];

  return (
    <main className="flex flex-1 flex-col gap-6 py-4 md:pt-2">
      {/* Top Welcome & Quick Views Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card/50 to-primary/10 p-6 backdrop-blur-xl shadow-lg">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sprint 24 · Active Cycle
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono">94.2% delivery target</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text-primary">
              Enterprise Mission Control
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Real-time sprint velocity, cross-functional workload distribution, and milestone delivery path.
            </p>
          </div>

          {/* Quick View Jumper Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:border-amber-500/40 shadow-xs transition-all"
              onClick={() => {
                setActiveView("kanban");
                navigate(`/workspace/${workspaceId}/tasks`);
              }}
            >
              <Kanban className="h-3.5 w-3.5 text-amber-500" /> Board View
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:border-purple-500/40 shadow-xs transition-all"
              onClick={() => {
                setActiveView("timeline");
                navigate(`/workspace/${workspaceId}/tasks`);
              }}
            >
              <Clock className="h-3.5 w-3.5 text-purple-500" /> Timeline
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:border-sky-500/40 shadow-xs transition-all"
              onClick={() => {
                setActiveView("calendar");
                navigate(`/workspace/${workspaceId}/tasks`);
              }}
            >
              <Calendar className="h-3.5 w-3.5 text-sky-500" /> Calendar
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:border-emerald-500/40 shadow-xs transition-all"
              onClick={() => {
                setActiveView("analytics");
                navigate(`/workspace/${workspaceId}/tasks`);
              }}
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" /> Analytics
            </Button>

            <Button
              onClick={onOpen}
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={projectCount}
          subtitle="across organization"
          icon={<FolderKanban className="h-6 w-6" />}
          iconClassName="bg-sky-500/15 text-sky-400 border-sky-500/30"
          accentBorder="border-t-sky-500"
          trend="4 Epics"
          trendPositive={false}
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasks}
          subtitle="resolved in sprint"
          icon={<CheckCircle2 className="h-6 w-6" />}
          iconClassName="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          accentBorder="border-t-emerald-500"
          trend="+18.4%"
          trendPositive={true}
        />
        <StatCard
          title="In Flight"
          value={openTasks}
          subtitle="tasks in progress"
          icon={<Clock3 className="h-6 w-6" />}
          iconClassName="bg-amber-500/15 text-amber-400 border-amber-500/30"
          accentBorder="border-t-amber-500"
          trend="Active"
          trendPositive={false}
        />
        <StatCard
          title="Team Bandwidth"
          value={memberCount}
          subtitle="collaborating members"
          icon={<Users2 className="h-6 w-6" />}
          iconClassName="bg-purple-500/15 text-purple-400 border-purple-500/30"
          accentBorder="border-t-purple-500"
          trend="Optimal"
          trendPositive={true}
        />
      </section>

      {/* Kanban Preview & Overview Donut */}
      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Live Kanban Preview</CardTitle>
              <CardDescription className="text-xs">
                Snapshot of current sprint items across stages. Click any card to open details.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => {
                setActiveView("kanban");
                navigate(`/workspace/${workspaceId}/tasks`);
              }}
            >
              Open Full Board <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { key: "TODO", label: "To do", color: "bg-sky-500" },
                  { key: "IN_PROGRESS", label: "In progress", color: "bg-amber-500" },
                  { key: "IN_REVIEW", label: "In review", color: "bg-purple-500" },
                  { key: "DONE", label: "Done", color: "bg-emerald-500" },
                ] as const
              ).map((col) => (
                <div
                  key={col.key}
                  className="rounded-xl border border-border/60 bg-muted/20 p-2.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${col.color}`} />
                      {col.label}
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {board[col.key].length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {board[col.key].length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border/50 bg-card/40 px-3 py-3 text-center text-[11px] text-muted-foreground">
                        Empty
                      </div>
                    ) : null}
                    {board[col.key].map((task) => (
                      <TaskRow key={task._id} task={task} workspaceId={workspaceId} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress & Deadlines Column */}
        <div className="grid gap-5">
          <Card className="border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Sprint Delivery Health</CardTitle>
              <Badge variant="outline" className="text-[10px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                On Schedule
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Delivery Velocity</p>
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} of {totalTasks} deliverables done
                  </p>
                </div>
                <Donut segments={donutSegments} />
              </div>

              <div className="grid gap-2 text-xs">
                {donutSegments.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={"h-2.5 w-2.5 rounded-full " + s.className.replace("stroke-", "bg-")} />
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to={`/workspace/${workspaceId}/tasks`}>All tasks</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                  No upcoming deadlines in this window.
                </div>
              ) : null}
              {upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {task.project?.emoji ? `${task.project.emoji} ` : ""}
                      {task.project?.name || "Task"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-foreground">
                      {format(new Date(task.dueDate), "MMM d")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(task.dueDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity & Velocity Summary */}
      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Recent Workspace Activity</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Live updates
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-2">
            {recentActivity.map((task) => (
              <TaskRow key={task._id} task={task} workspaceId={workspaceId} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Compliance & Velocity Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="text-foreground">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Overdue Deliverables</span>
              <p className="text-2xl font-bold text-rose-500">{overdueTasks}</p>
              <p className="text-[11px] text-muted-foreground">
                Priority items requiring sprint attention.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Active Contributors</span>
              <p className="text-2xl font-bold text-foreground">{memberCount}</p>
              <p className="text-[11px] text-muted-foreground">
                Team members collaborating in this workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Global Task Detail Drawer */}
      <TaskDetailSheet />
    </main>
  );
};

export default WorkspaceDashboard;
