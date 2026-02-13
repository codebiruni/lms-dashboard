/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchEnrollment from '@/app/default/custom-component/useFetchEnrollment'
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
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import EditEnrollment from './EditEnrollment'

/* -------------------- Types -------------------- */

interface Student {
  _id: string
  id: string
  bio?: string
  userId?: {
    name: string
    email: string
  }
  image?: string
}

interface Course {
  _id: string
  title: string
  slug?: string
}

interface Enrollment {
  _id: string
  student: Student
  course: Course
  enrollmentStatus: 'active' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  totalAmount: number
  paidAmount: number
  dueAmount: number
  progress: number
  enrollmentDate: string
  completedAt?: string
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

export default function AllEnrollment() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [studentId, setStudentId] = useState<string | undefined>()
  const [courseId, setCourseId] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'progress' | 'totalAmount'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ---------- Delete / Restore Dialog ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  /* ---------- Fetch Enrollments ---------- */
  const { enrollments, meta, isLoading, refetch } = useFetchEnrollment({
    page,
    limit,
    search,
    student: studentId,
    course: courseId,
    status,
    paymentStatus,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    sortBy,
    sortOrder: sortOrder === 'asc' ? 1 : -1,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedEnrollment) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/enrollment/soft/${selectedEnrollment._id}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/enrollment/hard/${selectedEnrollment._id}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/enrollment/restore/${selectedEnrollment._id}`, { isDeleted: false })
      }

      setDeleteOpen(false)
      setSelectedEnrollment(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedEnrollment(null)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-600' }
      case 'completed':
        return { label: 'Completed', variant: 'default' as const, icon: CheckCircle, className: 'bg-blue-600' }
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle }
      default:
        return { label: status, variant: 'secondary' as const, icon: XCircle }
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', variant: 'default' as const, className: 'bg-green-600' }
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const }
      case 'failed':
        return { label: 'Failed', variant: 'destructive' as const }
      default:
        return { label: status, variant: 'secondary' as const }
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-4">
      {/* Edit Enrollment Dialog */}
      {selectedEnrollment && (
        <EditEnrollment
          enrollment={selectedEnrollment}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">Enrollments</h2>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Input
          placeholder="Search by student/course"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Student ID"
          value={studentId || ''}
          onChange={(e) => setStudentId(e.target.value || undefined)}
        />

        <Input
          placeholder="Course ID"
          value={courseId || ''}
          onChange={(e) => setCourseId(e.target.value || undefined)}
        />

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setPaymentStatus(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={isDeleted === undefined ? 'all' : isDeleted ? 'true' : 'false'}
          onValueChange={(v) => {
            if (v === 'all') setIsDeleted(undefined)
            else setIsDeleted(v === 'true')
          }}
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
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="totalAmount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- Table ---------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Enrollment Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Amounts</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No enrollments found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              enrollments.map((enrollment: any, index: number) => {
                const statusBadge = getStatusBadge(enrollment.enrollmentStatus)
                const paymentBadge = getPaymentBadge(enrollment.paymentStatus)
                return (
                  <TableRow
                    key={enrollment._id}
                    className={enrollment.isDeleted ? 'bg-red-50/50' : ''}
                  >
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {enrollment.student?.image && (
                          <div className="relative w-10 h-10 rounded full overflow-hidden border shrink-0">
                            <Image
                              src={enrollment.student.image}
                              alt={enrollment.student.id || 'Student'}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{enrollment.student?.userId?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{enrollment.student?.bio || ''}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {enrollment.student?.id || enrollment.student?._id?.slice(-6)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {enrollment.course?.title || 'N/A'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={statusBadge.variant}
                        className={statusBadge.className}
                      >
                        {statusBadge.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={paymentBadge.variant}
                        className={paymentBadge.className}
                      >
                        {paymentBadge.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign size={14} className="text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(enrollment.totalAmount)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Paid: {formatCurrency(enrollment.paidAmount)} | Due: {formatCurrency(enrollment.dueAmount)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-muted-foreground" />
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={enrollment.isDeleted ? 'destructive' : 'secondary'}>
                        {enrollment.isDeleted ? 'Deleted' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedEnrollment(enrollment)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        {!enrollment.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditClick(enrollment)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setSelectedEnrollment(enrollment)
                                setDeleteType('soft')
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}

                        {enrollment.isDeleted && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedEnrollment(enrollment)
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
                                setSelectedEnrollment(enrollment)
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
            {Math.min(page * meta.limit, meta.total)} of {meta.total} enrollments
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
              Enrollment Details
            </DialogTitle>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Status</span>
                  </div>
                  <Badge 
                    variant={getStatusBadge(selectedEnrollment.enrollmentStatus).variant}
                    className={getStatusBadge(selectedEnrollment.enrollmentStatus).className}
                  >
                    {getStatusBadge(selectedEnrollment.enrollmentStatus).label}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign size={14} />
                    <span>Payment</span>
                  </div>
                  <Badge 
                    variant={getPaymentBadge(selectedEnrollment.paymentStatus).variant}
                    className={getPaymentBadge(selectedEnrollment.paymentStatus).className}
                  >
                    {getPaymentBadge(selectedEnrollment.paymentStatus).label}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp size={14} />
                    <span>Progress</span>
                  </div>
                  <span className="text-xl font-bold">{selectedEnrollment.progress}%</span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Enrolled</span>
                  </div>
                  <span className="text-sm">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                {/* Student Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Student Information
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <div className="flex gap-4">
                      {selectedEnrollment.student?.image && (
                        <div className="relative w-16 h-16 rounded full overflow-hidden border">
                          <Image
                            src={selectedEnrollment.student.image}
                            alt={selectedEnrollment.student.id || 'Student'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedEnrollment.student?.userId?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Student ID</p>
                          <p className="font-mono">{selectedEnrollment.student?.id || selectedEnrollment.student?._id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bio</p>
                          <p className="text-sm">{selectedEnrollment.student?.bio || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Course Information
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Course Title</p>
                        <p className="font-medium">{selectedEnrollment.course?.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Course ID</p>
                        <p className="font-mono">{selectedEnrollment.course?._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Details
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(selectedEnrollment.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paid Amount</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedEnrollment.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Amount</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(selectedEnrollment.dueAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Course Progress
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-bold">{selectedEnrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded full" 
                          style={{ width: `${selectedEnrollment.progress}%` }}
                        />
                      </div>
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
                      <p className="text-muted-foreground mb-1">Enrollment ID</p>
                      <p className="font-mono">{selectedEnrollment._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedEnrollment.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedEnrollment.updatedAt)}</p>
                    </div>
                    {selectedEnrollment.completedAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Completed At</p>
                        <p>{formatDate(selectedEnrollment.completedAt)}</p>
                      </div>
                    )}
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
              {deleteType === 'soft' && 'This will move the enrollment record to trash. You can restore it later from the deleted items.'}
              {deleteType === 'hard' && 'This will permanently delete this enrollment record. This action cannot be undone!'}
              {deleteType === 'restore' && 'This will restore the enrollment record from trash. It will be visible again.'}
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
              {deleteType === 'restore' && 'Restore Enrollment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}