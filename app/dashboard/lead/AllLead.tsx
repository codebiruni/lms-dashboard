/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchLead from '@/app/default/custom-component/useFetchLead'
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
  Mail,
  User,
  FileText,
} from 'lucide-react'

import EditLead from './EditLead'
import { toast } from 'sonner'

/* -------------------- Types -------------------- */

interface Lead {
  _id: string
  name: string
  email?: string
  description?: string
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'
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
function LeadTableSkeleton() {
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
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
    new: { variant: 'default', className: 'bg-blue-600' },
    contacted: { variant: 'secondary', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    qualified: { variant: 'default', className: 'bg-green-600' },
    lost: { variant: 'destructive' },
    converted: { variant: 'default', className: 'bg-emerald-600' },
  }

  const config = variants[status] || { variant: 'secondary' }

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

/* -------------------- Main Component -------------------- */

export default function AllLead() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  /* ---------- Fetch Leads ---------- */
  const { leads, meta, isLoading, isFetching, refetch } = useFetchLead({
    page,
    limit,
    search,
    status,
    deleted: deleted === 'true',
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedLead) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/lead/restore/${selectedLead._id}`
        successMessage = 'Lead restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/lead/hard/${selectedLead._id}`
        successMessage = 'Lead permanently deleted'
      } else {
        url = `/v1/lead/soft/${selectedLead._id}`
        successMessage = 'Lead moved to trash'
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
      setSelectedLead(null)
    }
  }

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedLead(null)
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

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <LeadTableSkeleton />

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* Edit Lead Dialog */}
      {selectedLead && (
        <EditLead
          lead={selectedLead}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Leads</h2>
          <Button asChild>
            <a href="/dashboard/lead/create">Add Lead</a>
          </Button>
        </div>

        {/* ---------- Filters ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              )}

              {leads.map((lead: Lead, index: number) => (
                <TableRow key={lead._id}>
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{lead.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {lead.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.email}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                

                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.createdAt).split(',')[0]}
                  </TableCell>

                  <TableCell>
                    <Badge variant={lead.isDeleted ? 'destructive' : 'secondary'}>
                      {lead.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedLead(lead)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!lead.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(lead)}
                            title="Edit Lead"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Soft Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedLead(lead)
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
                              setSelectedLead(lead)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore Lead"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedLead(lead)
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ---------- Pagination ---------- */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} leads
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
                ? 'Delete Lead?'
                : deleteType === 'hard'
                ? 'Permanently Delete Lead?'
                : 'Restore Lead?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This lead will be moved to trash. You can restore it later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The lead will be permanently deleted.'}
              {deleteType === 'restore' && 'The lead will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove this lead record.</span>
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
              {deleteType === 'restore' && 'Restore Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Lead Details
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">{selectedLead.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="col-span-2">{selectedLead.email || '—'}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="col-span-2">
                    <StatusBadge status={selectedLead.status} />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="col-span-2 bg-muted/20 rounded p-2">
                    {selectedLead.description || 'No description provided'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="col-span-2">{formatDate(selectedLead.createdAt)}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="col-span-2">{formatDate(selectedLead.updatedAt)}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="col-span-2 font-mono text-xs">{selectedLead._id}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Deleted:</span>
                  <span className="col-span-2">
                    <Badge variant={selectedLead.isDeleted ? 'destructive' : 'secondary'}>
                      {selectedLead.isDeleted ? 'Yes' : 'No'}
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