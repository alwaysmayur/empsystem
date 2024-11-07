
import { CustomSidebarContent } from "@/components/auth/customeSidebarContent";
import { CustomSidebarFooter } from "@/components/auth/customeSidebarFooter";
import { CustomSidebarHeader } from "@/components/auth/customeSidebarHeader";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { UserProvider } from "@/app/context/UseContex";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Sidebar variant="inset">
          <CustomSidebarHeader />
          <CustomSidebarContent />
          <CustomSidebarFooter />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
