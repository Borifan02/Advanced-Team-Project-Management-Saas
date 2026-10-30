import { useMemo, useState } from "react";
import { format, addDays, differenceInDays, startOfDay } from "date-fns";
import { TaskType } from "@/types/api.type";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, transformStatusEnum } from "@/lib/helper";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineViewProps {
  tasks: TaskType[];
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const { setSelectedTask } = useEnterpriseStore();
  const [startDateOffset, setStartDateOffset] = useState(0);

  // Define 14 visible days
  const numDays = 14;
  const baseDate = useMemo(() => {
    return addDays(startOfDay(new Date()), startDateOffset);
  }, [startDateOffset]);

  const days = useMemo(() => {
    return Array.from({ length: numDays }, (_, i) => addDays(baseDate, i));
  }, [baseDate]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return aDue - bDue;
    });
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-500/80 border-emerald-600 text-white";
      case "IN_REVIEW":
        return "bg-purple-500/80 border-purple-600 text-white";
      case "IN_PROGRESS":
        return "bg-amber-500/80 border-amber-600 text-white";
      case "TODO":
        return "bg-sky-500/80 border-sky-600 text-white";
      default:
        return "bg-slate-500/80 border-slate-600 text-white";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Sprint & Milestone Gantt View</span>
          <Badge variant="outline" className="text-xs">
            {format(days[0], "MMM d")} – {format(days[numDays - 1], "MMM d, yyyy")}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setStartDateOffset((prev) => prev - 7)}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStartDateOffset(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setStartDateOffset((prev) => prev + 7)}
          >
            Next Week <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="w-full overflow-x-auto border border-border/70 rounded-2xl bg-card shadow-sm scrollbar">
        <div className="min-w-[1000px]">
          {/* Timeline Header Days */}
          <div className="grid grid-cols-12 border-b border-border/70 bg-muted/40 text-xs">
            <div className="col-span-4 p-3 font-semibold text-muted-foreground border-r border-border/70">
              Task & Assignee
            </div>
            <div className="col-span-8 grid grid-cols-14">
              {days.map((day, idx) => {
                const isToday =
                  format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={idx}
                    className={`p-2 text-center border-r border-border/50 last:border-r-0 flex flex-col items-center justify-center ${
                      isToday ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] uppercase">{format(day, "EEE")}</span>
                    <span className="text-xs">{format(day, "d")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-border/50">
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No tasks scheduled in this timeline window.
              </div>
            ) : (
              sortedTasks.map((task) => {
                const due = task.dueDate ? new Date(task.dueDate) : null;
                const created = task.createdAt ? new Date(task.createdAt) : addDays(new Date(), -3);

                // Compute relative positioning
                const firstDay = days[0];

                let startIdx = 0;
                let spanDays = 3;

                if (due) {
                  const diffFromStart = differenceInDays(due, firstDay);
                  startIdx = Math.max(0, Math.min(diffFromStart - 2, numDays - 2));
                  spanDays = Math.max(2, Math.min(differenceInDays(due, created) || 3, 5));
                }

                return (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className="grid grid-cols-12 hover:bg-muted/20 transition-colors cursor-pointer group items-center"
                  >
                    {/* Left Column: Task Info */}
                    <div className="col-span-4 p-3 border-r border-border/70 flex items-center justify-between gap-2 overflow-hidden">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">
                          {task.taskCode || "TASK"}
                        </span>
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Avatar className="h-5 w-5 ring-1 ring-border">
                          <AvatarImage src={task.assignedTo?.profilePicture || ""} />
                          <AvatarFallback className="text-[8px]">
                            {getAvatarFallbackText(task.assignedTo?.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Right Column: Timeline Bar */}
                    <div className="col-span-8 h-12 relative flex items-center px-1">
                      {/* Grid guidelines */}
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {days.map((_, idx) => (
                          <div
                            key={idx}
                            className="border-r border-border/20 last:border-r-0 h-full"
                          />
                        ))}
                      </div>

                      {/* Gantt Bar */}
                      <div
                        className={`relative z-10 h-7 rounded-lg border shadow-sm px-2.5 flex items-center justify-between text-xs font-medium transition-all group-hover:brightness-110 ${getStatusColor(
                          task.status
                        )}`}
                        style={{
                          marginLeft: `${(startIdx / numDays) * 100}%`,
                          width: `${Math.min((spanDays / numDays) * 100, 100 - (startIdx / numDays) * 100)}%`,
                          minWidth: "120px",
                        }}
                      >
                        <span className="truncate text-[11px] drop-shadow-sm font-semibold">
                          {transformStatusEnum(task.status)}
                        </span>
                        {due && (
                          <span className="text-[10px] opacity-90 shrink-0 ml-1">
                            {format(due, "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
