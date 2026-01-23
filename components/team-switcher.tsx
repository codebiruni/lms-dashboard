"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronsUpDown} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { cn } from "@/lib/utils"



/* -------------------- UTILS -------------------- */
function getCalendarDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return {
    firstDay,
    daysInMonth,
  }
}



/* -------------------- COMPONENT -------------------- */
export function TeamSwitcher() {
  const { isMobile } = useSidebar()
    const [now, setNow] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const seconds = now.toLocaleTimeString([], {
    second: "2-digit",
  })

  const monthYear = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  const today = now.getDate()
  const { firstDay, daysInMonth } = getCalendarDays(now)


  

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
              {/* Logo */}
              <div className="flex size-9 min-w-9 items-center justify-center rounded  shadow-inner">
                <Image
                  src="/logo.png"
                  alt="LMS Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              </div>

              {/* Title */}
              <div className="flex flex-1 flex-col text-left">
                <span className="truncate text-sm font-semibold">
                  Learning
                </span>
                <span className="truncate text-xs text-muted-foreground">
                   Management Platform
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 opacity-60 transition group-hover:opacity-100" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* -------------------- DROPDOWN -------------------- */}
          <DropdownMenuContent
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
            className="w-72 rounded border bg-background p-2 shadow-xl"
          >
            <div className="w-full space-y-3">
            

            {/* -------------------- PREMIUM CLOCK -------------------- */}
<div className="relative overflow-hidden rounded border bg-linear-to-br from-background via-muted/40 to-background p-2 shadow-lg">
  {/* soft glow */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

  <div className="relative flex flex-col items-center">
    {/* Time */}
    <div className="flex items-end gap-1">
      <span className="text-5xl font-semibold tracking-tight">
        {time}
      </span>
      <span className="mb-1 text-sm text-muted-foreground">
        {seconds}
      </span>
    </div>

    {/* Date */}
    <div className="mt-2 text-xs font-medium tracking-wide text-muted-foreground">
      {now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </div>
  </div>
</div>


            {/* -------------------- CALENDAR -------------------- */}
            <div className="rounded border bg-muted/40 p-2 shadow-lg">
              <div className="mb-2 text-center text-sm font-medium">
                {monthYear}
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const isToday = day === today

                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex h-7 items-center justify-center rounded-md",
                        isToday
                          ? "bg-primary text-primary-foreground font-medium shadow"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center justify-center rounded-lg p-1">
              <span className="truncate text-xs text-muted-foreground">
                  Learing Management Platform
                </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
