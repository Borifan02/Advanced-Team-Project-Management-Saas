import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";
import { Check, Copy, Link2, UserPlus } from "lucide-react";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";
import { Badge } from "@/components/ui/badge";

const InviteMember = () => {
  const { workspace, workspaceLoading } = useAuthContext();
  const [copied, setCopied] = useState(false);

  const inviteCode = workspace?.inviteCode || "";
  const inviteUrl = inviteCode
    ? `${window.location.origin}${BASE_ROUTE.INVITE_URL.replace(
        ":inviteCode",
        inviteCode
      )}`
    : "";

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        toast({
          title: "Invite Link Copied!",
          description: "Share this link with your teammates to let them join this workspace.",
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h5 className="text-base font-bold text-foreground">
              Invite members to join you
            </h5>
            {inviteCode && (
              <Badge variant="outline" className="text-[11px] font-mono font-semibold bg-primary/10 text-primary border-primary/25">
                Code: {inviteCode}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Anyone with this link can join this Workspace as a team member. You can share it directly with your team.
          </p>
        </div>
      </div>

      <PermissionsGuard showMessage requiredPermission={Permissions.ADD_MEMBER}>
        {workspaceLoading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="h-10 flex-1 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-muted/40 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="link"
                readOnly
                value={inviteUrl}
                placeholder="Loading invite link..."
                className="pl-9 pr-3 h-10 font-mono text-xs bg-background/60 border-border/70 rounded-xl select-all focus:border-primary"
              />
            </div>
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!inviteUrl}
              className="h-10 px-4 gap-2 font-semibold text-xs rounded-xl shadow-xs shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        )}
      </PermissionsGuard>
    </div>
  );
};

export default InviteMember;
