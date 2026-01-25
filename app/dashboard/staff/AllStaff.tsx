/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import  { useState } from 'react'
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
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'

import {
  Trash2,
  RotateCcw,
  User,
  PlusCircle,
  ClipboardList,
} from 'lucide-react'

/* -------------------- Component -------------------- */

export default function AllStaff() {
  /* ---------------- Filters ---------------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>(false)
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------------- Selected Staff ---------------- */
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  /* ---------------- Dialogs ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  /* ---------------- Lead form ---------------- */
  const [leadName, setLeadName] = useState('')
  const [leadDescription, setLeadDescription] = useState('')

  const { staffs, meta, isLoading, refetch } = useFetchStaffs({
    page,
    search,
    deleted,
    sortOrder,
  })

    const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  /* -------- Remove single task -------- */
  const handleRemoveTask = async (index: number) => {
    try {
      setLoadingIndex(index)

      const updatedLeads = selectedStaff.assignedLeads.filter(
        (_: any, i: number) => i !== index
      )

      await PATCHDATA(`/v1/staff/${selectedStaff._id}`, {
        assignedLeads: updatedLeads,
      })

      refetch()
    } catch (error) {
      console.error('Failed to remove task', error)
    } finally {
      setLoadingIndex(null)
    }
  }

  /* ---------------- Handlers ---------------- */

  const confirmDelete = async () => {
    if (!selectedStaff) return

    await DELETEDATA(
      selectedStaff.isDeleted
        ? `/v1/staff/hard/${selectedStaff._id}`
        : `/v1/staff/soft/${selectedStaff._id}`
    )

    setDeleteOpen(false)
    setSelectedStaff(null)
    refetch()
  }

  /** ✅ APPEND lead instead of overwrite */
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
    setSelectedStaff(null)
    refetch()
  }

  const getSerialNumber = (index: number) =>
    (page - 1) * meta.limit + index + 1

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by Staff ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={String(deleted)}
          onValueChange={(v) => setDeleted(v === 'true')}
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
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            staffs.map((staff, index) => (
              <TableRow key={staff._id}>
                <TableCell>{getSerialNumber(index)}</TableCell>

                <TableCell className="flex items-center gap-2">
                  {staff.userId?.image ? (
                    <Image
                      src={staff.userId.image}
                      alt={staff.userId.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  {staff.userId?.name}
                </TableCell>

                <TableCell>{staff.id}</TableCell>
                <TableCell>{staff.userId?.email}</TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {staff.assignedLeads?.length || 0}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={staff.isDeleted ? 'destructive' : 'secondary'}>
                    {staff.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  {/* View tasks */}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedStaff(staff)
                      setViewOpen(true)
                    }}
                  >
                    <ClipboardList size={16} />
                  </Button>

                  {/* Add task */}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedStaff(staff)
                      setAssignOpen(true)
                    }}
                  >
                    <PlusCircle size={16} />
                  </Button>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setSelectedStaff(staff)
                      setDeleteOpen(true)
                    }}
                  >
                    {staff.isDeleted ? (
                      <RotateCcw size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* ---------------- Pagination ---------------- */}
      <div className="flex justify-between">
        <p>Total: {meta.total}</p>
        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <Button
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- View Assigned Leads ---------------- */}
       <Dialog open={viewOpen} onOpenChange={setViewOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assigned Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {selectedStaff?.assignedLeads?.length ? (
            selectedStaff.assignedLeads.map((lead: any, i: number) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{lead.name}</p>
                  {lead.description && (
                    <p className="text-xs text-muted-foreground">
                      {lead.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={lead.isCompleted ? 'default' : 'secondary'}>
                    {lead.isCompleted ? 'Done' : 'Pending'}
                  </Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={loadingIndex === i}
                    onClick={() => handleRemoveTask(i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks assigned yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>

      {/* ---------------- Assign Lead Dialog ---------------- */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Task name"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
          />

          <Input
            placeholder="Description (optional)"
            value={leadDescription}
            onChange={(e) => setLeadDescription(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignLead}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
