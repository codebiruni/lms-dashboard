'use client'

import  { useState } from 'react'
import Link from 'next/link'

import useFetchQuizSubmission from '@/app/default/custom-component/useFetchQuizSubmission'
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
import { Eye, Trash2, RotateCcw } from 'lucide-react'

/* -------------------- Component -------------------- */

export default function AllQuizSubmission() {
  /* ---------- filters ---------- */
  const [page, setPage] = useState(1)
  const [quizId, setQuizId] = useState<string | undefined>()
  const [userId, setUserId] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<boolean | undefined>()

  /* ---------- delete dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    submissions,
    meta,
    isLoading,
    refetch,
  } = useFetchQuizSubmission({
    page,
    quizId,
    userId,
    deleted,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/quiz-submission/soft/${selectedId}`)
    } else {
      await DELETEDATA(`/v1/quiz-submission/hard/${selectedId}`)
    }

    setOpen(false)
    setSelectedId(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Filter by Quiz ID"
          onChange={(e) => setQuizId(e.target.value || undefined)}
        />

        <Input
          placeholder="Filter by User ID"
          onChange={(e) => setUserId(e.target.value || undefined)}
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
      </div>

      {/* ---------------- Table ---------------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Quiz Title</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Attempt</TableHead>
            <TableHead>Total Marks</TableHead>
            <TableHead>Obtained</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            submissions.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>
                  {item.quizId?.title || 'N/A'}
                </TableCell>

                <TableCell>
                  {item.userId?.name || 'Unknown'}
                </TableCell>

                <TableCell>
                  {item.attemptNumber}
                </TableCell>

                <TableCell>
                  {item.totalMarks}
                </TableCell>

                <TableCell>
                  {item.obtainedMarks}
                </TableCell>

                <TableCell>
                  <Badge variant={item.isPassed ? 'default' : 'destructive'}>
                    {item.isPassed ? 'Passed' : 'Failed'}
                  </Badge>
                </TableCell>

                <TableCell>
                  {new Date(item.submittedAt).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge variant={item.isDeleted ? 'destructive' : 'secondary'}>
                    {item.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/quiz-submission/details/${item._id}`}>
                    <Button size="icon" variant="outline">
                      <Eye size={16} />
                    </Button>
                  </Link>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setSelectedId(item._id)
                      setDeleteType('soft')
                      setOpen(true)
                    }}
                  >
                    {item.isDeleted ? (
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
            Are you sure? This action{' '}
            {deleteType === 'hard' && 'cannot be undone'}.
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
