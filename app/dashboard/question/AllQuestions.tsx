'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import useFetchQuestion from '@/app/default/custom-component/useFetchQuestion'
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
import { Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react'

/* -------------------- Component -------------------- */

export default function AllQuestions() {
  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>(false)
  const [sortOrder, setSortOrder] = useState<number>(1)

  /* ---------- Delete Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    questions,
    meta,
    isLoading,
    refetch,
  } = useFetchQuestion({
    page,
    search,
    deleted,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/question/soft/${selectedId}`)
    } else {
      await DELETEDATA(`/v1/question/hard/${selectedId}`)
    }

    setOpen(false)
    setSelectedId(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 20) + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search question title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
          <SelectTrigger>
            <SelectValue placeholder="Deleted Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Oldest</SelectItem>
            <SelectItem value="-1">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Total Marks</TableHead>
            <TableHead>Pass Marks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            questions.map((question, index) => (
              <TableRow key={question._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{question.title}</TableCell>

                <TableCell>
                  {question.courseId?.title || 'N/A'}
                </TableCell>

                <TableCell>
                  {question.courseSection?.title || 'N/A'}
                </TableCell>

                <TableCell>
                  {question.totalMarks || 0}
                </TableCell>

                <TableCell>
                  {question.passMarks || 0}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      question.isDeleted ? 'destructive' : 'secondary'
                    }
                  >
                    {question.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </TableCell>

                <TableCell>
                  {question?.images && question.images.length > 0 ? (
                    <div className="relative w-12 h-12">
                      <Image
                        src={question.images[0]}
                        alt="question"
                        fill
                        className="object-cover rounded border"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No Image
                    </span>
                  )}
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/question/details/${question._id}`}>
                    <Button size="icon" variant="outline">
                      <Eye size={16} />
                    </Button>
                  </Link>

                  <Link href={`/dashboard/question/edit/${question._id}`}>
                    <Button size="icon" variant="outline">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setSelectedId(question._id)
                      setDeleteType('soft')
                      setOpen(true)
                    }}
                  >
                    {question.isDeleted ? (
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
      <div className="flex justify-between items-center">
        <p>Total: {meta.total}</p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage((p) => p + 1)}
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
            Are you sure you want to delete this question?
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
