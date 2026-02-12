/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchMeeting from '@/app/default/custom-component/useFetchMeeting'
import PATCHDATA from '@/app/default/functions/Patch'
import DELETEDATA from '@/app/default/functions/DeleteData'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  RotateCcw,
  Trash2,
  Pencil,
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import EditMeeting from './EditMeeting'

/* -------------------- Types -------------------- */

interface Meeting {
  _id: string
  platform: 'google-meet' | 'zoom' | 'teams' | 'other'
  meetingId?: string
  meetingLink: string
  passcode?: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}


/* -------------------- Component -------------------- */

export default function AllMeeting() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState<string | undefined>()
  const [platform, setPlatform] = useState<string | undefined>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'startTime' | 'createdAt'>('startTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  /* ---------- Fetch Meetings ---------- */
  const { meetings, meta, isLoading, refetch } = useFetchMeeting({
    page,
    limit,
    status,
    platform,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    search,
    sortBy,
    sortOrder,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedMeeting) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/meeting/soft/${selectedMeeting._id}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/meeting/hard/${selectedMeeting._id}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/meeting/restore/${selectedMeeting._id}`, { isDeleted: false })
      }

      setDeleteOpen(false)
      setSelectedMeeting(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedMeeting(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google-meet':
        return <Video size={14} className="text-blue-500" />
      case 'zoom':
        return <Video size={14} className="text-cyan-500" />
      case 'teams':
        return <Video size={14} className="text-purple-500" />
      default:
        return <Video size={14} className="text-gray-500" />
    }
  }

  const getStatusBadge = (status: string, isDeleted: boolean) => {
    if (isDeleted) {
      return { label: 'Deleted', variant: 'destructive' as const, icon: XCircle }
    }

    switch (status) {
      case 'scheduled':
        return { label: 'Scheduled', variant: 'default' as const, icon: Calendar }
      case 'ongoing':
        return { label: 'Ongoing', variant: 'default' as const, icon: PlayCircle, className: 'bg-green-600' }
      case 'ended':
        return { label: 'Ended', variant: 'secondary' as const, icon: CheckCircle }
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle }
      default:
        return { label: status, variant: 'secondary' as const, icon: AlertCircle }
    }
  }

  const getMeetingStatus = (meeting: Meeting) => {
    if (meeting.isDeleted) return 'deleted'
    if (meeting.status === 'cancelled') return 'cancelled'
    
    const now = new Date()
    const start = new Date(meeting.startTime)
    const end = new Date(meeting.endTime)
    
    if (now < start) return 'upcoming'
    if (now > end) return 'past'
    return 'live'
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-4">
      {/* Edit Meeting Dialog */}
      {selectedMeeting && (
        <EditMeeting
          meeting={selectedMeeting}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">All Meetings</h2>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search by meeting ID or link"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setPlatform(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="google-meet">Google Meet</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={isDeleted === undefined ? '' : isDeleted ? 'true' : 'false'}
          onValueChange={(v) => setIsDeleted(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Deleted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startTime">Start Time</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- Table ---------- */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Meeting Link</TableHead>
              <TableHead>Meeting ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No meetings found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              meetings.map((meeting: any, index: number) => {
                const statusBadge = getStatusBadge(meeting.status, meeting.isDeleted)
                const StatusIcon = statusBadge.icon
                const meetingStatus = getMeetingStatus(meeting)
                
                return (
                  <TableRow
                    key={meeting._id}
                    className={meeting.isDeleted ? 'bg-red-50/50' : meeting.status === 'cancelled' ? 'bg-orange-50/50' : ''}
                  >
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(meeting.platform)}
                        <span className="capitalize text-sm">
                          {meeting.platform?.replace('-', ' ') || 'Other'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-50">
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline truncate"
                        >
                          <LinkIcon size={14} />
                          <span className="truncate">{meeting.meetingLink}</span>
                        </a>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-mono">
                        {meeting.meetingId || '-'}
                      </span>
                      {meeting.passcode && (
                        <div className="text-xs text-muted-foreground">
                          Pass: {meeting.passcode}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(meeting.startTime)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(meeting.endTime)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={statusBadge.variant}
                        className={statusBadge.className}
                      >
                        <StatusIcon size={12} className="mr-1" />
                        {statusBadge.label}
                      </Badge>
                      {meetingStatus === 'upcoming' && (
                        <Badge variant="outline" className="ml-1">Upcoming</Badge>
                      )}
                      {meetingStatus === 'live' && (
                        <Badge variant="default" className="ml-1 bg-green-600">Live</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedMeeting(meeting)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        <Link href={meeting.meetingLink} target="_blank">
                          <Button size="icon" variant="secondary">
                            <ExternalLink size={16} />
                          </Button>
                        </Link>

                        {!meeting.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditClick(meeting)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedMeeting(meeting)
                                setDeleteType('soft')
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}

                        {meeting.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedMeeting(meeting)
                                setDeleteType('restore')
                                setDeleteOpen(true)
                              }}
                            >
                              <RotateCcw size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedMeeting(meeting)
                                setDeleteType('hard')
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* ---------- Pagination ---------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} meetings
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page * meta.limit >= meta.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6" />
              Meeting Details
            </DialogTitle>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge 
                    variant={getStatusBadge(selectedMeeting.status, selectedMeeting.isDeleted).variant}
                    className={getStatusBadge(selectedMeeting.status, selectedMeeting.isDeleted).className}
                  >
                    {getStatusBadge(selectedMeeting.status, selectedMeeting.isDeleted).label}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Video size={14} />
                    <span>Platform</span>
                  </div>
                  <span className="capitalize font-medium">
                    {selectedMeeting.platform?.replace('-', ' ') || 'Other'}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Duration</span>
                  </div>
                  <span className="font-medium">
                    {Math.round((new Date(selectedMeeting.endTime).getTime() - new Date(selectedMeeting.startTime).getTime()) / (1000 * 60))} minutes
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Meeting Link
                  </h3>
                  <a 
                    href={selectedMeeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                  >
                    <LinkIcon size={16} />
                    {selectedMeeting.meetingLink}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Meeting ID
                    </h3>
                    <p className="font-mono text-sm">
                      {selectedMeeting.meetingId || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Passcode
                    </h3>
                    <p className="font-mono text-sm">
                      {selectedMeeting.passcode || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Start Time
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedMeeting.startTime)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      End Time
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedMeeting.endTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Meeting ID</p>
                      <p className="font-mono">{selectedMeeting._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedMeeting.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedMeeting.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Delete/Restore Dialog ---------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : deleteType === 'hard'
                ? 'Confirm Permanent Delete'
                : 'Confirm Restore'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {deleteType === 'soft' && 'This will move the meeting to trash. You can restore it later from the deleted items.'}
              {deleteType === 'hard' && 'This will permanently delete this meeting. This action cannot be undone!'}
              {deleteType === 'restore' && 'This will restore the meeting from trash. It will be visible again.'}
            </p>

            {deleteType !== 'restore' && (
              <div className="flex items-center space-x-2">
                <Select
                  value={deleteType}
                  onValueChange={(v: any) => setDeleteType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Delete type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Soft Delete</SelectItem>
                    <SelectItem value="hard">Hard Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}