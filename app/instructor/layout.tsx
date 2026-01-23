import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NextTopLoader from "nextjs-toploader";
import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard-header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div>
      <SidebarProvider>
        <NextTopLoader />
        <AppSidebar />
        {/* <Logout /> */}
        <SidebarInset>
          <DashboardHeader />
          {/* <BackNext /> */}
          <div className="flex flex-1 flex-col gap-4 p-4  pt-0 pb-16">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
