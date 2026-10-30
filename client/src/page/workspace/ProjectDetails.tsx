import { useState } from "react";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import ProjectHeader from "@/components/workspace/project/project-header";
import TaskTable from "@/components/workspace/task/task-table";
import { ProjectDocs } from "@/components/workspace/project/project-docs";
import { Button } from "@/components/ui/button";
import { CheckSquare, FileText } from "lucide-react";

const ProjectDetails = () => {
  const param = useParams();
  const projectId = param.projectId as string;
  const [activeTab, setActiveTab] = useState<"tasks" | "docs">("tasks");

  return (
    <div className="w-full space-y-6 py-4 md:pt-3">
      <ProjectHeader />

      {/* Segmented View Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/75 border border-border/70 max-w-sm backdrop-blur-md shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "tasks"
              ? "bg-primary/15 text-primary border border-primary/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("tasks")}
        >
          <CheckSquare className="h-3.5 w-3.5 text-primary" />
          <span>Work Views & Tasks</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "docs"
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("docs")}
        >
          <FileText className="h-3.5 w-3.5 text-purple-400" />
          <span>Specs & RFCs</span>
        </Button>
      </div>

      {activeTab === "tasks" ? (
        <div className="space-y-5">
          <ProjectAnalytics />
          <Separator />
          <TaskTable />
        </div>
      ) : (
        <ProjectDocs projectId={projectId} />
      )}
    </div>
  );
};

export default ProjectDetails;
