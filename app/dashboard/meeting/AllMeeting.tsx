'use client'

import React, { useState } from 'react'
import useFetchMeeting from '@/app/default/custom-component/useFetchMeeting'
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
import { RotateCcw, Trash2, Pencil, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AllMeeting() {
  /* ---------- Filters & Pagination ---------- */
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()

  /* ---------- Delete / Restore Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)

  /* ---------- Fetch Meetings ---------- */
  const { meetings, meta, isLoading, refetch } = useFetchMeeting({
    page,
    status,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedMeetingId) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/meeting/soft/${selectedMeetingId}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/meeting/hard/${selectedMeetingId}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/meeting/restore/${selectedMeetingId}`, {})
      }

      setOpen(false)
      setSelectedMeetingId(null)
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
          placeholder="Search by status"
          value={status || ''}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      {/* ---------- Table ---------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            meetings.map((meeting, index) => (
              <TableRow key={meeting._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>{meeting.platform || '-'}</TableCell>
                <TableCell>{new Date(meeting.startTime).toLocaleString()}</TableCell>
                <TableCell>{new Date(meeting.endTime).toLocaleString()}</TableCell>

                <TableCell>
                  <Badge variant={meeting.isDeleted ? 'destructive' : 'secondary'}>
                    {meeting.isDeleted ? 'Deleted' : meeting.status}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/meeting/edit/${meeting._id}`}>
                    <Button size="icon" variant="outline">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  <Link href={meeting.meetingLink} target="_blank">
                    <Button size="icon" variant="secondary">
                      <ExternalLink size={16} />
                    </Button>
                  </Link>

                  {!meeting.isDeleted && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedMeetingId(meeting._id)
                        setDeleteType('soft')
                        setOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}

                  {meeting.isDeleted && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setSelectedMeetingId(meeting._id)
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
                          setSelectedMeetingId(meeting._id)
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
            {deleteType === 'soft' && 'Are you sure you want to delete this meeting?'}
            {deleteType === 'hard' && 'This action cannot be undone!'}
            {deleteType === 'restore' && 'Are you sure you want to restore this meeting?'}
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
