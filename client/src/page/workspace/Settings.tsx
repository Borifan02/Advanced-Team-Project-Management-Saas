import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import { EnterpriseIntegrations } from "@/components/workspace/settings/enterprise-integrations";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Webhook } from "lucide-react";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"general" | "integrations">("general");

  return (
    <div className="w-full h-auto py-2 space-y-4">
      <WorkspaceHeader />
      <Separator />

      {/* Segmented Tab Control */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/75 border border-border/70 max-w-sm backdrop-blur-md shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "general"
              ? "bg-primary/15 text-primary border border-primary/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("general")}
        >
          <SettingsIcon className="h-3.5 w-3.5 text-primary" />
          <span>General & Profile</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
            activeTab === "integrations"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/25 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
          onClick={() => setActiveTab("integrations")}
        >
          <Webhook className="h-3.5 w-3.5 text-sky-400" />
          <span>API & Integrations</span>
        </Button>
      </div>

      <main>
        {activeTab === "general" ? (
          <div className="w-full max-w-3xl mx-auto py-2">
            <h2 className="text-[20px] leading-[30px] font-semibold mb-3">
              Workspace Profile & Governance
            </h2>

            <div className="flex flex-col pt-0.5 px-0 space-y-4">
              <div className="pt-2">
                <EditWorkspaceForm />
              </div>
              <div className="pt-2">
                <DeleteWorkspaceCard />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto py-2">
            <h2 className="text-[20px] leading-[30px] font-semibold mb-3">
              Developer Ecosystem & Integrations
            </h2>
            <EnterpriseIntegrations />
          </div>
        )}
      </main>
    </div>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
