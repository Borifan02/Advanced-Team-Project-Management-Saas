import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TaskType } from "@/types/api.type";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskComment = {
  id: string;
  author: {
    name: string;
    avatar?: string | null;
  };
  text: string;
  createdAt: string;
};

export type TimeLog = {
  id: string;
  hours: number;
  date: string;
  note: string;
  author: string;
};

export type TaskExtraData = {
  subtasks: Subtask[];
  tags: string[];
  estimatedHours: number;
  loggedHours: number;
  timeLogs: TimeLog[];
  comments: TaskComment[];
  activities: { id: string; text: string; timestamp: string }[];
};

export type EnterpriseNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

export type ProjectDocument = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
};

export type ViewType = "table" | "kanban" | "timeline" | "calendar" | "analytics";

interface EnterpriseState {
  // View mode
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Selected task for drawer
  selectedTask: TaskType | null;
  isTaskDetailOpen: boolean;
  setSelectedTask: (task: TaskType | null) => void;
  closeTaskDetail: () => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Task rich metadata dictionary keyed by taskId
  taskExtras: Record<string, TaskExtraData>;
  getTaskExtra: (taskId: string) => TaskExtraData;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  logTime: (taskId: string, hours: number, note: string, author: string) => void;
  setEstimatedHours: (taskId: string, hours: number) => void;
  addTag: (taskId: string, tag: string) => void;
  removeTag: (taskId: string, tag: string) => void;
  addComment: (taskId: string, text: string, authorName: string) => void;

  // Local task overrides (e.g. quick status changes, quick priority updates)
  localTaskOverrides: Record<string, Partial<TaskType>>;
  setTaskOverride: (taskId: string, updates: Partial<TaskType>) => void;
  clearTaskOverrides: () => void;

  // Notifications
  notifications: EnterpriseNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Project Documents & Specs
  documents: ProjectDocument[];
  addDocument: (doc: Omit<ProjectDocument, "id" | "updatedAt">) => void;
  updateDocument: (id: string, title: string, content: string) => void;
  deleteDocument: (id: string) => void;
}

const defaultTaskExtra: TaskExtraData = {
  subtasks: [],
  tags: [],
  estimatedHours: 0,
  loggedHours: 0,
  timeLogs: [],
  comments: [],
  activities: [],
};

const initialNotifications: EnterpriseNotification[] = [];

const initialDocuments: ProjectDocument[] = [];

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set, get) => ({
      activeView: "table",
      setActiveView: (view) => set({ activeView: view }),

      selectedTask: null,
      isTaskDetailOpen: false,
      setSelectedTask: (task) => set({ selectedTask: task, isTaskDetailOpen: !!task }),
      closeTaskDetail: () => set({ selectedTask: null, isTaskDetailOpen: false }),

      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      taskExtras: {},
      getTaskExtra: (taskId: string) => {
        const state = get();
        if (state.taskExtras[taskId]) {
          return state.taskExtras[taskId];
        }
        return defaultTaskExtra;
      },

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          const updatedSubtasks = current.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                subtasks: updatedSubtasks,
                activities: [
                  {
                    id: Date.now().toString(),
                    text: `Subtask status updated`,
                    timestamp: "Just now",
                  },
                  ...current.activities,
                ],
              },
            },
          };
        }),

      addSubtask: (taskId, title) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          const newSubtask: Subtask = {
            id: `st-${Date.now()}`,
            title,
            completed: false,
          };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                subtasks: [...current.subtasks, newSubtask],
              },
            },
          };
        }),

      deleteSubtask: (taskId, subtaskId) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                subtasks: current.subtasks.filter((st) => st.id !== subtaskId),
              },
            },
          };
        }),

      logTime: (taskId, hours, note, author) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          const newLog: TimeLog = {
            id: `tl-${Date.now()}`,
            hours,
            date: new Date().toISOString(),
            note,
            author,
          };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                loggedHours: (current.loggedHours || 0) + hours,
                timeLogs: [newLog, ...(current.timeLogs || [])],
                activities: [
                  {
                    id: Date.now().toString(),
                    text: `${author} logged ${hours}h: "${note}"`,
                    timestamp: "Just now",
                  },
                  ...current.activities,
                ],
              },
            },
          };
        }),

      setEstimatedHours: (taskId, hours) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: { ...current, estimatedHours: hours },
            },
          };
        }),

      addTag: (taskId, tag) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          if (current.tags.includes(tag)) return state;
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                tags: [...current.tags, tag],
              },
            },
          };
        }),

      removeTag: (taskId, tag) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                tags: current.tags.filter((t) => t !== tag),
              },
            },
          };
        }),

      addComment: (taskId, text, authorName) =>
        set((state) => {
          const current = state.taskExtras[taskId] || { ...defaultTaskExtra };
          const newComment: TaskComment = {
            id: `c-${Date.now()}`,
            author: { name: authorName, avatar: null },
            text,
            createdAt: "Just now",
          };
          return {
            taskExtras: {
              ...state.taskExtras,
              [taskId]: {
                ...current,
                comments: [newComment, ...current.comments],
              },
            },
          };
        }),

      localTaskOverrides: {},
      setTaskOverride: (taskId, updates) =>
        set((state) => {
          const existing = state.localTaskOverrides[taskId] || {};
          const merged = { ...existing, ...updates };
          return {
            localTaskOverrides: {
              ...state.localTaskOverrides,
              [taskId]: merged,
            },
            selectedTask:
              state.selectedTask?._id === taskId
                ? ({ ...state.selectedTask, ...updates } as TaskType)
                : state.selectedTask,
          };
        }),
      clearTaskOverrides: () => set({ localTaskOverrides: {} }),

      notifications: initialNotifications,
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      documents: initialDocuments,
      addDocument: (doc) =>
        set((state) => ({
          documents: [
            {
              ...doc,
              id: `doc-${Date.now()}`,
              updatedAt: new Date().toLocaleDateString(),
            },
            ...state.documents,
          ],
        })),
      updateDocument: (id, title, content) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id
              ? { ...d, title, content, updatedAt: new Date().toLocaleDateString() }
              : d
          ),
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
    }),
    {
      name: "teamsync-enterprise-store",
      partialize: (state) => ({
        activeView: state.activeView,
        taskExtras: state.taskExtras,
        localTaskOverrides: state.localTaskOverrides,
        notifications: state.notifications,
        documents: state.documents,
      }),
    }
  )
);
