"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, SquareTerminal } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import useContextData from "@/app/default/custom-component/useContextData";
import { instructorNavItems } from "@/app/utils/instructor-side";
import { adminNavItems } from "@/app/utils/admin-side";

export function NavMain() {
  const pathname = usePathname();
  const {UserData} = useContextData()
  const items = UserData?.role === 'admin' ? adminNavItems : instructorNavItems;


  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  return (
    <SidebarGroup>
      {/* Dashboard root */}
      <div className="mb-3">
        <Link href={UserData?.role === 'admin' ? "/dashboard" : "/instructor"} className="block">
          <SidebarMenuButton
            isActive={isActive("/dashboard")}
            className=" gap-3 rounded font-medium transition-all hover:bg-accent"
          >
            <SquareTerminal className="h-5 w-5" />
            <span className="text-sm">{UserData?.role === 'admin' ? 'Dashboard' : 'Home'}</span>
          </SidebarMenuButton>
        </Link>
      </div>

      <SidebarGroupLabel >
        Platform
      </SidebarGroupLabel>

      <SidebarMenu className="w-full overflow-x-hidden">
        {items.map((item) => {
          const open = item.items?.some((i) => isActive(i.url));

          return (
            <Collapsible
              key={item.title}
              defaultOpen={open}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {/* Parent item */}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="  rounded transition-all hover:bg-accent data-[state=open]:bg-accent/60"
                    isActive={open}
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    )}
                    <span className="text-sm">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* Sub menu */}
                <CollapsibleContent className="w-full">
                  <SidebarMenuSub className="w-full">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <Link href={subItem.url} className="block">
                          <SidebarMenuSubButton
                            isActive={isActive(subItem.url)}
                            className=" rounded  text-sm transition-all hover:bg-accent"
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
