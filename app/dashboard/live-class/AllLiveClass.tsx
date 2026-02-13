/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchLiveClass from '@/app/default/custom-component/useFetchLiveClass'
import DELETEDATA from '@/app/default/functions/DeleteData'
import PATCHDATA from '@/app/default/functions/Patch'

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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Pencil,
  RotateCcw,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Video,
  Users,
  BookOpen,
  Layers,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react'

import EditLiveClass from './EditLiveClass'

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug?: string
}

interface Section {
  _id: string
  title: string
}

interface Instructor {
  _id: string
  id?: string
  userId?: {
    name: string
    email: string
  }
}

interface LiveClass {
  _id: string
  courseId: Course
  sectionId?: Section
  instructorId: Instructor
  title: string
  description?: string
  meetingLink?: string
  meetingPlatform: 'google-meet' | 'zoom' | 'other'
  startTime: string
  endTime: string
  isRecorded: boolean
  recordingUrl?: string
  isCancelled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

interface Meta {
  page: number
  limit: number
  total: number
}

/* -------------------- Component -------------------- */

export default function AllLiveClass() {
  /* ---------- filters ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState<string>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [isCancelled, setIsCancelled] = useState<boolean | undefined>()
  const [sortByTime, setSortByTime] = useState<'asc' | 'desc' | undefined>('desc')
  const [courseId, setCourseId] = useState<string>()
  const [instructorId, setInstructorId] = useState<string>()

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClass | null>(null)

  const {
    liveClasses,
    meta,
    isLoading,
    refetch,
  } = useFetchLiveClass({
    page,
    limit,
    searchTerm,
    meetingPlatform,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    isCancelled,
    sortByTime,
    courseId,
    instructorId,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedLiveClass) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/live-class/soft/${selectedLiveClass._id}`)
    } else {
      await DELETEDATA(`/v1/live-class/hard/${selectedLiveClass._id}`)
    }

    setDeleteOpen(false)
    setSelectedLiveClass(null)
    refetch()
  }

  const restoreLiveClass = async (id: string) => {
    await PATCHDATA(`/v1/live-class/restore/${id}`, { isDeleted: false })
    refetch()
  }

  const handleEditClick = (liveClass: LiveClass) => {
    setSelectedLiveClass(liveClass)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedLiveClass(null)
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

  const getMeetingPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google-meet':
        return <Video size={14} className="text-blue-500" />
      case 'zoom':
        return <Video size={14} className="text-cyan-500" />
      default:
        return <Video size={14} className="text-gray-500" />
    }
  }

  const getClassStatus = (liveClass: LiveClass) => {
    if (liveClass.isDeleted) return { label: 'Deleted', variant: 'destructive' as const }
    if (liveClass.isCancelled) return { label: 'Cancelled', variant: 'destructive' as const }
    
    const now = new Date()
    const start = new Date(liveClass.startTime)
    const end = new Date(liveClass.endTime)
    
    if (now < start) return { label: 'Upcoming', variant: 'default' as const }
    if (now > end) return { label: 'Ended', variant: 'secondary' as const }
    return { label: 'Live', variant: 'default' as const, className: 'bg-green-600' }
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6 p-4">
      {/* Edit Live Class Dialog */}
      {selectedLiveClass && (
        <EditLiveClass
          liveClass={selectedLiveClass}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">All Live Classes</h2>

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search title/description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select onValueChange={(v) => setMeetingPlatform(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="google-meet">Google Meet</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={isCancelled === undefined ? '' : isCancelled ? 'true' : 'false'}
          onValueChange={(v) => setIsCancelled(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Cancelled</SelectItem>
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

        <Select onValueChange={(v: any) => setSortByTime(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Platform</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && liveClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No live classes found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              liveClasses.map((liveClass: any, index: number) => {
                const status = getClassStatus(liveClass)
                return (
                  <TableRow
                    key={liveClass._id}
                    className={liveClass.isDeleted ? 'bg-red-50/50' : liveClass.isCancelled ? 'bg-orange-50/50' : ''}
                  >
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-50">
                        <div className="truncate font-medium">{liveClass.title}</div>
                        {liveClass.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {liveClass.description.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {liveClass.courseId?.title || 'N/A'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {liveClass.instructorId?.userId?.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getMeetingPlatformIcon(liveClass.meetingPlatform)}
                        <span className="capitalize text-sm">
                          {liveClass.meetingPlatform.replace('-', ' ')}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(liveClass.startTime)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(liveClass.endTime)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={status.variant}
                        className={status.className}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedLiveClass(liveClass)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        {!liveClass.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditClick(liveClass)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedLiveClass(liveClass)
                                setDeleteType('soft')
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}

                        {liveClass.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => restoreLiveClass(liveClass._id)}
                            >
                              <RotateCcw size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedLiveClass(liveClass)
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

      {/* ---------------- Pagination ---------------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} live classes
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

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6" />
              Live Class Details
            </DialogTitle>
          </DialogHeader>

          {selectedLiveClass && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge 
                    variant={getClassStatus(selectedLiveClass).variant}
                    className={getClassStatus(selectedLiveClass).className}
                  >
                    {getClassStatus(selectedLiveClass).label}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Video size={14} />
                    <span>Platform</span>
                  </div>
                  <span className="capitalize font-medium">
                    {selectedLiveClass.meetingPlatform.replace('-', ' ')}
                  </span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Recorded</span>
                  </div>
                  <Badge variant={selectedLiveClass.isRecorded ? 'default' : 'secondary'}>
                    {selectedLiveClass.isRecorded ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <XCircle size={14} />
                    <span>Cancelled</span>
                  </div>
                  <Badge variant={selectedLiveClass.isCancelled ? 'destructive' : 'secondary'}>
                    {selectedLiveClass.isCancelled ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Class Title
                  </h3>
                  <p className="text-lg font-semibold">{selectedLiveClass.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedLiveClass.courseId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedLiveClass.courseId?._id}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Section
                    </h3>
                    {selectedLiveClass.sectionId ? (
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-muted-foreground" />
                        <p>{selectedLiveClass.sectionId.title}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Instructor
                  </h3>
                  <div className="bg-muted/20 rounded p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedLiveClass.instructorId?.userId?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Instructor ID</p>
                        <p className="font-mono text-xs">{selectedLiveClass.instructorId?.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedLiveClass.description || 'No description provided'}
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
                      <span>{formatDate(selectedLiveClass.startTime)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      End Time
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedLiveClass.endTime)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Meeting Link
                  </h3>
                  {selectedLiveClass.meetingLink ? (
                    <a 
                      href={selectedLiveClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                    >
                      <LinkIcon size={16} />
                      {selectedLiveClass.meetingLink}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No meeting link provided</p>
                  )}
                </div>

                {selectedLiveClass.isRecorded && selectedLiveClass.recordingUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Recording URL
                    </h3>
                    <a 
                      href={selectedLiveClass.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                    >
                      <Video size={16} />
                      {selectedLiveClass.recordingUrl}
                    </a>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Class ID</p>
                      <p className="font-mono">{selectedLiveClass._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedLiveClass.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedLiveClass.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : 'Confirm Permanent Delete'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {deleteType === 'hard'
                ? 'This will permanently delete this live class. This action cannot be undone.'
                : 'This will move the live class to trash. You can restore it later from the deleted items.'}
            </p>

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
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {deleteType === 'hard' ? 'Permanently Delete' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}