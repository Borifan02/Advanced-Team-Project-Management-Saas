import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-provider";
import Asidebar from "@/components/asidebar/asidebar";
import Header from "@/components/header";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import { CommandPalette } from "@/components/command-palette";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Asidebar />
        <SidebarInset className="relative overflow-x-hidden bg-background min-h-screen flex flex-col mesh-gradient">
          <div className="absolute inset-0 subtle-grid opacity-25 pointer-events-none" />
          <div className="relative z-10 w-full flex-1 flex flex-col">
            <Header />
            <div className="flex-1 px-3 py-4 sm:px-6 lg:px-10">
              <div className="mx-auto w-full max-w-7xl">
                <Outlet />
              </div>
            </div>
            <CreateWorkspaceDialog />
            <CreateProjectDialog />
            <CommandPalette />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
