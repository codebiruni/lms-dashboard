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
  BookOpen,
  Layers,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileQuestion,
} from 'lucide-react'

import useFetchQuiz from '@/app/default/custom-component/useFetchQuiz'
import EditQuiz from './EditQuiz'

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

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

interface Quiz {
  _id: string
  courseId: Course
  sectionId?: Section
  title: string
  description: string
  totalMarks: number
  passMarks: number
  duration: number
  isPublished: boolean
  isDeleted: boolean
  questions: Question[]
  createdAt: string
  updatedAt: string
  __v: number
}


/* -------------------- Component -------------------- */

export default function AllQuiz() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [published, setPublished] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalMarks' | 'duration'>('createdAt')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  const {
    quizzes,
    meta,
    isLoading,
    refetch,
  } = useFetchQuiz({
    page,
    search,
    deleted,
    published,
    sortBy,
    sortOrder,
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

  const handleEditClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedQuiz(null)
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

  const calculatePassPercentage = (passMarks: number, totalMarks: number) => {
    if (totalMarks === 0) return 0
    return Math.round((passMarks / totalMarks) * 100)
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* Edit Quiz Dialog */}
      {selectedQuiz && (
        <EditQuiz
          quiz={selectedQuiz}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search quizzes"
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

        <Select onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="totalMarks">Total Marks</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">Newest/High</SelectItem>
            <SelectItem value="1">Oldest/Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Pass Marks</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
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
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
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
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No quizzes found
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz: any, index: number) => {
                const passPercentage = calculatePassPercentage(quiz.passMarks, quiz.totalMarks)
                return (
                  <TableRow key={quiz._id}>
                    <TableCell className="text-center">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="max-w-50">
                        <div className="truncate">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {quiz.description.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {quiz.courseId?.title}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {quiz.sectionId ? (
                        <div className="flex items-center gap-1">
                          <Layers size={14} className="text-muted-foreground" />
                          <span className="truncate max-w-30">
                            {quiz.sectionId.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award size={14} className="text-muted-foreground" />
                        <span className="font-medium">{quiz.totalMarks}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} className="text-muted-foreground" />
                          <span>{quiz.passMarks}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {passPercentage}% to pass
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span>{quiz.duration} min</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileQuestion size={12} />
                        {quiz.questions?.length || 0}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {quiz.isPublished ? (
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
                      <Badge variant={quiz.isDeleted ? 'destructive' : 'secondary'}>
                        {quiz.isDeleted ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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

                        {!quiz.isDeleted && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(quiz)}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}

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
            {Math.min(page * meta.limit, meta.total)} of {meta.total} quizzes
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileQuestion className="h-6 w-6" />
              Quiz Details
            </DialogTitle>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Published</span>
                  </div>
                  {selectedQuiz.isPublished ? (
                    <Badge variant="default" className="bg-green-600">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trash2 size={14} />
                    <span>Deleted</span>
                  </div>
                  <Badge variant={selectedQuiz.isDeleted ? 'destructive' : 'secondary'}>
                    {selectedQuiz.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FileQuestion size={14} />
                    <span>Questions</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedQuiz.questions?.length || 0}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedQuiz.duration} min
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Quiz Title
                  </h3>
                  <p className="text-lg font-semibold">{selectedQuiz.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <p className="font-medium">{selectedQuiz.courseId?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedQuiz.courseId?._id}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Section
                    </h3>
                    {selectedQuiz.sectionId ? (
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-muted-foreground" />
                        <p>{selectedQuiz.sectionId.title}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned (Course level)</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedQuiz.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Marks
                    </h3>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedQuiz.totalMarks}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Pass Marks
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedQuiz.passMarks}</span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {calculatePassPercentage(selectedQuiz.passMarks, selectedQuiz.totalMarks)}% to pass
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Duration
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedQuiz.duration}</span>
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle size={18} />
                    Questions ({selectedQuiz.questions?.length || 0})
                  </h3>
                  <div className="space-y-4">
                    {selectedQuiz.questions?.map((q: Question, idx: number) => (
                      <div key={q._id || idx} className="border rounded-lg p-4 bg-muted/10">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            Question {idx + 1}: {q.question}
                          </h4>
                          <Badge variant="outline">{q.marks} marks</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded text-sm ${
                                opt === q.correctAnswer
                                  ? 'bg-green-100 border-green-300 border dark:bg-green-900/20'
                                  : 'bg-muted/30'
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                              {opt === q.correctAnswer && (
                                <CheckCircle size={14} className="inline ml-2 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Quiz ID</p>
                      <p className="font-mono">{selectedQuiz._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedQuiz.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedQuiz.updatedAt)}</p>
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
                ? 'This will permanently delete this quiz and all its questions. This action cannot be undone.'
                : 'This will move the quiz to trash. You can restore it later from the deleted items.'}
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