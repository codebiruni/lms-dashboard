/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import useFetchQuestion from '@/app/default/custom-component/useFetchQuestion'
import DELETEDATA from '@/app/default/functions/DeleteData'
import PATCHDATA from '@/app/default/functions/Patch'

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
  DialogDescription,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageIcon,
  FileText,
  CheckCircle,
} from 'lucide-react'

import EditQuestion from './EditQuestion'
import { toast } from 'sonner'

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
}

interface CourseSection {
  _id: string
  title: string
}

interface SingleQuestion {
  question: string
  isTrue?: boolean
  marks: number
}

interface Question {
  _id: string
  courseId: Course
  courseSection: CourseSection
  title: string
  description?: string
  type: 'true-false' | 'written'
  questions: SingleQuestion[]
  images: string[]
  totalMarks: number
  passMarks: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}



/* -------------------- SKELETON -------------------- */
function QuestionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* -------------------- Main Component -------------------- */

export default function AllQuestions() {
  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')
  const [sortOrder, setSortOrder] = useState<'1' | '-1'>('-1')
  const [courseId, setCourseId] = useState<string | undefined>()
  const [courseSection, setCourseSection] = useState<string | undefined>()

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  const {
    questions,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useFetchQuestion({
    page,
    limit,
    search,
    courseId,
    courseSection,
    deleted: deleted === 'true',
    sortOrder: Number(sortOrder),
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* -------------------- Handlers -------------------- */

  const handleDelete = async () => {
    if (!selectedQuestion) return

    try {
      const url = deleteType === 'hard'
        ? `/v1/question/hard/${selectedQuestion._id}`
        : `/v1/question/soft/${selectedQuestion._id}`

      const res = await DELETEDATA(url)

      if (res.success) {
        toast.success(
          deleteType === 'hard'
            ? 'Question permanently deleted'
            : 'Question moved to trash'
        )
        refetch()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setDeleteOpen(false)
      setSelectedQuestion(null)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      const res = await PATCHDATA(`/v1/question/restore/${id}`, { isDeleted: false })
      if (res.success) {
        toast.success('Question restored successfully')
        refetch()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore')
    }
  }

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedQuestion(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * limit + index + 1
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

  const getTypeIcon = (type: string) => {
    return type === 'written' ? (
      <FileText className="h-4 w-4 text-blue-500" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    )
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <QuestionsTableSkeleton />

  /* -------------------- UI -------------------- */
  return (
    <>
      {/* Edit Question Dialog */}
      {selectedQuestion && (
        <EditQuestion
          question={selectedQuestion}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Questions</h2>
          <Button asChild>
            <Link href="/dashboard/question/create">
              Add Question
            </Link>
          </Button>
        </div>

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Input
            placeholder="Course ID"
            value={courseId || ''}
            onChange={(e) => {
              setCourseId(e.target.value || undefined)
              setPage(1)
            }}
          />

          <Input
            placeholder="Section ID"
            value={courseSection || ''}
            onChange={(e) => {
              setCourseSection(e.target.value || undefined)
              setPage(1)
            }}
          />

          <Select
            value={deleted}
            onValueChange={(v) => {
              setDeleted(v as 'true' | 'false')
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Deleted Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as '1' | '-1')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Newest First</SelectItem>
              <SelectItem value="1">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
          )}
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No questions found
                  </TableCell>
                </TableRow>
              )}

              {questions.map((question: any, index: number) => (
                <TableRow key={question._id}>
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className="max-w-50">
                      <div className="truncate font-medium">{question.title}</div>
                      {question.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {question.description.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {question.courseId?.title || 'N/A'}
                  </TableCell>

                  <TableCell>
                    {question.courseSection?.title || 'N/A'}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(question.type)}
                      <Badge variant="outline" className="capitalize">
                        {question.type}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{question.totalMarks}</span>
                        <span className="text-xs text-muted-foreground ml-1">total</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pass: {question.passMarks}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {question.images && question.images.length > 0 ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={question.images[0]}
                          alt="question"
                          fill
                          className="object-cover rounded border"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={question.isDeleted ? 'destructive' : 'default'}>
                      {question.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedQuestion(question)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!question.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(question)}
                            title="Edit Question"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setDeleteType('soft')
                              setDeleteOpen(true)
                            }}
                            title="Delete Question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Restore Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleRestore(question._id)}
                            title="Restore Question"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setDeleteType('hard')
                              setDeleteOpen(true)
                            }}
                            title="Permanently Delete"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ---------------- Pagination ---------------- */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} questions
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Page {page} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft' ? 'Delete Question?' : 'Permanently Delete Question?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft'
                ? 'This question will be moved to trash. You can restore it later.'
                : 'This action cannot be undone. The question will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {deleteType === 'hard' && (
              <div className="p-3 bg-destructive/10 rounded flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will remove all associated data.</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleteType === 'soft' ? 'Move to Trash' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Question Details
            </DialogTitle>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-6 py-4">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FileText size={14} />
                    <span>Type</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {selectedQuestion.type}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Total Marks</span>
                  </div>
                  <span className="text-2xl font-bold">{selectedQuestion.totalMarks}</span>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Pass Marks</span>
                  </div>
                  <span className="text-2xl font-bold">{selectedQuestion.passMarks}</span>
                </div>
              </div>

              {/* Images */}
              {selectedQuestion.images && selectedQuestion.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedQuestion.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded overflow-hidden border">
                        <Image
                          src={img}
                          alt={`Question image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                  <p className="font-medium">{selectedQuestion.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm bg-muted/20 rounded p-3">
                    {selectedQuestion.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Course</h3>
                    <p>{selectedQuestion.courseId?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedQuestion.courseId?._id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Section</h3>
                    <p>{selectedQuestion.courseSection?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedQuestion.courseSection?._id}</p>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Questions ({selectedQuestion.questions.length})</h3>
                <div className="space-y-3">
                  {selectedQuestion.questions.map((q, idx) => (
                    <div key={idx} className="border rounded p-3 bg-muted/10">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">Q{idx + 1}: {q.question}</p>
                        <Badge variant="outline">{q.marks} marks</Badge>
                      </div>
                      {selectedQuestion.type === 'true-false' && (
                        <Badge variant={q.isTrue ? 'default' : 'destructive'} className="mt-1">
                          {q.isTrue ? 'True' : 'False'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Question ID</p>
                    <p className="font-mono">{selectedQuestion._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p>{formatDate(selectedQuestion.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Updated</p>
                    <p>{formatDate(selectedQuestion.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedQuestion.isDeleted ? 'destructive' : 'default'}>
                      {selectedQuestion.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}