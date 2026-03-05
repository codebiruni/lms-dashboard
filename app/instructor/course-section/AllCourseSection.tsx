/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  BookOpen,
  Hash,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'

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

export default function AllCourseSection() {
  const router = useRouter()
  
  /* ---------- filters ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState<boolean | undefined>()
  const [published, setPublished] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState<'order' | 'createdAt'>('order')
  const [sortOrder, setSortOrder] = useState<1 | -1>(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  /* ---------- dialogs ---------- */
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null)

  const {
    courseSections,
    meta,
    isLoading,
  } = useFetchCourseSections({
    page,
    search,
    deleted,
    published,
    sortBy,
    sortOrder,
  })

  /* -------------------- Handlers -------------------- */

  const handleDetailsClick = (section: CourseSection) => {
    setSelectedSection(section)
    setDetailsOpen(true)
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

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Sections</h1>
          <p className="text-muted-foreground">
            Manage and organize course content sections
          </p>
        </div>
        <Button
          onClick={() => router.push('/instructor/course-section/create')}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Section
        </Button>
      </div>

      {/* ---------------- Filters ---------------- */}
      <div className="bg-card rounded lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select onValueChange={(v) => setPublished(v === 'true' ? true : v === 'false' ? false : undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Published" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Unpublished</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setDeleted(v === 'true' ? true : v === 'false' ? false : undefined)}>
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
      </div>

      {/* ---------------- View Mode Toggle ---------------- */}
      <div className="flex items-center justify-end gap-2">
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

      {/* ---------------- Course Section Cards ---------------- */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {Array.from({ length: 8 }).map((_, i) => (
            viewMode === 'grid' ? (
              <div key={i} className="bg-card rounded lg border overflow-hidden">
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <div key={i} className="bg-card rounded lg border p-4 flex gap-4">
                <Skeleton className="h-16 w-16 rounded" />
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
      ) : courseSections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded full p-6 mb-4">
            <Layers className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No course sections found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Try adjusting your search or filter criteria, or create a new section to get started.
          </p>
          <Button
            onClick={() => router.push('/instructor/course-section/create')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Section
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {courseSections.map((section: any) => (
            viewMode === 'grid' ? (
              <div key={section._id} className="bg-card rounded lg border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded lg">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <Badge className={getStatusColor(section.isPublished)}>
                        {section.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {section.isDeleted && (
                      <Badge variant="destructive">Deleted</Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {section.description || 'No description'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{section.course?.title}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order: {section.order}</span>
                    </div>
                    <Badge variant="outline">
                      {section.totalLessons || 0} lessons
                    </Badge>
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDetailsClick(section)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={section._id} className="bg-card rounded lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded lg h-fit">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{section.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {section.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(section.isPublished)}>
                          {section.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {section.isDeleted && (
                          <Badge variant="destructive">Deleted</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{section.course?.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>Order: {section.order}</span>
                      </div>
                      <Badge variant="outline">
                        {section.totalLessons || 0} lessons
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(section.createdAt)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDetailsClick(section)}
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
      {!isLoading && meta.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
              <Layers size={20} />
              Section Details
            </DialogTitle>
          </DialogHeader>

          {selectedSection && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle size={16} />
                    <span>Published Status</span>
                  </div>
                  {selectedSection.isPublished ? (
                    <Badge variant="default" className="bg-green-600">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
                <div className="bg-muted/30 rounded lg p-4">
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
                  <div className="bg-muted/20 rounded lg p-3 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedSection.course?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Course ID: {selectedSection.course?._id}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="bg-muted/20 rounded lg p-4">
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
                    <div className="bg-muted/20 rounded lg p-3 flex items-center gap-3">
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{selectedSection.order}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Lessons
                    </h3>
                    <div className="bg-muted/20 rounded lg p-3 flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {selectedSection.totalLessons || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/20 rounded lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Section ID</p>
                      <p className="font-mono text-xs break-all">{selectedSection._id}</p>
                    </div>
                    <div className="bg-muted/20 rounded lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Created At</p>
                      <p className="text-sm">{formatDate(selectedSection.createdAt)}</p>
                    </div>
                    <div className="bg-muted/20 rounded lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                      <p className="text-sm">{formatDate(selectedSection.updatedAt)}</p>
                    </div>
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