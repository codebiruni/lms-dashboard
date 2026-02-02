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

import {
  Eye,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'


/* -------------------- Constants -------------------- */

const sortFields = ['order', 'createdAt']

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
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedSection, setSelectedSection] = useState<any>(null)

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

  const getSerialNumber = (index: number) => {
    return (page - 1) * meta.limit + index + 1
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Input
          placeholder="Search section title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setPublished(v === 'true')}>
          <SelectTrigger>
            <SelectValue placeholder="Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setDeleted(v === 'true')}>
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
                {s}
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
          {!isLoading &&
            courseSections.map((section: any, index: number) => (
              <TableRow key={section._id}>
                <TableCell className="text-center">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{section.title}</TableCell>

                <TableCell>{section.course?.title}</TableCell>

                <TableCell>{section.order}</TableCell>

                <TableCell>{section.totalLessons}</TableCell>

                <TableCell>
                  <Badge variant={section.isPublished ? 'default' : 'secondary'}>
                    {section.isPublished ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={section.isDeleted ? 'destructive' : 'secondary'}>
                    {section.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
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
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* ---------------- Details Dialog ---------------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Section Details</DialogTitle>
          </DialogHeader>

          {selectedSection && (
            <div className="space-y-3 text-sm">
              <p><b>Title:</b> {selectedSection.title}</p>
              <p><b>Description:</b> {selectedSection.description}</p>
              <p><b>Course:</b> {selectedSection.course?.title}</p>
              <p><b>Order:</b> {selectedSection.order}</p>
              <p><b>Total Lessons:</b> {selectedSection.totalLessons}</p>
              <p><b>Published:</b> {selectedSection.isPublished ? 'Yes' : 'No'}</p>
              <p><b>Created At:</b> {selectedSection.createdAt}</p>
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
            This will {deleteType === 'hard' ? 'permanently delete' : 'soft delete'} the section.
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
