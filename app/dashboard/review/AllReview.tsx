/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import useFetchReview from '@/app/default/custom-component/useFetchReview'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AllReview() {
  /* ---------- Filters & Pagination ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState<number | string | undefined>()

  /* ---------- Delete / Restore Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  /* ---------- Fetch Reviews ---------- */
  const { reviews, meta, isLoading, refetch } = useFetchReview({
    page,
    rating,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedReviewId) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/review/soft/${selectedReviewId}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/review/hard/${selectedReviewId}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/review/restore/${selectedReviewId}`, {})
      }

      setOpen(false)
      setSelectedReviewId(null)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search course name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Rating"
          value={rating || ''}
          onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {/* ---------- Table ---------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            reviews.map((review, index) => (
              <TableRow key={review._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center">
                    {review.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                        <Image
                          src={review.image}
                          alt={review.name || 'Review'}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                        <span className="text-muted-foreground">N/A</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>{review.courseName}</TableCell>
                <TableCell>{review.name}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.comment}</TableCell>

                <TableCell>
                  <Badge variant={review.isDeleted ? 'destructive' : 'secondary'}>
                    {review.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/review/edit/${review._id}`}>
                    <Button size="icon" variant="outline">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  {!review.isDeleted && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedReviewId(review._id)
                        setDeleteType('soft')
                        setOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}

                  {review.isDeleted && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setSelectedReviewId(review._id)
                          setDeleteType('restore')
                          setOpen(true)
                        }}
                      >
                        <RotateCcw size={16} />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          setSelectedReviewId(review._id)
                          setDeleteType('hard')
                          setOpen(true)
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* ---------- Pagination ---------- */}
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

      {/* ---------- Dialog ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : deleteType === 'hard'
                ? 'Confirm Permanent Delete'
                : 'Confirm Restore'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {deleteType === 'soft' && 'Are you sure you want to delete this review?'}
            {deleteType === 'hard' && 'This action cannot be undone!'}
            {deleteType === 'restore' && 'Are you sure you want to restore this review?'}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant={deleteType === 'restore' ? 'secondary' : 'destructive'} onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
