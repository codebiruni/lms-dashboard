/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'

import useFetchQuizSubmission from '@/app/default/custom-component/useFetchQuizSubmission'
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
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Award,
  FileQuestion,
  Clock,
  BarChart,
} from 'lucide-react'
import EditQuizSubmission from './EditQuizSubmission'


/* -------------------- Types -------------------- */



interface User {
  _id: string
  name: string
  email: string
  id?: string
}

interface Answer {
  selectedOptions: string[]
  writtenAnswer: string
  obtainedMarks: number
}

interface QuizSubmission {
  _id: string
  quizId: any
  userId: User
  attemptNumber: number
  answers: Answer[]
  totalMarks: number
  obtainedMarks: number
  isPassed: boolean
  isDeleted: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
  __v: number
}



/* -------------------- Component -------------------- */

export default function AllQuizSubmission() {
  /* ---------- filters ---------- */
  const [page, setPage] = useState(1)
  const [quizId, setQuizId] = useState<string | undefined>()
  const [userId, setUserId] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [isPassed, setIsPassed] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState<'submittedAt' | 'obtainedMarks' | 'attemptNumber'>('submittedAt')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null)

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
    isPassed,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedSubmission) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/quiz-submission/soft/${selectedSubmission._id}`)
    } else {
      await DELETEDATA(`/v1/quiz-submission/hard/${selectedSubmission._id}`)
    }

    setDeleteOpen(false)
    setSelectedSubmission(null)
    refetch()
  }

  const restoreSubmission = async (id: string) => {
    await PATCHDATA(`/v1/quiz-submission/${id}`, { isDeleted: false })
    refetch()
  }

  const handleEditClick = (submission: QuizSubmission) => {
    setSelectedSubmission(submission)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedSubmission(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
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

  const getPercentage = (obtained: number, total: number) => {
    if (total === 0) return 0
    return Math.round((obtained / total) * 100)
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* Edit Quiz Submission Dialog */}
      {selectedSubmission && (
        <EditQuizSubmission
          submission={selectedSubmission}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Quiz ID"
          value={quizId || ''}
          onChange={(e) => setQuizId(e.target.value || undefined)}
        />

        <Input
          placeholder="User ID"
          value={userId || ''}
          onChange={(e) => setUserId(e.target.value || undefined)}
        />

        <Select 
          value={isPassed === undefined ? '' : isPassed ? 'true' : 'false'}
          onValueChange={(v) => setIsPassed(v === 'true' ? true : v === 'false' ? false : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="true">Passed</SelectItem>
            <SelectItem value="false">Failed</SelectItem>
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
            <SelectItem value="submittedAt">Submission Date</SelectItem>
            <SelectItem value="obtainedMarks">Marks Obtained</SelectItem>
            <SelectItem value="attemptNumber">Attempt Number</SelectItem>
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
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Quiz Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Attempt</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Submitted At</TableHead>
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
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No quiz submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission: any, index: number) => {
                const percentage = getPercentage(submission.obtainedMarks, submission.totalMarks)
                return (
                  <TableRow key={submission._id}>
                    <TableCell className="text-center font-medium">
                      {getSerialNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-50">
                        <div className="truncate font-medium">
                          {submission.quizId?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {submission.quizId?._id?.slice(-6) || ''}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-30">
                          {submission.userId?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {submission.userId?.email || ''}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BarChart size={12} />
                        Attempt #{submission.attemptNumber}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Award size={14} className="text-muted-foreground" />
                          <span className="font-medium">{submission.obtainedMarks}</span>
                          <span className="text-xs text-muted-foreground">/ {submission.totalMarks}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      {submission.isPassed ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle size={12} className="mr-1" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle size={12} className="mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={submission.isDeleted ? 'destructive' : 'secondary'}>
                        {submission.isDeleted ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        {!submission.isDeleted && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(submission)}
                          >
                            <Award size={16} />
                          </Button>
                        )}

                        {submission.isDeleted ? (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => restoreSubmission(submission._id)}
                          >
                            <RotateCcw size={16} />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSubmission(submission)
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
            Showing {(page - 1) * (meta.limit || 10) + 1} to{' '}
            {Math.min(page * (meta.limit || 10), meta.total)} of {meta.total} submissions
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
              disabled={page * (meta.limit || 10) >= meta.total}
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
              Quiz Submission Details
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Result</span>
                  </div>
                  {selectedSubmission.isPassed ? (
                    <Badge variant="default" className="bg-green-600">Passed</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BarChart size={14} />
                    <span>Attempt</span>
                  </div>
                  <span className="text-xl font-bold">
                    #{selectedSubmission.attemptNumber}
                  </span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Award size={14} />
                    <span>Marks</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedSubmission.obtainedMarks}/{selectedSubmission.totalMarks}
                  </span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span>Percentage</span>
                  </div>
                  <span className="text-xl font-bold">
                    {getPercentage(selectedSubmission.obtainedMarks, selectedSubmission.totalMarks)}%
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Quiz Title
                    </h3>
                    <p className="font-semibold">{selectedSubmission.quizId?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quiz ID: {selectedSubmission.quizId?._id}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Pass Marks
                    </h3>
                    <p className="font-semibold">{selectedSubmission.quizId?.passMarks || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    User Information
                  </h3>
                  <div className="bg-muted/20 rounded p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedSubmission.userId?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedSubmission.userId?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="font-mono text-xs">{selectedSubmission.userId?._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Submission Time
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>{formatDate(selectedSubmission.submittedAt)}</span>
                  </div>
                </div>

                {/* Answers Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Answers ({selectedSubmission.answers?.length || 0})
                  </h3>
                  <div className="space-y-4">
                    {selectedSubmission.answers?.map((answer: Answer, idx: number) => {
                      const quizQuestion = selectedSubmission.quizId?.questions?.[idx]
                      return (
                        <div key={idx} className="border rounded p-4 bg-muted/10">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              Question {idx + 1}: {quizQuestion?.question || `Question ${idx + 1}`}
                            </h4>
                            <Badge 
                              variant={answer.obtainedMarks > 0 ? 'default' : 'secondary'}
                              className={answer.obtainedMarks > 0 ? 'bg-green-600' : ''}
                            >
                              {answer.obtainedMarks} / {quizQuestion?.marks || 0} marks
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Selected Answer:</p>
                              <div className="p-2 bg-muted/30 rounded text-sm">
                                {answer.selectedOptions?.length > 0 
                                  ? answer.selectedOptions.join(', ') 
                                  : answer.writtenAnswer || 'No answer provided'}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Correct Answer:</p>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-sm">
                                {quizQuestion?.correctAnswer || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Submission ID</p>
                      <p className="font-mono">{selectedSubmission._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedSubmission.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedSubmission.updatedAt)}</p>
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
                ? 'This will permanently delete this quiz submission. This action cannot be undone.'
                : 'This will move the quiz submission to trash. You can restore it later from the deleted items.'}
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