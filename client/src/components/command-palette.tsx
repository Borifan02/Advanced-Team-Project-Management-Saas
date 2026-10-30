import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { useTheme } from "@/context/theme-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import {
  CheckCircle2,
  Calendar,
  FolderKanban,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sun,
  Users,
  BarChart2,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CommandPalette() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const { onOpen: openCreateProject } = useCreateProjectDialog();
  const { theme, setTheme } = useTheme();

  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
  } = useEnterpriseStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (action: () => void) => {
    setCommandPaletteOpen(false);
    action();
  };

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Type a command, search tasks, or switch views (⌘K)..." />
      <CommandList>
        <CommandEmpty>No matching commands found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate(`/workspace/${workspaceId}`))
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Workspace Overview & Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setActiveView("table");
                navigate(`/workspace/${workspaceId}/tasks`);
              })
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>Tasks Table View</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setActiveView("kanban");
                navigate(`/workspace/${workspaceId}/tasks`);
              })
            }
          >
            <FolderKanban className="mr-2 h-4 w-4 text-amber-500" />
            <span>Interactive Kanban Board</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setActiveView("timeline");
                navigate(`/workspace/${workspaceId}/tasks`);
              })
            }
          >
            <Clock className="mr-2 h-4 w-4 text-purple-500" />
            <span>Gantt & Sprint Timeline</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setActiveView("calendar");
                navigate(`/workspace/${workspaceId}/tasks`);
              })
            }
          >
            <Calendar className="mr-2 h-4 w-4 text-sky-500" />
            <span>Monthly Schedule Calendar</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setActiveView("analytics");
                navigate(`/workspace/${workspaceId}/tasks`);
              })
            }
          >
            <BarChart2 className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Executive Burndown Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate(`/workspace/${workspaceId}/members`))
            }
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Team Members & Workload</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate(`/workspace/${workspaceId}/settings`))
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Workspace Settings & Compliance</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(openCreateProject)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Project</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const nextTheme = theme === "dark" ? "light" : "dark";
                setTheme(nextTheme);
                toast({
                  title: `Theme Changed`,
                  description: `Switched to ${nextTheme} mode`,
                });
              })
            }
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-sky-400" />
            )}
            <span>Toggle Dark / Light Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
