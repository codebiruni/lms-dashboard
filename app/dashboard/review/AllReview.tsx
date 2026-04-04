/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Star,
} from 'lucide-react'
import Image from 'next/image'
import EditReview from './EditReview'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

/* -------------------- Types -------------------- */

interface Review {
  _id: string
  name: string
  courseName: string
  image: string
  description: string
  rating: number
  comment?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/* -------------------- SKELETON -------------------- */
function ReviewsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded overflow-hidden">
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
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
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

/* -------------------- Star Rating Component -------------------- */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  )
}

/* -------------------- Main Component -------------------- */

export default function AllReview() {
  /* ---------- Filters & Pagination ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [rating, setRating] = useState<string | undefined>()
  const [deleted, setDeleted] = useState<'false' | 'true'>('false')

  /* ---------- Dialogs ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const pathname = usePathname()

  /* ---------- Fetch Reviews ---------- */
  const { reviews, meta, isLoading, isFetching, refetch } = useFetchReview({
    page,
    limit,
    search,
    rating: rating ? Number(rating) : undefined,
    deleted: deleted === 'true',
  })

  const totalPages = Math.ceil(meta.total / limit)

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedReview) return

    try {
      let url = ""
      let successMessage = ""

      if (deleteType === 'restore') {
        url = `/v1/review/restore/${selectedReview._id}`
        successMessage = 'Review restored successfully'
      } else if (deleteType === 'hard') {
        url = `/v1/review/hard/${selectedReview._id}`
        successMessage = 'Review permanently deleted'
      } else {
        url = `/v1/review/soft/${selectedReview._id}`
        successMessage = 'Review moved to trash'
      }

      const res = deleteType === 'restore'
        ? await PATCHDATA(url, { isDeleted: false })
        : await DELETEDATA(url)

      if (res.success) {
        toast.success(successMessage)
        refetch()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setDeleteOpen(false)
      setSelectedReview(null)
    }
  }

  const handleEditClick = (review: Review) => {
    setSelectedReview(review)
    setEditOpen(true)
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    setSelectedReview(null)
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
    })
  }

  /* -------------------- Loading State -------------------- */
  if (isLoading) return <ReviewsTableSkeleton />

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* Edit Review Dialog */}
      {selectedReview && (
        <EditReview
          review={selectedReview}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {pathname.startsWith('/instructor') ? null : (
            <Button asChild>
              <Link href="/dashboard/review/create">Add Review</Link>
            </Button>
          )}
        </div>

        {/* ---------- Filters ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by course or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={rating || 'all'}
            onValueChange={(v) => {
              setRating(v === 'all' ? undefined : v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={deleted}
            onValueChange={(v) => {
              setDeleted(v as 'true' | 'false')
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
            </SelectContent>
          </Select>

          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
          )}
        </div>

        {/* ---------- Table ---------- */}
        <div className="border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              )}

              {reviews.map((review: any, index: number) => (
                <TableRow key={review._id}>
                  <TableCell className="text-center font-medium">
                    {getSerialNumber(index)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center">
                      {review.image ? (
                        <div className="relative w-10 h-10 rounded full overflow-hidden border">
                          <Image
                            src={review.image}
                            alt={review.name || 'Review'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded full bg-muted flex items-center justify-center border">
                          <span className="text-xs text-muted-foreground">N/A</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-37.5">
                    <div className="truncate font-medium">{review.courseName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {review.description}
                    </div>
                  </TableCell>

                  <TableCell>{review.name}</TableCell>

                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>

                  <TableCell className="max-w-50">
                    <div className="truncate">{review.comment || '—'}</div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={review.isDeleted ? 'destructive' : 'default'}>
                      {review.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedReview(review)
                          setDetailsOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!review.isDeleted ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(review)}
                            title="Edit Review"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Soft Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedReview(review)
                              setDeleteType('soft')
                              setDeleteOpen(true)
                            }}
                            title="Move to Trash"
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
                            onClick={() => {
                              setSelectedReview(review)
                              setDeleteType('restore')
                              setDeleteOpen(true)
                            }}
                            title="Restore Review"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>

                          {/* Hard Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedReview(review)
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

        {/* ---------- Pagination ---------- */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} reviews
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

      {/* ---------- Delete/Restore Dialog ---------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Delete Review?'
                : deleteType === 'hard'
                ? 'Permanently Delete Review?'
                : 'Restore Review?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'soft' && 'This review will be moved to trash. You can restore it later.'}
              {deleteType === 'hard' && 'This action cannot be undone. The review will be permanently deleted.'}
              {deleteType === 'restore' && 'The review will be restored and become visible again.'}
            </DialogDescription>
          </DialogHeader>

          {deleteType === 'hard' && (
            <div className="py-2">
              <div className="p-3 bg-destructive/10 rounded flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This will permanently remove this review.</span>
              </div>
            </div>
          )}

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
              {deleteType === 'restore' && 'Restore Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Details Dialog ---------- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Review Details
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-3">
              <div className="flex justify-center">
                {selectedReview.image ? (
                  <div className="relative w-24 h-24 rounded full overflow-hidden border">
                    <Image
                      src={selectedReview.image}
                      alt={selectedReview.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded full bg-muted flex items-center justify-center border">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">{selectedReview.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="col-span-2">{selectedReview.courseName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="col-span-2">
                    <StarRating rating={selectedReview.rating} />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="col-span-2">{selectedReview.description}</span>
                </div>
                {selectedReview.comment && (
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span className="text-muted-foreground">Comment:</span>
                    <span className="col-span-2">{selectedReview.comment}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="col-span-2">
                    <Badge variant={selectedReview.isDeleted ? 'destructive' : 'default'}>
                      {selectedReview.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="col-span-2">{formatDate(selectedReview.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="col-span-2 font-mono text-xs">{selectedReview._id}</span>
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