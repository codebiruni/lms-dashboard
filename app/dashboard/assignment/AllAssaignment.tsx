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
import { Skeleton } from '@/components/ui/skeleton'

import {
  Eye,
  Trash2,
  RotateCcw,
  Pencil,
  Calendar,
  Award,
  BookOpen,
  Layers,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Clock,
} from 'lucide-react'
import useFetchAssignments from '@/app/default/custom-component/useFetchAssignment'
import EditAssignment from './EditAssignment'

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug: string
}

interface Section {
  _id: string
  title: string
  course: string
}

interface Lesson {
  _id: string
  title: string
  courseSection: string
}

interface Assignment {
  _id: string
  courseId: Course
  sectionId?: Section
  lessonId?: Lesson
  title: string
  description: string
  totalMarks: number
  dueDate: string
  isPublished: boolean
  isDeleted: boolean
  submissions: any[]
  createdAt: string
  updatedAt: string
  __v: number
}



/* -------------------- Component -------------------- */

export default function AllAssignment() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [published, setPublished] = useState<boolean | undefined>()

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const {
    assignments,
    meta,
    isLoading,
    refetch,
  } = useFetchAssignments({
    page,
    search,
    deleted,
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

  const handleEditClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedAssignment(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
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

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: 'Overdue', variant: 'destructive' as const, days: Math.abs(diffDays) }
    } else if (diffDays === 0) {
      return { text: 'Today', variant: 'warning' as const, days: 0 }
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, variant: 'default' as const, days: diffDays }
    } else {
      return { text: `${diffDays} days left`, variant: 'secondary' as const, days: diffDays }
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* Edit Assignment Dialog */}
      {selectedAssignment && (
        <EditAssignment
          assignment={selectedAssignment}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Input
          placeholder="Search assignments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select 
          value={published === undefined ? '' : published ? 'true' : 'false'}
          onValueChange={(v) => setPublished(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={deleted === undefined ? '' : deleted ? 'true' : 'false'}
          onValueChange={(v) => setDeleted(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Deleted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Section/Lesson</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Skeleton loaders
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment: any, index: number) => {
                const dueStatus = formatDueDate(assignment.dueDate)
                return (
                  <TableRow key={assignment._id}>
                    <TableCell className="text-center">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="max-w-50">
                        <div className="truncate">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {assignment.description.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {assignment.courseId?.title}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {assignment.sectionId && (
                          <div className="flex items-center gap-1 text-xs">
                            <Layers size={12} className="text-muted-foreground" />
                            <span className="truncate max-w-25">
                              {assignment.sectionId.title}
                            </span>
                          </div>
                        )}
                        {assignment.lessonId && (
                          <div className="flex items-center gap-1 text-xs">
                            <FileText size={12} className="text-muted-foreground" />
                            <span className="truncate max-w-25">
                              {assignment.lessonId.title}
                            </span>
                          </div>
                        )}
                        {!assignment.sectionId && !assignment.lessonId && (
                          <span className="text-xs text-muted-foreground">Course level</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award size={14} className="text-muted-foreground" />
                        <span className="font-medium">{assignment.totalMarks}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-xs">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge 
                          variant={dueStatus.variant === 'warning' ? 'default' : dueStatus.variant}
                          className={dueStatus.variant === 'warning' ? 'bg-orange-500' : ''}
                        >
                          {dueStatus.text}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users size={12} />
                        {assignment.submissions?.length || 0}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {assignment.isPublished ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle size={12} className="mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle size={12} className="mr-1" />
                          No
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={assignment.isDeleted ? 'destructive' : 'secondary'}>
                        {assignment.isDeleted ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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

                        {!assignment.isDeleted && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(assignment)}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}

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
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------------- Pagination ---------------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} assignments
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page * meta.limit >= meta.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Assignment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Published</span>
                  </div>
                  {selectedAssignment.isPublished ? (
                    <Badge variant="default" className="bg-green-600">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trash2 size={14} />
                    <span>Deleted</span>
                  </div>
                  <Badge variant={selectedAssignment.isDeleted ? 'destructive' : 'secondary'}>
                    {selectedAssignment.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users size={14} />
                    <span>Submissions</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedAssignment.submissions?.length || 0}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Assignment Title
                  </h3>
                  <p className="text-lg font-semibold">{selectedAssignment.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedAssignment.courseId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedAssignment.courseId?._id}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Marks
                    </h3>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedAssignment.totalMarks}</span>
                    </div>
                  </div>
                </div>

                {selectedAssignment.sectionId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Section
                    </h3>
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-muted-foreground" />
                      <p>{selectedAssignment.sectionId.title}</p>
                    </div>
                  </div>
                )}

                {selectedAssignment.lessonId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Lesson
                    </h3>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground" />
                      <p>{selectedAssignment.lessonId.title}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedAssignment.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Due Date
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(selectedAssignment.dueDate)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Badge 
                        className={formatDueDate(selectedAssignment.dueDate).variant === 'warning' ? 'bg-orange-500' : ''}
                      >
                        {formatDueDate(selectedAssignment.dueDate).text}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created At
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{formatDate(selectedAssignment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Submissions List (if any) */}
                {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Recent Submissions
                    </h3>
                    <div className="bg-muted/20 rounded p-3 max-h-37.5 overflow-y-auto">
                      {selectedAssignment.submissions.slice(0, 5).map((sub: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="text-sm">Student #{idx + 1}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {selectedAssignment.submissions.length > 5 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{selectedAssignment.submissions.length - 5} more submissions
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Assignment ID</p>
                      <p className="font-mono">{selectedAssignment._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedAssignment.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {deleteType === 'hard'
                ? 'This will permanently delete this assignment. All submissions will also be deleted. This action cannot be undone.'
                : 'This will move the assignment to trash. You can restore it later from the deleted items.'}
            </p>

            <div className="flex items-center space-x-2">
              <Select
                value={deleteType}
                onValueChange={(v: any) => setDeleteType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Delete type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft Delete</SelectItem>
                  <SelectItem value="hard">Hard Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              {deleteType === 'hard' ? 'Permanently Delete' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}