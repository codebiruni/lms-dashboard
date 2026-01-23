'use client'

import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  UserCheck,
  UserPlus,
  ClipboardList,
  FileText,
  Folder,
  MessageSquare,
  Settings,
} from 'lucide-react'
import Notifectionbox from './notifectionbox'
import { ModeToggle } from './theme-toggle'

export default function DashboardHeader() {
  const pathName = usePathname() || '/dashboard'

  // Split the path into parts, filtering out empty segments
  const pathParts = pathName.split('/').filter(Boolean)

  // Map segment to meaningful icons
  const getIconForPart = (part: string, index: number) => {
    switch (true) {
      case index === 0 && part === 'dashboard':
        return <Home className="w-4 h-4 text-primary" />
      case part.includes('student'):
        return <UserCheck className="w-4 h-4 text-blue-500" />
      case part.includes('teacher') || part.includes('staff'):
        return <UserPlus className="w-4 h-4 text-green-500" />
      case part.includes('academic') || part.includes('exam'):
        return <ClipboardList className="w-4 h-4 text-yellow-500" />
      case part.includes('messages') || part.includes('posts'):
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case part.includes('files') || part.includes('resources'):
        return <FileText className="w-4 h-4 text-pink-500" />
      case part.includes('settings'):
        return <Settings className="w-4 h-4 text-muted-foreground" />
      default:
        return <Folder className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <header className="flex sticky top-0 z-30 h-14 items-center justify-between bg-background dark:bg-black border-b shadow-sm px-4 transition-all">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-muted/50 p-1 rounded transition-colors" />
        <Separator orientation="vertical" className="h-6 border-muted-foreground" />

        <Breadcrumb>
          <BreadcrumbList className="flex items-center gap-2">
            {pathParts.map((part, index) => {
              const href = '/' + pathParts.slice(0, index + 1).join('/')
              const displayName = part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

              return (
                <div key={index} className="flex items-center gap-1">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href={href}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/20 transition-colors"
                        title={displayName}
                      >
                        {getIconForPart(part, index)}
                        <span className="text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {index < pathParts.length - 1 && (
                    <BreadcrumbSeparator className="w-2 h-2 border-t border-muted-foreground rotate-90" />
                  )}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <Notifectionbox />
        <ModeToggle />
      </div>
    </header>
  )
}
