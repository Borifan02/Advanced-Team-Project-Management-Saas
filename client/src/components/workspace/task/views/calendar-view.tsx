import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { TaskType } from "@/types/api.type";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  tasks: TaskType[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const { setSelectedTask } = useEnterpriseStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskType[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "IN_REVIEW":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
      case "IN_PROGRESS":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "TODO":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
      default:
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-base">{format(currentDate, "MMMM yyyy")}</h3>
          <Badge variant="outline" className="text-xs">
            {tasks.filter((t) => t.dueDate).length} Scheduled Tasks
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={prevMonth}>
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={nextMonth}>
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full border border-border/70 rounded-2xl bg-card overflow-hidden shadow-sm">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground text-center py-2.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
          {days.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 flex flex-col gap-1.5 transition-colors ${
                  !isCurrentMonth ? "bg-muted/10 opacity-40" : "bg-card hover:bg-muted/10"
                } ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium rounded-full h-6 w-6 grid place-items-center ${
                      isToday
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Day Tasks Chips */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[110px] scrollbar">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer hover:shadow-sm transition-all truncate flex items-center justify-between gap-1 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="text-[9px] font-bold opacity-75 shrink-0">
                        {task.taskCode || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
