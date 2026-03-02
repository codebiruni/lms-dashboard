/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'
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
  Trash2,
  RotateCcw,
  User,
  DollarSign,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Award,
  Briefcase,
  Pencil,
} from 'lucide-react'

import EditInstructor from './EditInstructor'
import { toast } from 'sonner'

/* -------------------- Constants -------------------- */

const approvalStatuses = ['pending', 'approved', 'rejected']
const sortFields = [
  { label: 'Join Date', value: 'joinDate' },
  { label: 'Salary', value: 'selery' },
  { label: 'Name', value: 'name' },
]

/* -------------------- Skeleton -------------------- */
function InstructorTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded  lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded  full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
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

/* -------------------- Component -------------------- */

export default function AllInstructor() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')
  const [sortBy, setSortBy] = useState<'joinDate' | 'selery' | 'name'>('joinDate')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null)

  const {
    instructors,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useFetchInstructors({
    page,
    limit,
    search,
    approvalStatus,
    deleted: deleted === 'true',
    sortBy,
    sortOrder,
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* -------------------- Handlers -------------------- */

  const updateInstructor = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/instructor/${id}`, payload)
    refetch()
  }

  const confirmAction = async () => {
    if (!selectedInstructor) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/instructor/restore/${selectedInstructor._id}`
        successMessage = 'Instructor restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/instructor/hard/${selectedInstructor._id}`
        successMessage = 'Instructor permanently deleted'
      } else {
        url = `/v1/instructor/soft/${selectedInstructor._id}`
        successMessage = 'Instructor moved to trash'
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
      setSelectedInstructor(null)
    }
  }

  const handleEditClick = (instructor: any) => {
    setSelectedInstructor(instructor)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedInstructor(null)
    refetch()
  }

  const getSerial = (i: number) => (page - 1) * limit + i + 1

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <InstructorTableSkeleton />

  /* -------------------- UI -------------------- */

  return (
    <>
      {/* Edit Instructor Dialog */}
      {selectedInstructor && (
        <EditInstructor
          instructor={selectedInstructor}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Instructors</h2>
          <Button asChild>
            <Link href="/dashboard/instructor/create">Add Instructor</Link>
          </Button>
        </div>

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={approvalStatus || 'all'}
            onValueChange={(v) => {
              setApprovalStatus(v === 'all' ? undefined : v as any)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Approval Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {approvalStatuses.map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
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
              <SelectValue placeholder="Deleted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortFields.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(sortOrder)}
            onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Newest / Highest</SelectItem>
              <SelectItem value="1">Oldest / Lowest</SelectItem>
            </SelectContent>
          </Select>

          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
          )}
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="border rounded  lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead className="w-10">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {instructors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No instructors found
                  </TableCell>
                </TableRow>
              )}

              {instructors.map((ins: any, i: number) => (
                <TableRow key={ins._id}>
                  <TableCell className="text-center font-medium">{getSerial(i)}</TableCell>

                  <TableCell>
                    {ins.userId?.image ? (
                      <div className="relative w-10 h-10 rounded  full overflow-hidden border">
                        <Image
                          src={ins.userId.image}
                          alt={ins.userId.name || 'Instructor'}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded  full bg-muted flex items-center justify-center border">
                        <User size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">{ins.userId?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {ins.id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{ins.userId?.email || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="truncate text-sm">{ins.expertise || '—'}</div>
                  </TableCell>

                  <TableCell>
                    <Select
                      defaultValue={ins.approvalStatus}
                      onValueChange={(v) =>
                        updateInstructor(ins._id, { approvalStatus: v })
                      }
                      disabled={ins.isDeleted}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {approvalStatuses.map(s => (
                          <SelectItem key={s} value={s}>
                            <Badge
                              variant={
                                s === 'approved' ? 'default' :
                                s === 'rejected' ? 'destructive' : 'secondary'
                              }
                              className="w-full"
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-muted-foreground" />
                      <Input
                        className="w-20 h-8 text-sm"
                        defaultValue={ins.selery}
                        onBlur={(e) =>
                          updateInstructor(ins._id, {
                            selery: Number(e.target.value),
                          })
                        }
                        disabled={ins.isDeleted}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={ins.isDeleted ? 'destructive' : 'default'}>
                      {ins.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedInstructor(ins)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>

                      {!ins.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(ins)}
                            title="Edit Instructor"
                          >
                            <Pencil size={16} />
                          </Button>

                          {/* Soft Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedInstructor(ins)
                              setDeleteType('soft')
                              setDeleteOpen(true)
                            }}
                            title="Move to Trash"
                          >
                            <Trash2 size={16} />
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
                              setSelectedInstructor(ins)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore Instructor"
                          >
                            <RotateCcw size={16} />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedInstructor(ins)
                              setDeleteType('hard')
                              setDeleteOpen(true)
                            }}
                            title="Permanently Delete"
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ---------------- Pagination ---------------- */}
        {meta.total > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} instructors
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Delete/Restore Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Delete Instructor?'
                : deleteType === 'hard'
                ? 'Permanently Delete Instructor?'
                : 'Restore Instructor?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This instructor will be moved to trash. You can restore them later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The instructor will be permanently deleted.'}
              {deleteType === 'restore' && 'The instructor will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded  lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove all instructor data including courses.</span>
              </div>
            </div>
          )}

          {deleteType !== 'restore' && (
            <div className="py-2">
              <Select
                value={deleteType}
                onValueChange={(v: any) => setDeleteType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Delete type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft Delete (Move to trash)</SelectItem>
                  <SelectItem value="hard">Hard Delete (Permanently)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Instructor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              Instructor Details
            </DialogTitle>
          </DialogHeader>

          {selectedInstructor && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded  full overflow-hidden border">
                  {selectedInstructor.userId?.image ? (
                    <Image
                      src={selectedInstructor.userId.image}
                      alt={selectedInstructor.userId.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User size={30} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedInstructor.userId?.name}</h3>
                  <Badge variant="outline" className="font-mono mt-1">{selectedInstructor.id}</Badge>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Award size={14} />
                    <span>Approval</span>
                  </div>
                  <Badge
                    variant={
                      selectedInstructor.approvalStatus === 'approved' ? 'default' :
                      selectedInstructor.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className={
                      selectedInstructor.approvalStatus === 'approved' ? 'bg-green-600' : ''
                    }
                  >
                    {selectedInstructor.approvalStatus}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign size={14} />
                    <span>Salary</span>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(selectedInstructor.selery || 0)}</span>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Join Date</span>
                  </div>
                  <span className="text-sm">{formatDate(selectedInstructor.joinDate)}</span>
                </div>
                <div className="bg-muted/30 rounded  lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase size={14} />
                    <span>Courses</span>
                  </div>
                  <span className="text-xl font-bold">{selectedInstructor.totalCourses || 0}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInstructor.userId?.email || '—'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInstructor.userId?.phone || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                <div className="bg-muted/20 rounded  lg p-3">
                  <p className="text-sm">{selectedInstructor.bio || 'No bio provided'}</p>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Expertise</h3>
                <div className="bg-muted/20 rounded  lg p-3">
                  <p className="text-sm">{selectedInstructor.expertise || 'Not specified'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Students</h3>
                  <p className="text-2xl font-bold">{selectedInstructor.totalStudents || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Courses</h3>
                  <p className="text-2xl font-bold">{selectedInstructor.totalCourses || 0}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Instructor ID</p>
                    <p className="font-mono">{selectedInstructor._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">User ID</p>
                    <p className="font-mono">{selectedInstructor.userId?._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p>{formatDate(selectedInstructor.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Updated</p>
                    <p>{formatDate(selectedInstructor.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedInstructor.isDeleted ? 'destructive' : 'default'}>
                      {selectedInstructor.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}