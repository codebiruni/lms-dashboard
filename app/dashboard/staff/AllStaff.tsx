/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Image from 'next/image'

import useFetchStaffs from '@/app/default/custom-component/useFeatchStaff'
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
  Trash2,
  RotateCcw,
  User,
  PlusCircle,
  ClipboardList,
  AlertTriangle,
  Eye,
  Pencil,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react'

import EditStaff from './EditStaff'
import { toast } from 'sonner'

/* -------------------- Types -------------------- */



/* -------------------- Skeleton -------------------- */
function StaffTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded  lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
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

export default function AllStaff() {
  /* ---------------- Filters ---------------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------------- Selected ---------------- */
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  /* ---------------- Dialogs ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [assignOpen, setAssignOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  /* ---------------- Lead form ---------------- */
  const [leadName, setLeadName] = useState('')
  const [leadDescription, setLeadDescription] = useState('')
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  const { staffs, meta, isLoading, isFetching, refetch } = useFetchStaffs({
    page,
    limit,
    search,
    deleted: deleted === 'true',
    sortOrder,
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* ---------------- Remove task ---------------- */
  const handleRemoveTask = async (index: number) => {
    if (!selectedStaff) return

    setLoadingIndex(index)

    const updatedLeads = selectedStaff.assignedLeads.filter(
      (_: any, i: number) => i !== index
    )

    await PATCHDATA(`/v1/staff/${selectedStaff._id}`, {
      assignedLeads: updatedLeads,
    })

    refetch()
    setLoadingIndex(null)
  }

  /* ---------------- Toggle task completion ---------------- */
  const handleToggleTask = async (index: number) => {
    if (!selectedStaff) return

    setLoadingIndex(index)

    const updatedLeads = [...selectedStaff.assignedLeads]
    updatedLeads[index] = {
      ...updatedLeads[index],
      isCompleted: !updatedLeads[index].isCompleted,
    }

    await PATCHDATA(`/v1/staff/${selectedStaff._id}`, {
      assignedLeads: updatedLeads,
    })

    refetch()
    setLoadingIndex(null)
  }

  /* ---------------- Assign task ---------------- */
  const assignLead = async () => {
    if (!selectedStaff || !leadName) return

    const updatedLeads = [
      ...(selectedStaff.assignedLeads || []),
      {
        name: leadName,
        description: leadDescription,
        isCompleted: false,
      },
    ]

    await PATCHDATA(`/v1/staff/${selectedStaff._id}`, {
      assignedLeads: updatedLeads,
    })

    setAssignOpen(false)
    setLeadName('')
    setLeadDescription('')
    refetch()
  }

  /* ---------------- Confirm delete/restore ---------------- */
  const confirmAction = async () => {
    if (!selectedStaff) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/staff/restore/${selectedStaff._id}`
        successMessage = 'Staff restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/staff/hard/${selectedStaff._id}`
        successMessage = 'Staff permanently deleted'
      } else {
        url = `/v1/staff/soft/${selectedStaff._id}`
        successMessage = 'Staff moved to trash'
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
      setSelectedStaff(null)
    }
  }

  const handleEditClick = (staff: any) => {
    setSelectedStaff(staff)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedStaff(null)
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

  const completedTasks = (staff: any) => {
    return staff.assignedLeads?.filter((t: any) => t.isCompleted).length || 0
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <StaffTableSkeleton />

  return (
    <>
      {/* Edit Staff Dialog */}
      {selectedStaff && (
        <EditStaff
          staff={selectedStaff}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <Button asChild>
            <a href="/dashboard/staff/create">Add Staff</a>
          </Button>
        </div>

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name / ID / email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

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
            value={String(sortOrder)}
            onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Newest</SelectItem>
              <SelectItem value="1">Oldest</SelectItem>
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
                <TableHead>Staff</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Tasks</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {staffs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No staff found
                  </TableCell>
                </TableRow>
              )}

              {staffs.map((staff, i) => (
                <TableRow key={staff._id}>
                  <TableCell className="text-center font-medium">{getSerial(i)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {staff.userId?.image ? (
                        <div className="relative w-8 h-8 rounded  full overflow-hidden border">
                          <Image
                            src={staff.userId.image}
                            alt={staff.userId.name || 'Staff'}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded  full bg-muted flex items-center justify-center">
                          <User size={16} className="text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium">{staff.userId?.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {staff.id}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{staff.userId?.email || '—'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{staff.userId?.phone || '—'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {staff.assignedLeads?.length || 0}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="bg-green-50">
                      {completedTasks(staff)} / {staff.assignedLeads?.length || 0}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={staff.isDeleted ? 'destructive' : 'default'}>
                      {staff.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Details */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedStaff(staff)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>

                      {/* View tasks */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedStaff(staff)
                          setViewOpen(true)
                        }}
                        title="View Tasks"
                      >
                        <ClipboardList size={16} />
                      </Button>

                      {!staff.isDeleted ? (
                        <>
                          {/* Edit Staff */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(staff)}
                            title="Edit Staff"
                          >
                            <Pencil size={16} />
                          </Button>

                          {/* Assign tasks */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedStaff(staff)
                              setAssignOpen(true)
                            }}
                            title="Assign Task"
                          >
                            <PlusCircle size={16} />
                          </Button>

                          {/* Soft Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedStaff(staff)
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
                          {/* Restore */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setSelectedStaff(staff)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore Staff"
                          >
                            <RotateCcw size={16} />
                          </Button>

                          {/* Hard Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedStaff(staff)
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} staff
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

      {/* ---------------- View Tasks Dialog ---------------- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assigned Tasks for {selectedStaff?.userId?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {selectedStaff?.assignedLeads?.length ? (
              selectedStaff.assignedLeads.map((lead: any, i: number) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{lead.name}</p>
                      <Badge variant={lead.isCompleted ? 'default' : 'secondary'}>
                        {lead.isCompleted ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                    {lead.description && (
                      <p className="text-xs text-muted-foreground mt-1">{lead.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className={lead.isCompleted ? 'text-green-600' : 'text-muted-foreground'}
                      onClick={() => handleToggleTask(i)}
                      disabled={loadingIndex === i}
                    >
                      <CheckCircle size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRemoveTask(i)}
                      disabled={loadingIndex === i}
                    >
                      {loadingIndex === i ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks assigned yet
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Assign Lead Dialog ---------------- */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add New Task for {selectedStaff?.userId?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Task name *"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={leadDescription}
              onChange={(e) => setLeadDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignLead} disabled={!leadName}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5" />
              Staff Details
            </DialogTitle>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded  lg">
                {selectedStaff.userId?.image ? (
                  <div className="relative w-12 h-12 rounded  full overflow-hidden border">
                    <Image
                      src={selectedStaff.userId.image}
                      alt={selectedStaff.userId.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded  full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedStaff.userId?.name}</p>
                  <p className="text-xs text-muted-foreground">Staff ID: {selectedStaff.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{selectedStaff.userId?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{selectedStaff.userId?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p>{selectedStaff.userId?.role || 'staff'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={selectedStaff.userId?.status === 'active' ? 'default' : 'secondary'}>
                    {selectedStaff.userId?.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Verified</p>
                  <Badge variant={selectedStaff.userId?.isVerified ? 'default' : 'secondary'}>
                    {selectedStaff.userId?.isVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Tasks</p>
                  <p>{selectedStaff.assignedLeads?.length || 0} total, {completedTasks(selectedStaff)} completed</p>
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{formatDate(selectedStaff.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p>{formatDate(selectedStaff.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Staff ID</p>
                    <p className="font-mono">{selectedStaff._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="font-mono">{selectedStaff.userId?._id}</p>
                  </div>
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

      {/* ---------------- Delete/Restore Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Delete Staff?'
                : deleteType === 'hard'
                ? 'Permanently Delete Staff?'
                : 'Restore Staff?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This staff member will be moved to trash. You can restore them later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The staff member will be permanently deleted.'}
              {deleteType === 'restore' && 'The staff member will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded  lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove all staff data including assigned tasks.</span>
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
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}