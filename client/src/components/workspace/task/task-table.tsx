import { FC, useState, useMemo } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  X,
  LayoutList,
  Kanban,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import { DataTableFacetedFilter } from "./table/table-faceted-filter";
import { priorities, statuses } from "./table/data";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { KanbanView } from "./views/kanban-view";
import { TimelineView } from "./views/timeline-view";
import { CalendarView } from "./views/calendar-view";
import { AnalyticsView } from "./views/analytics-view";
import { TaskDetailSheet } from "./task-detail-sheet";
import CreateTaskDialog from "./create-task-dialog";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
}

const TaskTable = () => {
  const param = useParams();
  const projectId = param.projectId as string;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [filters, setFilters] = useTaskTableFilter();
  const workspaceId = useWorkspaceId();
  const columns = getColumns(projectId);

  const {
    activeView,
    setActiveView,
  } = useEnterpriseStore();

  const { data, isLoading } = useQuery({
    queryKey: [
      "all-tasks",
      workspaceId,
      pageSize,
      pageNumber,
      filters,
      projectId,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        pageNumber,
        pageSize,
      }),
    staleTime: 0,
    retry: 1,
  });

  const rawTasks: TaskType[] = data?.tasks || [];
  const effectiveTasks = useMemo(() => {
    let source = rawTasks;

    if (projectId) {
      source = source.filter((t) => t.project?._id === projectId);
    }

    if (filters.keyword) {
      const q = filters.keyword.toLowerCase();
      source = source.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.taskCode?.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (filters.status) {
      const statusArr = filters.status.split(",");
      source = source.filter((t) => statusArr.includes(t.status));
    }

    if (filters.priority) {
      const prioArr = filters.priority.split(",");
      source = source.filter((t) => prioArr.includes(t.priority));
    }

    if (filters.assigneeId) {
      const assigneeArr = filters.assigneeId.split(",");
      source = source.filter(
        (t) => t.assignedTo?._id && assigneeArr.includes(t.assignedTo._id)
      );
    }

    return source;
  }, [rawTasks, projectId, filters]);

  const totalCount =
    data?.pagination?.totalCount || effectiveTasks.length;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  return (
    <div className="w-full relative space-y-4">
      {/* Top View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
              activeView === "table"
                ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
            onClick={() => setActiveView("table")}
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>Table</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
              activeView === "kanban"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
            onClick={() => setActiveView("kanban")}
          >
            <Kanban className="h-3.5 w-3.5 text-amber-400" />
            <span>Board</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
              activeView === "timeline"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
            onClick={() => setActiveView("timeline")}
          >
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>Timeline</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
              activeView === "calendar"
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
            onClick={() => setActiveView("calendar")}
          >
            <Calendar className="h-3.5 w-3.5 text-sky-400" />
            <span>Calendar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
              activeView === "analytics"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
            onClick={() => setActiveView("analytics")}
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Analytics</span>
          </Button>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <span className="text-xs text-muted-foreground font-mono font-medium hidden md:inline px-2 py-1 rounded-md bg-muted/40 border border-border/50">
            {effectiveTasks.length} task{effectiveTasks.length !== 1 ? "s" : ""} active
          </span>
          <CreateTaskDialog projectId={projectId} />
        </div>
      </div>

      {/* Render Active View */}
      {activeView === "table" && (
        <DataTable
          isLoading={isLoading}
          data={effectiveTasks}
          columns={columns}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pagination={{
            totalCount,
            pageNumber,
            pageSize,
          }}
          filtersToolbar={
            <DataTableFilterToolbar
              isLoading={isLoading}
              projectId={projectId}
              filters={filters}
              setFilters={setFilters}
            />
          }
        />
      )}

      {activeView === "kanban" && (
        <div className="space-y-4">
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
          />
          <KanbanView tasks={effectiveTasks} isLoading={isLoading} />
        </div>
      )}

      {activeView === "timeline" && (
        <div className="space-y-4">
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
          />
          <TimelineView tasks={effectiveTasks} />
        </div>
      )}

      {activeView === "calendar" && (
        <div className="space-y-4">
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
          />
          <CalendarView tasks={effectiveTasks} />
        </div>
      )}

      {activeView === "analytics" && (
        <AnalyticsView tasks={effectiveTasks} />
      )}

      {/* Global Slide-out Task Detail Drawer */}
      <TaskDetailSheet />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  // Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Members
  const assigneesOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(",") : null,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full items-start space-y-2 mb-2 lg:mb-0 lg:space-x-2 lg:space-y-0">
      <Input
        placeholder="Search tasks, codes, or specs..."
        value={filters.keyword || ""}
        onChange={(e) =>
          setFilters({
            keyword: e.target.value,
          })
        }
        className="h-8 w-full lg:w-[250px] text-xs"
      />
      {/* Status filter */}
      <DataTableFacetedFilter
        title="Status"
        multiSelect={true}
        options={statuses}
        disabled={isLoading}
        selectedValues={filters.status?.split(",") || []}
        onFilterChange={(values) => handleFilterChange("status", values)}
      />

      {/* Priority filter */}
      <DataTableFacetedFilter
        title="Priority"
        multiSelect={true}
        options={priorities}
        disabled={isLoading}
        selectedValues={filters.priority?.split(",") || []}
        onFilterChange={(values) => handleFilterChange("priority", values)}
      />

      {/* Assigned To filter */}
      <DataTableFacetedFilter
        title="Assigned To"
        multiSelect={true}
        options={assigneesOptions}
        disabled={isLoading}
        selectedValues={filters.assigneeId?.split(",") || []}
        onFilterChange={(values) => handleFilterChange("assigneeId", values)}
      />

      {!projectId && projectOptions && projectOptions.length > 0 && (
        <DataTableFacetedFilter
          title="Projects"
          multiSelect={false}
          options={projectOptions}
          disabled={isLoading}
          selectedValues={filters.projectId?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("projectId", values)}
        />
      )}

      {Object.values(filters).some(
        (value) => value !== null && value !== ""
      ) && (
        <Button
          disabled={isLoading}
          variant="ghost"
          className="h-8 px-2 lg:px-3 text-xs"
          onClick={() =>
            setFilters({
              keyword: null,
              status: null,
              priority: null,
              projectId: null,
              assigneeId: null,
            })
          }
        >
          Reset
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default TaskTable;
