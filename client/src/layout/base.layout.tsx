import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <div className="flex min-h-svh w-full flex-col bg-gradient-to-b from-muted/50 to-background">
      <div className="flex w-full flex-1 items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-5xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
