/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchAttendance from '@/app/default/custom-component/useFetchAttendance'
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
  Eye,
  Calendar,
  Clock,
  BookOpen,
  Users,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

import EditAttendance from './EditAttendance'

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug?: string
}

interface LiveClass {
  _id: string
  title: string
  startTime: string
  endTime: string
  meetingPlatform?: string
}

interface Student {
  _id: string
  id: string
  userId?: {
    name: string
    email: string
  }
}

interface Attendance {
  _id: string
  courseId: Course
  liveClassId: LiveClass
  studentId: Student
  status: 'present' | 'absent' | 'late'
  joinedAt?: string
  leftAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages?: number
}

/* -------------------- Component -------------------- */

export default function AllAttendance() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState<string | undefined>()
  const [liveClassId, setLiveClassId] = useState<string | undefined>()
  const [studentId, setStudentId] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'joinedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ---------- Delete / Restore Dialog ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)

  /* ---------- Fetch Attendance ---------- */
  const { attendances, meta, isLoading, refetch } = useFetchAttendance({
    page,
    limit,
    courseId,
    liveClassId,
    studentId,
    status,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    search,
    sortBy,
    sortOrder,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedAttendance) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/attendance/soft/${selectedAttendance._id}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/attendance/hard/${selectedAttendance._id}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/attendance/restore/${selectedAttendance._id}`, { isDeleted: false })
      }

      setDeleteOpen(false)
      setSelectedAttendance(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedAttendance(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'Present', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-600' }
      case 'absent':
        return { label: 'Absent', variant: 'destructive' as const, icon: XCircle }
      case 'late':
        return { label: 'Late', variant: 'secondary' as const, icon: AlertCircle, className: 'bg-yellow-500' }
      default:
        return { label: status, variant: 'secondary' as const, icon: AlertCircle }
    }
  }

  const calculateDuration = (joinedAt?: string, leftAt?: string) => {
    if (!joinedAt || !leftAt) return '-'
    const join = new Date(joinedAt)
    const left = new Date(leftAt)
    const diffMs = left.getTime() - join.getTime()
    const diffMins = Math.round(diffMs / 60000)
    return `${diffMins} min`
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-4">
      {/* Edit Attendance Dialog */}
      {selectedAttendance && (
        <EditAttendance
          attendance={selectedAttendance}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">All Attendance Records</h2>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search by course, class or student"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Course ID"
          value={courseId || ''}
          onChange={(e) => setCourseId(e.target.value || undefined)}
        />

        <Input
          placeholder="Live Class ID"
          value={liveClassId || ''}
          onChange={(e) => setLiveClassId(e.target.value || undefined)}
        />

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
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
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="joinedAt">Join Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- Table ---------- */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Live Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Time</TableHead>
              <TableHead>Left Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && attendances.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              attendances.map((attendance: Attendance, index: number) => {
                const statusBadge = getStatusBadge(attendance.status)
                const StatusIcon = statusBadge.icon
                const duration = calculateDuration(attendance.joinedAt, attendance.leftAt)
                
                return (
                  <TableRow
                    key={attendance._id}
                    className={attendance.isDeleted ? 'bg-red-50/50' : ''}
                  >
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">
                        {attendance.studentId?.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attendance.studentId?.userId?.email || ''}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {attendance.studentId?.id || attendance.studentId?._id?.slice(-6)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {attendance.courseId?.title || 'N/A'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-37.5">
                        <div className="flex items-center gap-1">
                          <Video size={14} className="text-muted-foreground" />
                          <span className="truncate">{attendance.liveClassId?.title || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(attendance.liveClassId?.startTime)}
                        </div>
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
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(attendance.joinedAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(attendance.leftAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {duration}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedAttendance(attendance)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        {!attendance.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditClick(attendance)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedAttendance(attendance)
                                setDeleteType('soft')
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}

                        {attendance.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedAttendance(attendance)
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
                                setSelectedAttendance(attendance)
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
            {Math.min(page * meta.limit, meta.total)} of {meta.total} records
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Attendance Details
            </DialogTitle>
          </DialogHeader>

          {selectedAttendance && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge 
                    variant={getStatusBadge(selectedAttendance.status).variant}
                    className={getStatusBadge(selectedAttendance.status).className}
                  >
                    {getStatusBadge(selectedAttendance.status).label}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <span className="text-xl font-bold">
                    {calculateDuration(selectedAttendance.joinedAt, selectedAttendance.leftAt)}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Recorded</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(selectedAttendance.createdAt)}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                {/* Student Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Student Information
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedAttendance.studentId?.userId?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedAttendance.studentId?.userId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Student ID</p>
                        <p className="font-mono">{selectedAttendance.studentId?.id || selectedAttendance.studentId?._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course & Live Class */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedAttendance.courseId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedAttendance.courseId?._id}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Live Class
                    </h3>
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedAttendance.liveClassId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selectedAttendance.liveClassId?.startTime)}
                    </p>
                  </div>
                </div>

                {/* Attendance Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Joined At
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedAttendance.joinedAt)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Left At
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedAttendance.leftAt)}</span>
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
                      <p className="text-muted-foreground mb-1">Attendance ID</p>
                      <p className="font-mono">{selectedAttendance._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedAttendance.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedAttendance.updatedAt)}</p>
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
              {deleteType === 'soft' && 'This will move the attendance record to trash. You can restore it later from the deleted items.'}
              {deleteType === 'hard' && 'This will permanently delete this attendance record. This action cannot be undone!'}
              {deleteType === 'restore' && 'This will restore the attendance record from trash. It will be visible again.'}
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
              {deleteType === 'restore' && 'Restore Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}