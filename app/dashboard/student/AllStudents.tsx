/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Eye, Pencil, RotateCcw, Trash2, User } from 'lucide-react'
import Link from 'next/link'

import PATCHDATA from '@/app/default/functions/Patch'
import DELETEDATA from '@/app/default/functions/DeleteData'
import useFetchStudents, { Student } from '@/app/default/custom-component/useFeatchStudent'

/* -------------------- Constants -------------------- */
const sortOptions = [
  { label: 'Newest', value: '-1' },
  { label: 'Oldest', value: '1' },
]

/* -------------------- Component -------------------- */
export default function AllStudents() {
  /* ---------- Filters / State ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>(false)
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- Delete Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  /* ---------- Fetch Students ---------- */
  const { Students, meta, isLoading, refetch } = useFetchStudents({
    page,
    search,
    deleted,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */
  const updateStudent = async (id: string, payload: any) => {
    await PATCHDATA(`/v1/student/${id}`, payload)
    refetch()
  }

  const confirmDelete = async () => {
    if (!selectedStudentId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/student/soft/${selectedStudentId}`)
    } else {
      await DELETEDATA(`/v1/student/hard/${selectedStudentId}`)
    }

    setOpen(false)
    setSelectedStudentId(null)
    refetch()
  }

  const getSerialNumber = (index: number) => (page - 1) * meta.limit + index + 1

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by name / ID / bio"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
          <SelectTrigger><SelectValue placeholder="Deleted" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger><SelectValue placeholder="Sort Order" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead className="w-10">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading && Students.map((student: Student, index: number) => (
            <TableRow key={student._id}>
              <TableCell className="text-center">{getSerialNumber(index)}</TableCell>

              {/* Image */}
              <TableCell>
                <div className="flex items-center justify-center">
                  {student.userId?.image ? (
                    <div className="relative w-10 h-10 rounded full overflow-hidden border">
                      <Image src={student.userId.image} alt={student.userId.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded full bg-muted flex items-center justify-center border">
                      <User size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>{student.userId?.name}</TableCell>
              <TableCell>{student.id}</TableCell>

              <TableCell>
                <Badge variant={student.isDeleted ? 'destructive' : 'secondary'}>
                  {student.isDeleted ? 'Yes' : 'No'}
                </Badge>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                {/* View */}
                <Link href={`/dashboard/student/details/${student._id}`}>
                  <Button size="icon" variant="outline"><Eye size={16} /></Button>
                </Link>

                {/* Edit */}
                <Link href={`/dashboard/student/edit/${student._id}`}>
                  <Button size="icon" variant="outline"><Pencil size={16} /></Button>
                </Link>

                {/* Delete */}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setSelectedStudentId(student._id)
                    setDeleteType('soft')
                    setOpen(true)
                  }}
                >
                  {student.isDeleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}
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
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" disabled={page * meta.limit >= meta.total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft' ? 'Confirm Soft Delete' : 'Confirm Permanent Delete'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure? {deleteType === 'hard' && 'This action cannot be undone.'}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
