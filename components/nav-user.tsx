"use client";

import {
  ChevronsUpDown,
  HelpCircle,
  KeySquare,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import useContextData from "@/app/default/custom-component/useContextData";
import { cn } from "@/lib/utils"

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { UserData, handleLogout, callLogout } = useContextData();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
             className={cn(
                             "group flex items-center gap-1 rounded border bg-background/80  p-1 shadow-sm",
                             "hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
                           )}
            >
              <Avatar className="h-8 w-8 rounded">
                <AvatarImage
                  src={UserData ? UserData.image : user.avatar}
                  alt={user.name}
                />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {UserData ? UserData.name : user.name}
                </span>
                <span className="truncate text-xs">
                  {UserData ? UserData.role : user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded">
                  <AvatarImage
                    src={UserData ? UserData.image : user.avatar}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {UserData ? UserData.name : user.name}
                  </span>
                  <span className="truncate text-xs">
                    {UserData ? UserData.role : user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                <span className="truncate text-xs">
                  {UserData ? UserData.id : ""}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/dashboard-home/change-password">
                <DropdownMenuItem>
                  <KeySquare />
                  Change Password
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard-home/settings">
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
              </Link>
              <Link href="https://www.codebiruni.com/pages/company/contact" target="_blank">
                <DropdownMenuItem>
                  <HelpCircle />
                  Help
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLogout(!callLogout)}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
