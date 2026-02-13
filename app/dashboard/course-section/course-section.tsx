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
  Hash,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import EditCourseSection from './EditCourseSection'

/* -------------------- Constants -------------------- */

const sortFields = ['order', 'createdAt']

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug: string
}

interface CourseSection {
  _id: string
  course: Course
  title: string
  description: string
  order: number
  totalLessons: number
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
}



/* -------------------- Component -------------------- */

export default function CourseSection() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [published, setPublished] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState<'order' | 'createdAt'>('order')
  const [sortOrder, setSortOrder] = useState<1 | -1>(1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null)

  const {
    courseSections,
    meta,
    isLoading,
    refetch,
  } = useFetchCourseSections({
    page,
    search,
    deleted,
    published,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedSection) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/course-section/soft/${selectedSection._id}`)
    } else {
      await DELETEDATA(`/v1/course-section/hard/${selectedSection._id}`)
    }

    setDeleteOpen(false)
    setSelectedSection(null)
    refetch()
  }

  const restoreSection = async (id: string) => {
    await PATCHDATA(`/v1/course-section/${id}`, { isDeleted: false })
    refetch()
  }

  const handleEditClick = (section: CourseSection) => {
    setSelectedSection(section)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedSection(null)
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

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* Edit Course Section Dialog */}
      {selectedSection && (
        <EditCourseSection
          section={selectedSection}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Input
          placeholder="Search section title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setPublished(v === 'true' ? true : v === 'false' ? false : undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setDeleted(v === 'true' ? true : v === 'false' ? false : undefined)}>
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
            {sortFields.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'order' ? 'Order' : 'Created Date'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Ascending</SelectItem>
            <SelectItem value="-1">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Section Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Total Lessons</TableHead>
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
                    <Skeleton className="h-5 w-12" />
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
            ) : courseSections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No course sections found
                </TableCell>
              </TableRow>
            ) : (
              courseSections.map((section: any, index: number) => (
                <TableRow key={section._id}>
                  <TableCell className="text-center">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="max-w-62.5">
                      <div className="truncate">{section.title}</div>
                      {section.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {section.description}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} className="text-muted-foreground" />
                      <span className="truncate max-w-37.5">
                        {section.course?.title}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Hash size={14} className="text-muted-foreground" />
                      <span>{section.order}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {section.totalLessons || 0} lessons
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {section.isPublished ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle size={12} className="mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle size={12} className="mr-1" />
                        Unpublished
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={section.isDeleted ? 'destructive' : 'secondary'}>
                      {section.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedSection(section)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye size={16} />
                      </Button>

                      {!section.isDeleted && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditClick(section)}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}

                      {section.isDeleted ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => restoreSection(section._id)}
                        >
                          <RotateCcw size={16} />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setSelectedSection(section)
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------------- Pagination ---------------- */}
      {!isLoading && meta.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1} to{' '}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} sections
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
              <BookOpen size={20} />
              Section Details
            </DialogTitle>
          </DialogHeader>

          {selectedSection && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle size={16} />
                    <span>Published Status</span>
                  </div>
                  {selectedSection.isPublished ? (
                    <Badge variant="default" className="bg-green-600">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unpublished</Badge>
                  )}
                </div>
                <div className="bg-muted/30 rounded p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Trash2 size={16} />
                    <span>Delete Status</span>
                  </div>
                  <Badge variant={selectedSection.isDeleted ? 'destructive' : 'secondary'}>
                    {selectedSection.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Section Title
                  </h3>
                  <p className="text-lg font-semibold">{selectedSection.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Course
                  </h3>
                  <p className="font-medium">{selectedSection.course?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Course ID: {selectedSection.course?._id}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedSection.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Order
                    </h3>
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedSection.order}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Lessons
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {selectedSection.totalLessons || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Section ID</p>
                      <p className="font-mono">{selectedSection._id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p>{formatDate(selectedSection.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p>{formatDate(selectedSection.updatedAt)}</p>
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
                ? 'This will permanently delete this course section. This action cannot be undone.'
                : 'This will move the course section to trash. You can restore it later from the deleted items.'}
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