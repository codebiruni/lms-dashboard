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
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import {
  Eye,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react'

/* -------------------- Constants -------------------- */

const approvalStatuses = ['pending', 'approved', 'rejected']
const sortFields = [
  { label: 'Join Date', value: 'joinDate' },
  { label: 'Salary', value: 'selery' },
]

/* -------------------- Component -------------------- */

export default function AllInstructor() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [approvalStatus, setApprovalStatus] =
    useState<'pending' | 'approved' | 'rejected' | undefined>()
  const [deleted, setDeleted] = useState<boolean>(false)
  const [sortBy, setSortBy] =
    useState<'joinDate' | 'selery'>('joinDate')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- delete dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] =
    useState<'soft' | 'hard'>('soft')
  const [selectedInstructorId, setSelectedInstructorId] =
    useState<string | null>(null)

  const {
    instructors,
    meta,
    isLoading,
    refetch,
  } = useFetchInstructors({
    page,
    search,
    approvalStatus,
    deleted,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const updateInstructor = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/instructor/${id}`, payload)
    refetch()
  }

  const confirmDelete = async () => {
    if (!selectedInstructorId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/instructor/soft/${selectedInstructorId}`)
    } else {
      await DELETEDATA(`/v1/instructor/hard/${selectedInstructorId}`)
    }

    setOpen(false)
    setSelectedInstructorId(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search bio / expertise / ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) =>
          setApprovalStatus(v as any)
        }>
          <SelectTrigger>
            <SelectValue placeholder="Approval Status" />
          </SelectTrigger>
          <SelectContent>
            {approvalStatuses.map(s => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) =>
          setDeleted(v === 'true')
        }>
          <SelectTrigger>
            <SelectValue placeholder="Deleted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={sortBy}
          onValueChange={(v) =>
            setSortBy(v as 'joinDate' | 'selery')
          }
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
          defaultValue={String(sortOrder)}
          onValueChange={(v) =>
            setSortOrder(v === '1' ? 1 : -1)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Order" />
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
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading && instructors.map((ins, index) => (
            <TableRow key={ins._id}>
              <TableCell className="text-center">
                {getSerialNumber(index)}
              </TableCell>

              <TableCell>
                {ins.userId?.image ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                    <Image
                      src={ins.userId.image}
                      alt={ins.userId.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                    <User size={18} />
                  </div>
                )}
              </TableCell>

              <TableCell>{ins.userId?.name}</TableCell>
              <TableCell>{ins.id}</TableCell>

              <TableCell>
                <Select
                  defaultValue={ins.approvalStatus}
                  onValueChange={(v) =>
                    updateInstructor(ins._id, { approvalStatus: v })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalStatuses.map(s => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>{ins.totalStudents}</TableCell>
              <TableCell>{ins.totalCourses}</TableCell>
              <TableCell>{ins.selery}</TableCell>

              <TableCell>
                <Badge variant={ins.isDeleted ? 'destructive' : 'secondary'}>
                  {ins.isDeleted ? 'Yes' : 'No'}
                </Badge>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                <Link href={`/dashboard/instructor/details/${ins._id}`}>
                  <Button size="icon" variant="outline">
                    <Eye size={16} />
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setSelectedInstructorId(ins._id)
                    setDeleteType(ins.isDeleted ? 'hard' : 'soft')
                    setOpen(true)
                  }}
                >
                  {ins.isDeleted
                    ? <RotateCcw size={16} />
                    : <Trash2 size={16} />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ---------------- Pagination ---------------- */}
      <div className="flex justify-between items-center">
        <p>Total: {meta.total}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : 'Confirm Permanent Delete'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure? {deleteType === 'hard' && 'This cannot be undone.'}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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
