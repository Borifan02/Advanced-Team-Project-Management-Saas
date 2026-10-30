import { PermissionType, Permissions } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useEffect, useMemo, useState } from "react";

const allPermissions: PermissionType[] = Object.values(Permissions) as PermissionType[];

const adminPermissions: PermissionType[] = [
  Permissions.ADD_MEMBER,
  Permissions.CREATE_PROJECT,
  Permissions.EDIT_PROJECT,
  Permissions.DELETE_PROJECT,
  Permissions.CREATE_TASK,
  Permissions.EDIT_TASK,
  Permissions.DELETE_TASK,
  Permissions.MANAGE_WORKSPACE_SETTINGS,
  Permissions.VIEW_ONLY,
];

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (!user || !workspace) {
      setPermissions([]);
      return;
    }

    const userId = user._id ? String(user._id) : "";

    // Check 1: Direct workspace owner match
    const rawOwner = workspace.owner as any;
    const ownerId =
      typeof rawOwner === "string"
        ? rawOwner
        : rawOwner?._id?.toString() || rawOwner?.toString?.() || "";

    if (ownerId && userId && ownerId === userId) {
      setPermissions(allPermissions);
      return;
    }

    // Check 2: Member role matching
    if (workspace.members && workspace.members.length > 0) {
      const member = workspace.members.find((m: any) => {
        const rawMemberUser = m.userId as any;
        const mUserId =
          typeof rawMemberUser === "string"
            ? rawMemberUser
            : rawMemberUser?._id?.toString() || rawMemberUser?.toString?.() || "";
        return mUserId && userId && mUserId === userId;
      });

      if (member && member.role) {
        const roleName = String(member.role.name || "").toUpperCase();
        if (roleName === "OWNER") {
          setPermissions(allPermissions);
          return;
        }
        if (roleName === "ADMIN") {
          setPermissions(adminPermissions);
          return;
        }
        if (Array.isArray(member.role.permissions) && member.role.permissions.length > 0) {
          setPermissions(member.role.permissions);
          return;
        }
      }
    }

    // Default: View only permissions
    setPermissions([Permissions.VIEW_ONLY]);
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};

export default usePermissions;
