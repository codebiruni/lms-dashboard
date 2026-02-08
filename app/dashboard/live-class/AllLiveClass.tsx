'use client'

import React, { useState } from 'react'
import useFetchLiveClass from '@/app/default/custom-component/useFetchLiveClass'
import DELETEDATA from '@/app/default/functions/DeleteData'
import PATCHDATA from '@/app/default/functions/Patch'
import Link from 'next/link'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Pencil, RotateCcw, Trash2 } from 'lucide-react'

type LiveClass = {
  _id: string
  title: string
  description?: string
  meetingPlatform: string
  startTime: string
  endTime: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export default function AllLiveClass() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { liveClasses, meta, isLoading, refetch } = useFetchLiveClass({
    page,
    limit,
  })

  // const handleSoftDelete = async (id: string) => {
  //   await DELETEDATA(`/v1/live-class/soft/${id}`)
  //   refetch()
  // }

  const handleRestore = async (id: string) => {
    await PATCHDATA(`/v1/live-class/restore/${id}`, { isDeleted: false })
    refetch()
  }

  const confirmDelete = async () => {
    if (!selectedId) return

    if (deleteType === 'soft') {
      await DELETEDATA(`/v1/live-class/soft/${selectedId}`)
    } else {
      await DELETEDATA(`/v1/live-class/hard/${selectedId}`)
    }

    setOpen(false)
    setSelectedId(null)
    refetch()
  }

  const getSerialNumber = (index: number) => {
    return (page - 1) * (meta.limit || 10) + index + 1
  }

  return (
    <div className="space-y-6 p-4">

      <h2 className="text-xl font-bold">All Live Classes</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}

          {!isLoading &&
            liveClasses.map((liveClass: LiveClass, index: number) => (
              <TableRow
                key={liveClass._id}
                className={liveClass.isDeleted ? 'bg-red-50' : ''}
              >
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{liveClass.title}</TableCell>

                <TableCell>{liveClass.meetingPlatform}</TableCell>

                <TableCell>
                  {new Date(liveClass.startTime).toLocaleString()}
                </TableCell>

                <TableCell>
                  {new Date(liveClass.endTime).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      liveClass.isDeleted ? 'destructive' : 'secondary'
                    }
                  >
                    {liveClass.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  {!liveClass.isDeleted && (
                    <>
                      <Link
                        href={`/dashboard/live-class/edit/${liveClass._id}`}
                      >
                        <Button size="icon" variant="outline">
                          <Pencil size={16} />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          setSelectedId(liveClass._id)
                          setDeleteType('soft')
                          setOpen(true)
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}

                  {liveClass.isDeleted && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleRestore(liveClass._id)}
                      >
                        <RotateCcw size={16} />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          setSelectedId(liveClass._id)
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

      {!isLoading && liveClasses.length === 0 && (
        <p className="text-center text-muted-foreground">
          No live classes found
        </p>
      )}

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'soft'
                ? 'Confirm Soft Delete'
                : 'Confirm Permanent Delete'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure? This action{' '}
            {deleteType === 'hard' && 'cannot be undone'}.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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
