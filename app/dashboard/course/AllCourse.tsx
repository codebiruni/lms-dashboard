/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import Image from 'next/image'

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

import {
  Eye,
  Trash2,
  RotateCcw,
  Pencil,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Star,
  FileText,
} from 'lucide-react'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import EditCourse from './EditCourse'
import { Skeleton } from '@/components/ui/skeleton'

/* -------------------- Constants -------------------- */

const levels = ['beginner', 'intermediate', 'advanced']
const statuses = ['draft', 'published', 'archived']

/* -------------------- Types -------------------- */

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  category: {
    _id: string
    name: string
    image: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }
  subCategory?: {
    _id: string
    category: string
    name: string
    image: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }
  instructor: {
    _id: string
    userId: string
    id: string
    bio: string
    expertise: string
    approvalStatus: string
    totalStudents: number
    totalCourses: number
    selery: number
    isDeleted: boolean
    joinDate: string
    createdAt: string
    updatedAt: string
    __v: number
  }
  thumbnail: string
  price: number
  discountPrice?: number
  isFree: boolean
  enrollmentStart?: string
  enrollmentEnd?: string
  durationInHours: number
  totalLessons: number
  level: string
  language?: string
  requirements: string[]
  whatYouWillLearn: string[]
  totalStudents: number
  rating: number
  status: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
}



/* -------------------- Component -------------------- */

export default function AllCourse() {
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'price'>('createdAt')
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1)

  /* ---------- dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const {
    courses,
    meta,
    isLoading,
    refetch,
  } = useFetchCourses({
    page,
    search,
    level,
    status,
    deleted,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const confirmDelete = async () => {
    if (!selectedCourse) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/course/soft/${selectedCourse._id}`)
    } else {
      await DELETEDATA(`/v1/course/hard/${selectedCourse._id}`)
    }

    setDeleteOpen(false)
    setSelectedCourse(null)
    refetch()
  }

  const restoreCourse = async (id: string) => {
    await PATCHDATA(`/v1/course/${id}`, { isDeleted: false })
    refetch()
  }

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedCourse(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* Edit Course Dialog */}
      {selectedCourse && (
        <EditCourse
          course={selectedCourse}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search title / description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setLevel(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
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
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">Newest First</SelectItem>
            <SelectItem value="1">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
               <TableRow >
      <TableCell className="text-center">
        <Skeleton className="h-5 w-8 mx-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-14 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-12" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course: any, index: number) => (
                <TableRow key={course._id}>
                  <TableCell className="text-center">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className="relative w-14 h-10 rounded overflow-hidden border">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="max-w-50">
                    <div className="truncate font-medium">
                      {course.title}
                    </div>
                  </TableCell>

                  <TableCell>
                    {course.category?.name}
                    {course.subCategory && (
                      <div className="text-xs text-muted-foreground">
                        {course.subCategory.name}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{course.level}</Badge>
                  </TableCell>

                  <TableCell>
                    {course.isFree ? (
                      <Badge variant="outline" className="bg-green-50">Free</Badge>
                    ) : (
                      <div>
                        <span className="font-medium">{formatCurrency(course.price)}</span>
                        {course.discountPrice && course.discountPrice < course.price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(course.price)}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant={
                        course.status === 'published' ? 'default' : 
                        course.status === 'draft' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {course.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={course.isDeleted ? 'destructive' : 'secondary'}>
                      {course.isDeleted ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedCourse(course)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye size={16} />
                      </Button>

                      {!course.isDeleted && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditClick(course)}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}

                      {course.isDeleted ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => restoreCourse(course._id)}
                        >
                          <RotateCcw size={16} />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setSelectedCourse(course)
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
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * meta.limit + 1} to {Math.min(page * meta.limit, meta.total)} of {meta.total} courses
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedCourse?.title}
            </DialogTitle>
            {selectedCourse?.slug && (
              <p className="text-sm text-muted-foreground">Slug: {selectedCourse.slug}</p>
            )}
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users size={14} />
                    <span>Students</span>
                  </div>
                  <p className="text-2xl font-semibold">{selectedCourse.totalStudents}</p>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpen size={14} />
                    <span>Lessons</span>
                  </div>
                  <p className="text-2xl font-semibold">{selectedCourse.totalLessons}</p>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <p className="text-2xl font-semibold">{selectedCourse.durationInHours}h</p>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Star size={14} />
                    <span>Rating</span>
                  </div>
                  <p className="text-2xl font-semibold">{selectedCourse.rating || '0.0'}</p>
                </div>
              </div>

              {/* Thumbnail & Basic Info */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <div className="relative w-full h-40 rounded overflow-hidden border">
                    <Image
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="font-medium">{selectedCourse.category?.name}</p>
                      {selectedCourse.subCategory && (
                        <p className="text-sm text-muted-foreground">
                          {selectedCourse.subCategory.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Instructor</p>
                      <p className="font-medium">{selectedCourse.instructor?.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCourse.instructor?.expertise}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Level</p>
                      <Badge variant="secondary">{selectedCourse.level}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge 
                        variant={
                          selectedCourse.status === 'published' ? 'default' : 
                          selectedCourse.status === 'draft' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {selectedCourse.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Language</p>
                      <p className="font-medium">{selectedCourse.language || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      {selectedCourse.isFree ? (
                        <Badge variant="outline" className="bg-green-50">Free</Badge>
                      ) : (
                        <div>
                          <span className="font-medium">{formatCurrency(selectedCourse.price)}</span>
                          {selectedCourse.discountPrice && (
                            <span className="ml-2 text-sm text-muted-foreground line-through">
                              {formatCurrency(selectedCourse.discountPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  Description
                </h3>
                <div className="bg-muted/20 rounded p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              </div>

              {/* Enrollment Period */}
              {(selectedCourse.enrollmentStart || selectedCourse.enrollmentEnd) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar size={18} />
                    Enrollment Period
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCourse.enrollmentStart && (
                      <div className="bg-muted/20 rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                        <p className="font-medium">{formatDate(selectedCourse.enrollmentStart)}</p>
                      </div>
                    )}
                    {selectedCourse.enrollmentEnd && (
                      <div className="bg-muted/20 rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">End Date</p>
                        <p className="font-medium">{formatDate(selectedCourse.enrollmentEnd)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements & What You'll Learn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 bg-muted/20 rounded p-4">
                      {selectedCourse.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedCourse.whatYouWillLearn && selectedCourse.whatYouWillLearn.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What You`ll Learn</h3>
                    <ul className="list-disc list-inside space-y-1 bg-muted/20 rounded p-4">
                      {selectedCourse.whatYouWillLearn.map((item, idx) => (
                        <li key={idx} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">Course ID</p>
                    <p>{selectedCourse._id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Created</p>
                    <p>{formatDate(selectedCourse.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Last Updated</p>
                    <p>{formatDate(selectedCourse.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Deleted</p>
                    <Badge variant={selectedCourse.isDeleted ? 'destructive' : 'secondary'}>
                      {selectedCourse.isDeleted ? 'Yes' : 'No'}
                    </Badge>
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
                ? 'This will permanently delete the course. This action cannot be undone.'
                : 'This will move the course to trash. You can restore it later from the deleted items.'}
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