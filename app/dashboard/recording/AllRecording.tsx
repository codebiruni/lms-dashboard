'use client'

import React, { useState } from 'react'
import useFetchRecording from '@/app/default/custom-component/useFetchRecording'
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
import { RotateCcw, Trash2, Pencil, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AllRecording() {
  /* ---------- Filters & Pagination ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  /* ---------- Delete / Restore Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)

  /* ---------- Fetch Recordings ---------- */
  const { recordings, meta, isLoading, refetch } = useFetchRecording({
    page,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedRecordingId) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/recording/soft/${selectedRecordingId}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/recording/hard/${selectedRecordingId}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/recording/restore/${selectedRecordingId}`, {})
      }

      setOpen(false)
      setSelectedRecordingId(null)
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by title or uploader"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------- Table ---------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Duration (min)</TableHead>
            <TableHead>Size (MB)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            recordings.map((recording, index) => (
              <TableRow key={recording._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{recording.title}</TableCell>
                <TableCell>{recording.courseId?.title}</TableCell>

                <TableCell className="flex items-center gap-2">
                  {recording.uploadedBy?.image && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                      <Image
                        src={recording.uploadedBy.image}
                        alt={recording.uploadedBy.name || 'Uploader'}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div>
                    <div>{recording.uploadedBy?.name}</div>
                    <div className="text-muted-foreground text-sm">{recording.uploadedBy?.role}</div>
                  </div>
                </TableCell>

                <TableCell>{recording.duration || '-'}</TableCell>
                <TableCell>{recording.size || '-'}</TableCell>

                <TableCell>
                  <Badge variant={recording.isDeleted ? 'destructive' : 'secondary'}>
                    {recording.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/recording/edit/${recording._id}`}>
                    <Button size="icon" variant="outline">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  <Link href={recording.videoUrl} target="_blank">
                    <Button size="icon" variant="secondary">
                      <Play size={16} />
                    </Button>
                  </Link>

                  {!recording.isDeleted && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRecordingId(recording._id)
                        setDeleteType('soft')
                        setOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}

                  {recording.isDeleted && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setSelectedRecordingId(recording._id)
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
                          setSelectedRecordingId(recording._id)
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
            {deleteType === 'soft' && 'Are you sure you want to delete this recording?'}
            {deleteType === 'hard' && 'This action cannot be undone!'}
            {deleteType === 'restore' && 'Are you sure you want to restore this recording?'}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={deleteType === 'restore' ? 'secondary' : 'destructive'}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
