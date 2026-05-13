import { type ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Users2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict, isBefore } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { getAllTasksQueryFn, getMembersInWorkspaceQueryFn, getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import { TaskStatusEnum } from "@/constant";
import { getAvatarFallbackText, transformStatusEnum } from "@/lib/helper";
import { TaskType } from "@/types/api.type";

type DonutSegment = { label: string; value: number; className: string };

const StatCard = (props: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  iconClassName: string;
}) => {
  const { title, value, subtitle, icon, iconClassName } = props;

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={
            "grid h-10 w-10 place-items-center rounded-xl border bg-muted/40 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.02] " +
            iconClassName
          }
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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

  const assigneeName = task.assignedTo?.name || "Unassigned";
  const initials = getAvatarFallbackText(assigneeName);

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due ? isBefore(due, new Date()) && task.status !== "DONE" : false;

  return (
    <Link
      to={
        task.project?._id
          ? `/workspace/${props.workspaceId}/project/${task.project._id}`
          : `/workspace/${props.workspaceId}/tasks`
      }
      className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {task.project?.name ? (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              · {task.project.emoji} {task.project.name}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant={TaskStatusEnum[task.status]}
            className="border-0 px-2 py-0.5 text-[10px] font-semibold uppercase shadow-sm"
          >
            {transformStatusEnum(task.status)}
          </Badge>
          {due ? (
            <span className={isOverdue ? "text-destructive" : ""}>
              Due {format(due, "PPP")}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={assigneeName} />
          <AvatarFallback className="bg-muted text-xs text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
};

const WorkspaceDashboard = () => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();

  const analyticsQuery = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const projectsQuery = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 1,
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
  });

  const analytics = analyticsQuery.data?.analytics;
  const totalTasks = analytics?.totalTasks ?? 0;
  const completedTasks = analytics?.completedTasks ?? 0;
  const overdueTasks = analytics?.overdueTasks ?? 0;
  const openTasks = Math.max(totalTasks - completedTasks, 0);
  const onTrackTasks = Math.max(openTasks - overdueTasks, 0);

  const projectCount = projectsQuery.data?.pagination?.totalCount ?? 0;
  const memberCount = membersQuery.data?.members?.length ?? 0;

  const tasks = tasksQuery.data?.tasks ?? [];

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
      if (task.status === "BACKLOG") groups.TODO.push(task);
      else if (task.status === "TODO") groups.TODO.push(task);
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
    { label: "Completed", value: completedTasks, className: "stroke-chart-2" },
    { label: "On track", value: onTrackTasks, className: "stroke-chart-1" },
    { label: "Overdue", value: overdueTasks, className: "stroke-chart-5" },
  ];

  return (
    <main className="flex flex-1 flex-col gap-5 py-4 md:pt-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspace Overview</h2>
          <p className="text-sm text-muted-foreground">
            Track progress, deadlines, and what needs attention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onOpen} className="shadow-sm">
            <Plus />
            New Project
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Projects"
          value={projectCount}
          subtitle="in this workspace"
          icon={<FolderKanban className="h-5 w-5" />}
          iconClassName="bg-chart-1/10 text-chart-1"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          subtitle="tasks done"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          title="In progress"
          value={openTasks}
          subtitle="open tasks"
          icon={<Clock3 className="h-5 w-5" />}
          iconClassName="bg-chart-4/10 text-chart-4"
        />
        <StatCard
          title="Team"
          value={memberCount}
          subtitle="members"
          icon={<Users2 className="h-5 w-5" />}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Project tasks</CardTitle>
              <p className="text-sm text-muted-foreground">
                A quick kanban preview from your latest tasks.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/workspace/${workspaceId}/tasks`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {(
                [
                  { key: "TODO", label: "To do", ring: "ring-chart-1/20" },
                  {
                    key: "IN_PROGRESS",
                    label: "In progress",
                    ring: "ring-chart-4/20",
                  },
                  {
                    key: "IN_REVIEW",
                    label: "In review",
                    ring: "ring-chart-5/20",
                  },
                  { key: "DONE", label: "Done", ring: "ring-chart-2/20" },
                ] as const
              ).map((col) => (
                <div
                  key={col.key}
                  className={
                    "rounded-xl border bg-muted/20 p-2 ring-1 transition-colors hover:bg-muted/30 " +
                    col.ring
                  }
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {col.label}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {board[col.key].length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {board[col.key].length === 0 ? (
                      <div className="rounded-lg border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                        No tasks
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

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Overview</CardTitle>
              <Badge variant="secondary" className="border bg-muted/40">
                Live
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Task progress</p>
                  <p className="text-xs text-muted-foreground">
                    Based on current workspace analytics.
                  </p>
                </div>
                <Donut segments={donutSegments} />
              </div>

              <div className="grid gap-2">
                {donutSegments.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={"h-2.5 w-2.5 rounded-full " + s.className.replace("stroke-", "bg-")} />
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="text-sm font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Upcoming deadlines</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/workspace/${workspaceId}/tasks`}>Open tasks</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                  No upcoming deadlines.
                </div>
              ) : null}
              {upcomingDeadlines.map((task) => (
                <div key={task._id} className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.project?.emoji ? `${task.project.emoji} ` : ""}
                      {task.project?.name || "Task"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(task.dueDate), "MMM d")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(task.dueDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Badge variant="secondary" className="border bg-muted/40">
              {tasksQuery.isLoading || analyticsQuery.isLoading ? "Loading" : "Updated"}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-2">
            {recentActivity.length === 0 ? (
              <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                No tasks yet. Create a project to get started.
              </div>
            ) : null}
            {recentActivity.map((task) => (
              <TaskRow key={task._id} task={task} workspaceId={workspaceId} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Completion rate</p>
              <p className="mt-1 text-2xl font-semibold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-chart-2"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Overdue tasks</p>
              <p className="mt-1 text-2xl font-semibold">{overdueTasks}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Focus here to keep projects on track.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Members</p>
              <p className="mt-1 text-2xl font-semibold">{memberCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Invite teammates to collaborate faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default WorkspaceDashboard;
