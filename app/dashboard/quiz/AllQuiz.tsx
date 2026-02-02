/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'

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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'

import {
  Eye,
  Trash2,
  RotateCcw,
} from 'lucide-react'

import useFetchQuiz from '@/app/default/custom-component/useFetchQuiz'

/* -------------------- Component -------------------- */

export default function AllQuiz() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)

  const {
    quizzes,
    meta,
    isLoading,
    refetch,
  } = useFetchQuiz({
    page,
    search,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedQuiz) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/quez/soft/${selectedQuiz._id}`)
    } else {
      await DELETEDATA(`/v1/quez/hard/${selectedQuiz._id}`)
    }

    setDeleteOpen(false)
    setSelectedQuiz(null)
    refetch()
  }

  const restoreQuiz = async (id: string) => {
    await PATCHDATA(`/v1/quez/${id}`, { isDeleted: false })
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Search quizzes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <TableHead>Questions</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            quizzes.map((quiz: any, index: number) => (
              <TableRow key={quiz._id}>
                <TableCell className="text-center">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{quiz.title}</TableCell>

                <TableCell>
                  {typeof quiz.courseId === 'object'
                    ? quiz.courseId?.title
                    : 'N/A'}
                </TableCell>

                <TableCell>
                  {typeof quiz.sectionId === 'object'
                    ? quiz.sectionId?.title
                    : 'N/A'}
                </TableCell>

                <TableCell>{quiz.totalMarks}</TableCell>

                <TableCell>{quiz.passMarks}</TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {quiz.questions?.length || 0}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                    {quiz.isPublished ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={quiz.isDeleted ? 'destructive' : 'secondary'}>
                    {quiz.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedQuiz(quiz)
                      setDetailsOpen(true)
                    }}
                  >
                    <Eye size={16} />
                  </Button>

                  {quiz.isDeleted ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => restoreQuiz(quiz._id)}
                    >
                      <RotateCcw size={16} />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedQuiz(quiz)
                        setDeleteType('soft')
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
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

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quiz Details</DialogTitle>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-3 text-sm">
              <p><b>Title:</b> {selectedQuiz.title}</p>
              <p><b>Description:</b> {selectedQuiz.description}</p>

              <p>
                <b>Course:</b>{' '}
                {selectedQuiz.courseId?.title}
              </p>

              <p>
                <b>Section:</b>{' '}
                {selectedQuiz.sectionId?.title}
              </p>

              <p><b>Total Marks:</b> {selectedQuiz.totalMarks}</p>
              <p><b>Pass Marks:</b> {selectedQuiz.passMarks}</p>
              <p><b>Duration:</b> {selectedQuiz.duration} minutes</p>

              <p>
                <b>Questions:</b>{' '}
                {selectedQuiz.questions?.length}
              </p>

              <p>
                <b>Published:</b>{' '}
                {selectedQuiz.isPublished ? 'Yes' : 'No'}
              </p>

              <p>
                <b>Created At:</b>{' '}
                {new Date(selectedQuiz.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This will {deleteType === 'hard' ? 'permanently delete' : 'soft delete'} the quiz.
          </p>

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
