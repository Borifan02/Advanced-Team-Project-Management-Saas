import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Tag,
  Trash2,
  User,
  History,
  CheckSquare,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { transformStatusEnum, getAvatarFallbackText } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";

const AVAILABLE_TAGS = [
  "Frontend",
  "Backend",
  "Security",
  "Bug",
  "Feature",
  "DevOps",
  "UI/UX",
  "Core",
  "API",
  "High Priority",
];

export function TaskDetailSheet() {
  const {
    selectedTask,
    isTaskDetailOpen,
    closeTaskDetail,
    getTaskExtra,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    logTime,
    addTag,
    removeTag,
    addComment,
    setTaskOverride,
  } = useEnterpriseStore();

  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [loggedHoursInput, setLoggedHoursInput] = useState("1");
  const [loggedNoteInput, setLoggedNoteInput] = useState("");

  if (!selectedTask) return null;

  const extra = getTaskExtra(selectedTask._id);
  const subtasks = extra.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtasksPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleStatusChange = (newStatus: string) => {
    setTaskOverride(selectedTask._id, { status: newStatus as any });
    toast({
      title: "Status Updated",
      description: `Task status changed to ${transformStatusEnum(newStatus)}`,
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setTaskOverride(selectedTask._id, { priority: newPriority as any });
    toast({
      title: "Priority Updated",
      description: `Task priority changed to ${newPriority}`,
    });
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(selectedTask._id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedTask._id, commentText.trim(), "You");
    setCommentText("");
  };

  const handleSaveLogTime = () => {
    const hours = parseFloat(loggedHoursInput);
    if (isNaN(hours) || hours <= 0) return;
    logTime(selectedTask._id, hours, loggedNoteInput || "Development work", "You");
    setIsLogTimeOpen(false);
    setLoggedNoteInput("");
    toast({
      title: "Time Logged",
      description: `Successfully logged ${hours} hour(s)`,
    });
  };

  const copyTaskLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Copied to clipboard",
      description: `Link to ${selectedTask.taskCode || "task"} copied`,
    });
  };

  const due = selectedTask.dueDate ? new Date(selectedTask.dueDate) : null;

  return (
    <Sheet open={isTaskDetailOpen} onOpenChange={(open) => !open && closeTaskDetail()}>
      <SheetContent
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto scrollbar p-0 flex flex-col bg-background/95 backdrop-blur border-l border-border/80 shadow-2xl"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {selectedTask.taskCode || "TASK"}
              </span>
              {selectedTask.project?.name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{selectedTask.project.emoji}</span>
                  <span>{selectedTask.project.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mr-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={copyTaskLink}
                title="Copy task link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
            {selectedTask.title}
          </SheetTitle>

          <SheetDescription className="mt-2 text-sm text-muted-foreground">
            {selectedTask.description || "No description provided for this task."}
          </SheetDescription>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 px-6 gap-6 text-sm">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            Overview & Checklist
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "comments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Discussions ({extra.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            Audit Trail
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <Select value={selectedTask.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-9 w-full bg-background font-medium">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(TaskStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {transformStatusEnum(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </label>
                  <Select value={selectedTask.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-9 w-full bg-background font-medium">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(TaskPriorityEnum).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Assignee
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedTask.assignedTo?.profilePicture || ""} />
                      <AvatarFallback className="text-[10px]">
                        {getAvatarFallbackText(selectedTask.assignedTo?.name || "Unassigned")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{selectedTask.assignedTo?.name || "Unassigned"}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Due Date
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm">
                    <span>{due ? format(due, "MMM dd, yyyy") : "No due date"}</span>
                  </div>
                </div>
              </div>

              {/* Time Tracking Widget */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Time Tracking</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium gap-1"
                    onClick={() => setIsLogTimeOpen(!isLogTimeOpen)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Log Time
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Logged: <strong className="text-foreground">{extra.loggedHours || 0} hrs</strong>
                  </span>
                  <span>
                    Estimated: <strong className="text-foreground">{extra.estimatedHours || 8} hrs</strong>
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        ((extra.loggedHours || 0) / (extra.estimatedHours || 8)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                {isLogTimeOpen && (
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Hours (e.g. 2)"
                        className="h-8 w-24 text-xs"
                        value={loggedHoursInput}
                        onChange={(e) => setLoggedHoursInput(e.target.value)}
                      />
                      <Input
                        placeholder="Work summary notes..."
                        className="h-8 flex-1 text-xs"
                        value={loggedNoteInput}
                        onChange={(e) => setLoggedNoteInput(e.target.value)}
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={handleSaveLogTime}>
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Checklist & Subtasks</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {completedSubtasks} / {subtasks.length} ({subtasksPercent}%)
                  </span>
                </div>

                {subtasks.length > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${subtasksPercent}%` }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between gap-3 p-2 rounded-lg border border-border/40 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(selectedTask._id, st.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span
                          className={`text-sm truncate ${
                            st.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground font-medium"
                          }`}
                        >
                          {st.title}
                        </span>
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        onClick={() => deleteSubtask(selectedTask._id, st.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                  <Input
                    placeholder="Add a new subtask..."
                    className="h-8 text-xs"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                  <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </form>
              </div>

              {/* Tags & Labels */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Enterprise Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extra.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="px-2 py-0.5 text-xs bg-primary/5 hover:bg-primary/10 cursor-pointer gap-1 group"
                      onClick={() => removeTag(selectedTask._id, tag)}
                    >
                      {tag}
                      <span className="text-muted-foreground group-hover:text-destructive font-bold">
                        ×
                      </span>
                    </Badge>
                  ))}
                  <Select onValueChange={(val) => addTag(selectedTask._id, val)}>
                    <SelectTrigger className="h-6 w-24 text-[11px] border-dashed">
                      <span>+ Add Tag</span>
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_TAGS.filter((t) => !extra.tags?.includes(t)).map((tag) => (
                        <SelectItem key={tag} value={tag} className="text-xs">
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <form onSubmit={handleAddCommentSubmit} className="space-y-2">
                <Input
                  placeholder="Write a comment or mention @team..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="text-sm"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="gap-1.5 h-8">
                    <Send className="h-3.5 w-3.5" /> Post Comment
                  </Button>
                </div>
              </form>

              <Separator />

              <div className="space-y-3">
                {extra.comments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No discussions yet. Start the conversation!
                  </p>
                ) : (
                  extra.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-lg border border-border/50 bg-card space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {comment.author.name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              {extra.activities?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No activity logged yet.
                </p>
              ) : (
                extra.activities?.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2 text-xs py-2 border-b border-border/40"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-foreground">{act.text}</p>
                      <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t border-border/60 bg-muted/10 flex sm:justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Created {selectedTask.createdAt ? format(new Date(selectedTask.createdAt), "PPP") : "recently"}
          </span>
          <Button variant="outline" size="sm" onClick={closeTaskDetail}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
