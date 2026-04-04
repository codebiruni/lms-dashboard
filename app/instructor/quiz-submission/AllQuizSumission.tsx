/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'

import useFetchQuizSubmission from '@/app/default/custom-component/useFetchQuizSubmission'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Award,
  FileQuestion,
  Clock,
  BarChart,
  BookOpen,
  Mail,
  Hash,
  TrendingUp,
} from 'lucide-react'

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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null)

  const {
    submissions,
    meta,
    isLoading,
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
      {/* ---------------- Filters ---------------- */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* ---------------- Stats Cards ---------------- */}
      {!isLoading && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{meta.total}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded full">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.isPassed).length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {submissions.filter(s => !s.isPassed).length}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded full">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      submissions.reduce((acc, s) => 
                        acc + (s.obtainedMarks / s.totalMarks * 100), 0
                      ) / submissions.length
                    )}%
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------- Submissions Grid ---------------- */}
      {isLoading ? (
        // Skeleton loaders
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No quiz submissions found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((submission: any, index: number) => {
            const percentage = getPercentage(submission.obtainedMarks, submission.totalMarks)
            return (
              <Card key={submission._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base line-clamp-1">
                      {submission.quizId?.title || 'Untitled Quiz'}
                    </CardTitle>
                    <Badge variant={submission.isDeleted ? 'destructive' : 'secondary'} className="ml-2">
                      #{getSerialNumber(index)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* User Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{submission.userId?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <span className="truncate text-muted-foreground">{submission.userId?.email || ''}</span>
                    </div>
                  </div>

                  {/* Quiz Details */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-1">
                      <Hash size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Attempt:</span>
                      <span className="text-sm font-medium">#{submission.attemptNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Award size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Marks:</span>
                      <span className="text-sm font-medium">
                        {submission.obtainedMarks}/{submission.totalMarks}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <BarChart size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Score:</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Date:</span>
                      <span className="text-xs truncate">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
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
                    
                    {submission.isDeleted && (
                      <Badge variant="destructive">
                        Deleted
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/5 pt-4">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setSelectedSubmission(submission)
                      setDetailsOpen(true)
                    }}
                  >
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* ---------------- Pagination ---------------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center mt-6">
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
                            
                            {/* <div>
                              <p className="text-xs text-muted-foreground mb-1">Correct Answer:</p>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-sm">
                                {quizQuestion?.correctAnswer || 'N/A'}
                              </div>
                            </div> */}
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

          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}