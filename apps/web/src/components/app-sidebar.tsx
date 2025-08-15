import { Calendar, Home, Settings, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@daveyplate/better-auth-ui";
import Image from "next/image";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Featured Nuggets", url: "/admin/featured-nuggets", icon: Calendar },
  {
    title: "Feature Visibility",
    url: "/admin/feature-visibility",
    icon: Settings,
  },
  { title: "Prompts", url: "/admin/prompts", icon: FileText },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/logo.webp" alt="Nugget Finder" width={32} height={32} />
          <p className="font-semibold text-lg">NuggetFinder Admin</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserButton className="bg-transparent hover:bg-primary/10" />
      </SidebarFooter>
    </Sidebar>
  );
}
