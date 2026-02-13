/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchFollowUp from '@/app/default/custom-component/useFetchFollowUp'
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
  DialogDescription,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  User,
  BookOpen,
  FileText,
} from 'lucide-react'
import Image from 'next/image'
import EditFollowUp from './EditFollowUp'
import { toast } from 'sonner'

/* -------------------- Types -------------------- */

interface User {
  _id: string
  id: string
  name: string
  email: string
  phone?: string
  role: string
  image?: string
  status: string
}

interface Course {
  _id: string
  title: string
  slug?: string
}

interface FollowUp {
  _id: string
  user: User
  courseId?: Course
  note: string
  followUpDate: string
  status: 'requested' | 'approved' | 'will-try'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/* -------------------- SKELETON -------------------- */
function FollowUpTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Follow-Up Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* -------------------- Status Badge Component -------------------- */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
    requested: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    approved: { variant: 'default', className: 'bg-green-600' },
    'will-try': { variant: 'outline', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  }

  const config = variants[status] || { variant: 'secondary' }

  return (
    <Badge variant={config.variant} className={config.className}>
      {status === 'will-try' ? 'Will Try' : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

/* -------------------- Main Component -------------------- */

export default function AllFollowUp() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)

  /* ---------- Fetch FollowUps ---------- */
  const { followUps, meta, isLoading, isFetching, refetch } = useFetchFollowUp({
    page,
    limit,
    search,
    courseId,
    status,
    deleted: deleted === 'true',
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedFollowUp) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/follow-up/restore/${selectedFollowUp._id}`
        successMessage = 'Follow-up restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/follow-up/hard/${selectedFollowUp._id}`
        successMessage = 'Follow-up permanently deleted'
      } else {
        url = `/v1/follow-up/soft/${selectedFollowUp._id}`
        successMessage = 'Follow-up moved to trash'
      }

      const res = deleteType === 'restore'
        ? await PATCHDATA(url, { isDeleted: false })
        : await DELETEDATA(url)

      if (res.success) {
        toast.success(successMessage)
        refetch()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setDeleteOpen(false)
      setSelectedFollowUp(null)
    }
  }

  const handleEditClick = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedFollowUp(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * limit + index + 1
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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <FollowUpTableSkeleton />

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* Edit FollowUp Dialog */}
      {selectedFollowUp && (
        <EditFollowUp
          followUp={selectedFollowUp}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Follow-Ups</h2>
          <Button asChild>
            <a href="/dashboard/follow-up/create">Add Follow-Up</a>
          </Button>
        </div>

        {/* ---------- Filters ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Input
            placeholder="Course ID"
            value={courseId || ''}
            onChange={(e) => {
              setCourseId(e.target.value || undefined)
              setPage(1)
            }}
          />

          <Select
            value={status || 'all'}
            onValueChange={(v) => {
              setStatus(v === 'all' ? undefined : v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="will-try">Will Try</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={deleted}
            onValueChange={(v) => {
              setDeleted(v as 'true' | 'false')
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
          )}
        </div>

        {/* ---------- Table ---------- */}
        <div className="border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Follow-Up Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {followUps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No follow-ups found
                  </TableCell>
                </TableRow>
              )}

              {followUps.map((followUp: FollowUp, index: number) => {
                const upcoming = isUpcoming(followUp.followUpDate)
                return (
                  <TableRow key={followUp._id}>
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {followUp.user?.image ? (
                          <div className="relative w-8 h-8 rounded full overflow-hidden border">
                            <Image
                              src={followUp.user.image}
                              alt={followUp.user.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm">{followUp.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{followUp.user?.role}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {followUp.courseId ? (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-30">
                            {followUp.courseId.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-37.5">
                      <div className="truncate text-sm">{followUp.note}</div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(followUp.followUpDate)}</span>
                        </div>
                        {upcoming && !followUp.isDeleted && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={followUp.status} />
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(followUp.createdAt).split(',')[0]}
                    </TableCell>

                    <TableCell>
                      <Badge variant={followUp.isDeleted ? 'destructive' : 'secondary'}>
                        {followUp.isDeleted ? 'Deleted' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* View Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFollowUp(followUp)
                            setDetailsOpen(true)
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {!followUp.isDeleted ? (
                          <>
                            {/* Edit Button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(followUp)}
                              title="Edit Follow-Up"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Soft Delete Button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedFollowUp(followUp)
                                setDeleteType('soft')
                                setDeleteOpen(true)
                              }}
                              title="Move to Trash"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Restore Button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedFollowUp(followUp)
                                setDeleteType('restore')
                                setDeleteOpen(true)
                              }}
                              title="Restore Follow-Up"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>

                            {/* Hard Delete Button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedFollowUp(followUp)
                                setDeleteType('hard')
                                setDeleteOpen(true)
                              }}
                              title="Permanently Delete"
                            >
                              <XCircle className="h-4 w-4" />
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
        {meta.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} follow-ups
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Page {page} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Delete/Restore Dialog ---------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Delete Follow-Up?'
                : deleteType === 'hard'
                ? 'Permanently Delete Follow-Up?'
                : 'Restore Follow-Up?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This follow-up will be moved to trash. You can restore it later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The follow-up will be permanently deleted.'}
              {deleteType === 'restore' && 'The follow-up will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove this follow-up record.</span>
              </div>
            </div>
          )}

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
              {deleteType === 'restore' && 'Restore Follow-Up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Follow-Up Details
            </DialogTitle>
          </DialogHeader>

          {selectedFollowUp && (
            <div className="space-y-4 py-3">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                {selectedFollowUp.user?.image ? (
                  <div className="relative w-12 h-12 rounded full overflow-hidden border">
                    <Image
                      src={selectedFollowUp.user.image}
                      alt={selectedFollowUp.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedFollowUp.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedFollowUp.user?.email}</p>
                  <p className="text-xs text-muted-foreground">Role: {selectedFollowUp.user?.role} | ID: {selectedFollowUp.user?.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="col-span-2">
                    {selectedFollowUp.courseId?.title || 'No specific course'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="col-span-2">
                    <StatusBadge status={selectedFollowUp.status} />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <span className="col-span-2">{selectedFollowUp.note}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Follow-Up Date:</span>
                  <span className="col-span-2">{formatDate(selectedFollowUp.followUpDate)}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="col-span-2">{formatDate(selectedFollowUp.createdAt)}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="col-span-2">{formatDate(selectedFollowUp.updatedAt)}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="col-span-2 font-mono text-xs">{selectedFollowUp._id}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Deleted:</span>
                  <span className="col-span-2">
                    <Badge variant={selectedFollowUp.isDeleted ? 'destructive' : 'secondary'}>
                      {selectedFollowUp.isDeleted ? 'Yes' : 'No'}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}