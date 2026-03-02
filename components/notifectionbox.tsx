'use client'

import * as React from 'react'
import { Bell, XCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

type Notification = {
  id: number
  title: string
  description: string
  time: string
  read: boolean
}

export default function Notifectionbox() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: 1, title: 'New Assignment', description: 'Math assignment graded.', time: '2h ago', read: false },
    { id: 2, title: 'New Message', description: 'You received a message from your teacher.', time: '5h ago', read: false },
    { id: 3, title: 'Exam Reminder', description: 'Physics exam starts tomorrow at 10 AM.', time: '1d ago', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-2 rounded hover:bg-muted/20 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded bg-destructive animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 rounded border border-gray-300 bg-background p-0 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 ">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-60">
          <div className="flex flex-col divide-y divide-muted-foreground">
            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}

            {notifications.map(n => (
              <div
                key={n.id}
                className={`
                  flex flex-col px-4 py-3 hover:bg-muted/10 cursor-pointer border-gray-300 transition
                  ${!n.read ? 'bg-muted/5' : ''}
                `}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.description}</span>
                  </div>
                  <button
                    onClick={() => removeNotification(n.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{n.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="mt-2" />

        {/* Footer */}
        <div className="px-4 py-2 text-center text-xs text-muted-foreground">
          LMS Platform · Secure notifications
        </div>
      </PopoverContent>
    </Popover>
  )
}

























// 'use client'

// import * as React from 'react'
// import { Bell, XCircle } from 'lucide-react'
// import { io } from 'socket.io-client'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'

// type Notification = {
//   _id: string
//   title: string
//   text: string
//   createdAt: string
//   isRead: boolean
//   imagePath: string
// }

// export default function Notifectionbox({ userId }: { userId: string }) {
//   const [notifications, setNotifications] = React.useState<Notification[]>([])
//   const [cursor, setCursor] = React.useState<string | null>(null)

//   const socketRef = React.useRef<any>(null)

//   React.useEffect(() => {
//     fetchNotifications()

//     socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!)
//     socketRef.current.emit('join-user', userId)

//     socketRef.current.on('new-notification', (data: Notification) => {
//       setNotifications(prev => [data, ...prev])
//     })

//     return () => {
//       socketRef.current.disconnect()
//     }
//   }, [])

//   const fetchNotifications = async () => {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API}/notifications/user/${userId}?limit=10`
//     )
//     const data = await res.json()

//     setNotifications(data.data)
//     if (data.data.length > 0) {
//       setCursor(data.data[data.data.length - 1].createdAt)
//     }
//   }

//   const unreadCount = notifications.filter(n => !n.isRead).length

//   const markAllRead = async () => {
//     await fetch(
//       `${process.env.NEXT_PUBLIC_API}/notifications/read/${userId}`,
//       { method: 'PATCH' }
//     )

//     setNotifications(prev =>
//       prev.map(n => ({ ...n, isRead: true }))
//     )
//   }

//   const removeNotification = (id: string) => {
//     setNotifications(prev => prev.filter(n => n._id !== id))
//   }

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="ghost" className="relative p-2">
//           <Bell className="h-5 w-5" />
//           {unreadCount > 0 && (
//             <span className="absolute top-1 right-1 h-2 w-2 rounded bg-red-500 animate-pulse" />
//           )}
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent align="end" className="w-80 p-0">
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <span className="text-sm font-semibold">Notifications</span>
//           <Button size="sm" variant="ghost" onClick={markAllRead}>
//             Mark all read
//           </Button>
//         </div>

//         <ScrollArea className="h-72">
//           {notifications.length === 0 && (
//             <div className="p-4 text-center text-sm text-muted-foreground">
//               No notifications
//             </div>
//           )}

//           {notifications.map(n => (
//             <div
//               key={n._id}
//               className={`flex gap-3 px-4 py-3 border-b hover:bg-muted/10 ${
//                 !n.isRead ? 'bg-muted/5' : ''
//               }`}
//             >
//               <img
//                 src={n.imagePath}
//                 alt="notification"
//                 className="h-8 w-8 rounded"
//               />

//               <div className="flex flex-col flex-1">
//                 <span className="text-sm font-medium">{n.title}</span>
//                 <span className="text-xs text-muted-foreground">
//                   {n.text}
//                 </span>
//               </div>

//               <button onClick={() => removeNotification(n._id)}>
//                 <XCircle className="h-4 w-4 text-muted-foreground hover:text-red-500" />
//               </button>
//             </div>
//           ))}
//         </ScrollArea>

//         <Separator />

//         <div className="px-4 py-2 text-center text-xs text-muted-foreground">
//           LMS Platform · Secure notifications
//         </div>
//       </PopoverContent>
//     </Popover>
//   )
// }
