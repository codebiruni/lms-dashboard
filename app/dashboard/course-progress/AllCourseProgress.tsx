/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchCourseProgress from '@/app/default/custom-component/useFetchCourseProgress'
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
import { Progress } from '@/components/ui/progress'

import {
  RotateCcw,
  Trash2,
  Pencil,
  Eye,
  Calendar,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
} from 'lucide-react'

import EditCourseProgress from './EditCourseProgress'

/* -------------------- Types -------------------- */

interface Student {
  _id: string
  id: string
  userId?: {
    name: string
    email: string
  }
}

interface Course {
  _id: string
  title: string
  slug?: string
}

interface Lesson {
  _id: string
  title: string
  lessonType: string
  duration?: number
}

interface CourseProgress {
  _id: string
  student: Student
  course: Course
  completedLessons: Lesson[]
  totalLessons: number
  progressPercentage: number
  isCompleted: boolean
  completedAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages?: number
}

/* -------------------- Component -------------------- */

export default function AllCourseProgress() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [studentId, setStudentId] = useState<string | undefined>()
  const [courseId, setCourseId] = useState<string | undefined>()
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>()
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false)
  const [sortBy, setSortBy] = useState<'progressPercentage' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ---------- Delete / Restore Dialog ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedProgress, setSelectedProgress] = useState<CourseProgress | null>(null)

  /* ---------- Fetch Course Progress ---------- */
  const { progress, meta, isLoading, refetch } = useFetchCourseProgress({
    page,
    limit,
    student: studentId,
    course: courseId,
    isCompleted,
    isDeleted: isDeleted === undefined ? false : isDeleted,
    search,
    sortBy,
    sortOrder,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedProgress) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/course-progress/soft/${selectedProgress._id}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/course-progress/hard/${selectedProgress._id}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/course-progress/restore/${selectedProgress._id}`, { isDeleted: false })
      }

      setDeleteOpen(false)
      setSelectedProgress(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = (progress: CourseProgress) => {
    setSelectedProgress(progress)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedProgress(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-4">
      {/* Edit Course Progress Dialog */}
      {selectedProgress && (
        <EditCourseProgress
          progress={selectedProgress}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <h2 className="text-2xl font-bold">Course Progress</h2>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search by student or course"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Student ID"
          value={studentId || ''}
          onChange={(e) => setStudentId(e.target.value || undefined)}
        />

        <Input
          placeholder="Course ID"
          value={courseId || ''}
          onChange={(e) => setCourseId(e.target.value || undefined)}
        />

        <Select 
          value={isCompleted === undefined ? 'all' : isCompleted ? 'true' : 'false'}
          onValueChange={(v) => {
            if (v === 'all') setIsCompleted(undefined)
            else setIsCompleted(v === 'true')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Completed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Completed</SelectItem>
            <SelectItem value="false">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={isDeleted === undefined ? 'all' : isDeleted ? 'true' : 'false'}
          onValueChange={(v) => {
            if (v === 'all') setIsDeleted(undefined)
            else setIsDeleted(v === 'true')
          }}
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
            <SelectItem value="progressPercentage">Progress</SelectItem>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- Table ---------- */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!isLoading && progress.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No course progress records found
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              progress.map((item: CourseProgress, index: number) => (
                <TableRow
                  key={item._id}
                  className={item.isDeleted ? 'bg-red-50/50' : ''}
                >
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {item.student?.userId?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.student?.userId?.email || ''}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {item.student?.id || item.student?._id?.slice(-6)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} className="text-muted-foreground" />
                      <span className="truncate max-w-37.5">
                        {item.course?.title || 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 min-w-30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.progressPercentage}%</span>
                        <span className="text-muted-foreground">
                          {item.completedLessons?.length || 0}/{item.totalLessons || 0}
                        </span>
                      </div>
                      <Progress 
                        value={item.progressPercentage} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.isCompleted ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle size={12} className="mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <TrendingUp size={12} className="mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={item.isDeleted ? 'destructive' : 'secondary'}>
                      {item.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedProgress(item)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye size={16} />
                      </Button>

                      {!item.isDeleted && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}

                      {item.isDeleted ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setSelectedProgress(item)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                          >
                            <RotateCcw size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedProgress(item)
                              setDeleteType('hard')
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setSelectedProgress(item)
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
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ---------- Pagination ---------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} records
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

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6" />
              Course Progress Details
            </DialogTitle>
          </DialogHeader>

          {selectedProgress && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp size={14} />
                    <span>Progress</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {selectedProgress.progressPercentage}%
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpen size={14} />
                    <span>Lessons</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {selectedProgress.completedLessons?.length || 0}/{selectedProgress.totalLessons || 0}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle size={14} />
                    <span>Completed</span>
                  </div>
                  <Badge 
                    variant={selectedProgress.isCompleted ? 'default' : 'secondary'}
                    className={selectedProgress.isCompleted ? 'bg-green-600' : ''}
                  >
                    {selectedProgress.isCompleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span>Completed At</span>
                  </div>
                  <span className="text-sm">
                    {formatDate(selectedProgress.completedAt) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                {/* Student Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Student Information
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedProgress.student?.userId?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedProgress.student?.userId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Student ID</p>
                        <p className="font-mono">{selectedProgress.student?.id || selectedProgress.student?._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Course Information
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Course Title</p>
                        <p className="font-medium">{selectedProgress.course?.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Course ID</p>
                        <p className="font-mono">{selectedProgress.course?._id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Lessons</p>
                        <p className="font-medium">{selectedProgress.totalLessons || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Lessons */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Completed Lessons ({selectedProgress.completedLessons?.length || 0})
                  </h3>
                  {selectedProgress.completedLessons && selectedProgress.completedLessons.length > 0 ? (
                    <div className="bg-muted/20 rounded-lg p-4 max-h-50 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedProgress.completedLessons.map((lesson: any, idx: number) => (
                          <div key={lesson._id || idx} className="flex items-center justify-between p-2 bg-background rounded border">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-600" />
                              <span className="text-sm font-medium">{lesson.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {lesson.lessonType}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No completed lessons</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Progress Overview
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-bold">{selectedProgress.progressPercentage}%</span>
                      </div>
                      <Progress 
                        value={selectedProgress.progressPercentage} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Completed: {selectedProgress.completedLessons?.length || 0}</span>
                        <span>Remaining: {(selectedProgress.totalLessons || 0) - (selectedProgress.completedLessons?.length || 0)}</span>
                        <span>Total: {selectedProgress.totalLessons || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Progress ID</p>
                      <p className="font-mono">{selectedProgress._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedProgress.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedProgress.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Delete/Restore Dialog ---------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : deleteType === 'hard'
                ? 'Confirm Permanent Delete'
                : 'Confirm Restore'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              {deleteType === 'soft' && 'This will move the course progress record to trash. You can restore it later from the deleted items.'}
              {deleteType === 'hard' && 'This will permanently delete this course progress record. This action cannot be undone!'}
              {deleteType === 'restore' && 'This will restore the course progress record from trash. It will be visible again.'}
            </p>

            {deleteType !== 'restore' && (
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
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              {deleteType === 'soft' && 'Move to Trash'}
              {deleteType === 'hard' && 'Permanently Delete'}
              {deleteType === 'restore' && 'Restore Progress'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}