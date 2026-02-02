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
import useFetchAssignments from '@/app/default/custom-component/useFetchAssignment'


/* -------------------- Component -------------------- */

export default function AllAssignment() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

  const {
    assignments,
    meta,
    isLoading,
    refetch,
  } = useFetchAssignments({
    page,
    search,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedAssignment) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/assignment/soft/${selectedAssignment._id}`)
    } else {
      await DELETEDATA(`/v1/assignment/hard/${selectedAssignment._id}`)
    }

    setDeleteOpen(false)
    setSelectedAssignment(null)
    refetch()
  }

  const restoreAssignment = async (id: string) => {
    await PATCHDATA(`/v1/assignment/${id}`, { isDeleted: false })
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
          placeholder="Search assignments"
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
            <TableHead>Lesson</TableHead>
            <TableHead>Total Marks</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            assignments.map((assignment: any, index: number) => (
              <TableRow key={assignment._id}>
                <TableCell className="text-center">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{assignment.title}</TableCell>

                <TableCell>{assignment.courseId?.title}</TableCell>

                <TableCell>
                  {assignment.sectionId?.title || 'N/A'}
                </TableCell>

                <TableCell>
                  {assignment.lessonId?.title || 'N/A'}
                </TableCell>

                <TableCell>{assignment.totalMarks}</TableCell>

                <TableCell>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {assignment.submissions?.length || 0}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={assignment.isPublished ? 'default' : 'secondary'}>
                    {assignment.isPublished ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={assignment.isDeleted ? 'destructive' : 'secondary'}>
                    {assignment.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedAssignment(assignment)
                      setDetailsOpen(true)
                    }}
                  >
                    <Eye size={16} />
                  </Button>

                  {assignment.isDeleted ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => restoreAssignment(assignment._id)}
                    >
                      <RotateCcw size={16} />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedAssignment(assignment)
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
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-3 text-sm">
              <p><b>Title:</b> {selectedAssignment.title}</p>
              <p><b>Description:</b> {selectedAssignment.description}</p>
              <p><b>Course:</b> {selectedAssignment.courseId?.title}</p>
              <p><b>Section:</b> {selectedAssignment.sectionId?.title}</p>
              <p><b>Lesson:</b> {selectedAssignment.lessonId?.title}</p>
              <p><b>Total Marks:</b> {selectedAssignment.totalMarks}</p>
              <p>
                <b>Due Date:</b>{' '}
                {new Date(selectedAssignment.dueDate).toLocaleString()}
              </p>
              <p>
                <b>Submissions:</b>{' '}
                {selectedAssignment.submissions?.length || 0}
              </p>
              <p>
                <b>Published:</b>{' '}
                {selectedAssignment.isPublished ? 'Yes' : 'No'}
              </p>
              <p>
                <b>Created At:</b>{' '}
                {new Date(selectedAssignment.createdAt).toLocaleString()}
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
            This will {deleteType === 'hard' ? 'permanently delete' : 'soft delete'} the assignment.
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
