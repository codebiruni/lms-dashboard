/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import Image from 'next/image'

import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Eye,
  Users,
  BookOpen,
  Star,
  Clock,
  Calendar,
  Award,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Grid3x3,
  List,
} from 'lucide-react'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  /* ---------- dialogs ---------- */
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const {
    courses,
    meta,
    isLoading,
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

  const handleDetailsClick = (course: Course) => {
    setSelectedCourse(course)
    setDetailsOpen(true)
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Browse and manage all courses in the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ---------------- Filters ---------------- */}
      <div className="bg-card rounded lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

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
      </div>

      {/* ---------------- Course Cards ---------------- */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {Array.from({ length: 8 }).map((_, i) => (
            viewMode === 'grid' ? (
              <div key={i} className="bg-card rounded lg border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <div key={i} className="bg-card rounded lg border p-4 flex gap-4">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            )
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded full p-6 mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground max-w-md">
            Try adjusting your search or filter criteria to find what you`re looking for.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {courses.map((course: any) => (
            viewMode === 'grid' ? (
              <div key={course._id} className="bg-card rounded lg border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                    {course.isDeleted && (
                      <Badge variant="destructive">Deleted</Badge>
                    )}
                  </div>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.category?.name}</p>
                    {course.subCategory && (
                      <p className="text-xs text-muted-foreground">{course.subCategory.name}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating || '0.0'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.totalStudents}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.totalLessons}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.durationInHours}h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {course.isFree ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Free
                      </Badge>
                    ) : (
                      <div>
                        <span className="font-bold text-lg">
                          {formatCurrency(course.discountPrice || course.price)}
                        </span>
                        {course.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {formatCurrency(course.price)}
                          </span>
                        )}
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDetailsClick(course)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={course._id} className="bg-card rounded lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.category?.name}</p>
                        {course.subCategory && (
                          <p className="text-xs text-muted-foreground">{course.subCategory.name}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        {course.isDeleted && (
                          <Badge variant="destructive">Deleted</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating || '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.totalStudents} students</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.durationInHours}h</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.isFree ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Free
                          </Badge>
                        ) : (
                          <div>
                            <span className="font-bold">
                              {formatCurrency(course.discountPrice || course.price)}
                            </span>
                            {course.discountPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                {formatCurrency(course.price)}
                              </span>
                            )}
                          </div>
                        )}
                        {course.discountPrice && course.discountPrice < course.price && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDetailsClick(course)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* ---------------- Pagination ---------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                <div className="bg-muted/30 rounded lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users size={16} />
                    <span>Students</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCourse.totalStudents}</p>
                </div>
                <div className="bg-muted/30 rounded lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <BookOpen size={16} />
                    <span>Lessons</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCourse.totalLessons}</p>
                </div>
                <div className="bg-muted/30 rounded lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock size={16} />
                    <span>Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCourse.durationInHours}h</p>
                </div>
                <div className="bg-muted/30 rounded lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star size={16} />
                    <span>Rating</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCourse.rating || '0.0'}</p>
                </div>
              </div>

              {/* Thumbnail & Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="relative w-full h-48 rounded lg overflow-hidden border">
                    <Image
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedCourse.category?.name}</p>
                      {selectedCourse.subCategory && (
                        <p className="text-sm text-muted-foreground">
                          {selectedCourse.subCategory.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-medium">{selectedCourse.instructor?.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCourse.instructor?.expertise}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Level</p>
                      <Badge className={getLevelColor(selectedCourse.level)}>
                        {selectedCourse.level}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedCourse.status)}>
                        {selectedCourse.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="font-medium">{selectedCourse.language || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Price</p>
                      {selectedCourse.isFree ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Free
                        </Badge>
                      ) : (
                        <div>
                          <span className="font-bold text-lg">
                            {formatCurrency(selectedCourse.discountPrice || selectedCourse.price)}
                          </span>
                          {selectedCourse.discountPrice && (
                            <span className="ml-2 text-sm text-muted-foreground line-through">
                              {formatCurrency(selectedCourse.price)}
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
                <div className="bg-muted/20 rounded lg p-4">
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
                      <div className="bg-muted/20 rounded lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                        <p className="font-medium">{formatDate(selectedCourse.enrollmentStart)}</p>
                      </div>
                    )}
                    {selectedCourse.enrollmentEnd && (
                      <div className="bg-muted/20 rounded lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">End Date</p>
                        <p className="font-medium">{formatDate(selectedCourse.enrollmentEnd)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements & What You'll Learn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Requirements
                    </h3>
                    <ul className="space-y-2 bg-muted/20 rounded lg p-4">
                      {selectedCourse.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedCourse.whatYouWillLearn && selectedCourse.whatYouWillLearn.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star size={18} />
                      What You`ll Learn
                    </h3>
                    <ul className="space-y-2 bg-muted/20 rounded lg p-4">
                      {selectedCourse.whatYouWillLearn.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Course ID</p>
                    <p className="font-mono text-xs">{selectedCourse._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p>{formatDate(selectedCourse.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Last Updated</p>
                    <p>{formatDate(selectedCourse.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Deleted</p>
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
    </div>
  )
}