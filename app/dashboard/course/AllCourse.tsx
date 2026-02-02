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
} from 'lucide-react'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------- Constants -------------------- */

const levels = ['beginner', 'intermediate', 'advanced']
const statuses = ['draft', 'published', 'archived']

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
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

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

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search title / description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setLevel(v || undefined)}>
          <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            {levels.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setStatus(v || undefined)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
          <SelectTrigger><SelectValue placeholder="Deleted" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setSortOrder(v === '1' ? 1 : -1)}>
          <SelectTrigger><SelectValue placeholder="Order" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">Newest</SelectItem>
            <SelectItem value="1">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------------- Table ---------------- */}
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
          {!isLoading && courses.map((course:any, index:number) => (
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

              <TableCell>{course.title}</TableCell>
              <TableCell>{course.category?.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{course.level}</Badge>
              </TableCell>
              <TableCell>
                {course.isFree ? 'Free' : `৳${course.price}`}
              </TableCell>
              <TableCell>
                <Badge>{course.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={course.isDeleted ? 'destructive' : 'secondary'}>
                  {course.isDeleted ? 'Yes' : 'No'}
                </Badge>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ---------------- Pagination ---------------- */}
      <div className="flex justify-between items-center">
        <p>Total: {meta.total}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-3 text-sm">
              <p><b>Description:</b> {selectedCourse.description}</p>
              <p><b>Category:</b> {selectedCourse.category?.name}</p>
              <p><b>SubCategory:</b> {selectedCourse.subCategory?.name}</p>
              <p><b>Instructor ID:</b> {selectedCourse.instructor?.id}</p>
              <p><b>Duration:</b> {selectedCourse.durationInHours} hours</p>
              <p><b>Total Lessons:</b> {selectedCourse.totalLessons}</p>
              <p><b>Language:</b> {selectedCourse.language}</p>
              <p><b>Students:</b> {selectedCourse.totalStudents}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Dialog ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This will {deleteType === 'hard' ? 'permanently delete' : 'soft delete'} the course.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
