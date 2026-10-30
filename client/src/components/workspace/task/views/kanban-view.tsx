import { useMemo } from "react";
import { format, isBefore } from "date-fns";
import { Plus, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskType } from "@/types/api.type";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { getAvatarFallbackText } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskMutationFn } from "@/lib/api";

interface KanbanViewProps {
  tasks: TaskType[];
  isLoading?: boolean;
  onOpenCreateTask?: (status?: string) => void;
}

const COLUMNS = [
  { key: "BACKLOG", label: "Backlog", color: "bg-slate-500", ring: "ring-slate-500/20" },
  { key: "TODO", label: "To Do", color: "bg-sky-500", ring: "ring-sky-500/20" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-amber-500", ring: "ring-amber-500/20" },
  { key: "IN_REVIEW", label: "In Review", color: "bg-purple-500", ring: "ring-purple-500/20" },
  { key: "DONE", label: "Done", color: "bg-emerald-500", ring: "ring-emerald-500/20" },
] as const;

const NEXT_STATUS: Record<string, string> = {
  BACKLOG: "TODO",
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "IN_REVIEW",
  IN_REVIEW: "DONE",
  DONE: "TODO",
};

export function KanbanView({ tasks, onOpenCreateTask }: KanbanViewProps) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { setSelectedTask, setTaskOverride, getTaskExtra } = useEnterpriseStore();

  const { mutate: editTask } = useMutation({
    mutationFn: editTaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tasks", workspaceId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskType[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        groups.TODO.push(task);
      }
    });

    return groups;
  }, [tasks]);

  const handleQuickMove = (e: React.MouseEvent, task: TaskType) => {
    e.stopPropagation();
    const next = NEXT_STATUS[task.status] || "DONE";
    setTaskOverride(task._id, { status: next as any });

    const projectId = task.project?._id || (typeof task.project === "string" ? task.project : "");
    if (projectId && workspaceId) {
      editTask({
        workspaceId,
        projectId,
        taskId: task._id,
        data: { status: next as any },
      });
    }

    toast({
      title: "Task Status Updated",
      description: `Task status updated to ${next.replace("_", " ")}`,
    });
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar">
      <div className="flex gap-4 min-w-[1100px] items-start">
        {COLUMNS.map((column) => {
          const colTasks = groupedTasks[column.key] || [];

          return (
            <div
              key={column.key}
              className={`flex-1 min-w-[260px] rounded-2xl border border-border/70 bg-card/40 backdrop-blur-sm p-3 flex flex-col gap-3 shadow-sm ${column.ring}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                {onOpenCreateTask && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onOpenCreateTask(column.key)}
                    title={`Add task to ${column.label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-2.5 min-h-[300px]">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground">
                    No tasks in {column.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const extra = getTaskExtra(task._id);
                    const subtasks = extra.subtasks || [];
                    const completedSub = subtasks.filter((s) => s.completed).length;

                    const due = task.dueDate ? new Date(task.dueDate) : null;
                    const isOverdue =
                      due && isBefore(due, new Date()) && task.status !== "DONE";

                    return (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="group relative rounded-xl border border-border/80 bg-card p-3.5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col gap-2.5"
                      >
                        {/* Task Code & Project */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground">
                            {task.taskCode || "TASK"}
                          </span>
                          {task.project?.name && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-[120px] flex items-center gap-1">
                              <span>{task.project.emoji}</span>
                              <span className="truncate">{task.project.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>

                        {/* Description snippet if any */}
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks pill if any */}
                        {subtasks.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              {completedSub}/{subtasks.length} subtasks
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        {extra.tags && extra.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {extra.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                              >
                                {t}
                              </span>
                            ))}
                            {extra.tags.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{extra.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Footer: Due Date, Assignee, Quick Move */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 font-medium ${getPriorityBadgeVariant(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </Badge>
                            {due && (
                              <span
                                className={`text-[11px] flex items-center gap-1 ${
                                  isOverdue ? "text-rose-500 font-semibold" : "text-muted-foreground"
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                {format(due, "MMM d")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 text-muted-foreground hover:text-primary"
                              title={`Advance to ${NEXT_STATUS[task.status] || "next"}`}
                              onClick={(e) => handleQuickMove(e, task)}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>

                            <Avatar className="h-6 w-6 ring-1 ring-border">
                              <AvatarImage src={task.assignedTo?.profilePicture || ""} />
                              <AvatarFallback className="text-[9px]">
                                {getAvatarFallbackText(task.assignedTo?.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
