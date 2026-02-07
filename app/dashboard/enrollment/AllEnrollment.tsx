/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import useFetchEnrollment from '@/app/default/custom-component/useFetchEnrollment'
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
import { RotateCcw, Trash2, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AllEnrollment() {
  /* ---------- Filters & Pagination ---------- */
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>()

  /* ---------- Delete / Restore Dialog ---------- */
  const [open, setOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | 'restore'>('soft')
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null)

  /* ---------- Fetch Enrollments ---------- */
  const { enrollments, meta, isLoading, refetch } = useFetchEnrollment({
    page,
    search,
    status,
    paymentStatus,
  })

  /* ---------- Handlers ---------- */
  const confirmAction = async () => {
    if (!selectedEnrollmentId) return

    try {
      if (deleteType === 'soft') {
        await DELETEDATA(`/v1/enrollment/soft/${selectedEnrollmentId}`)
      } else if (deleteType === 'hard') {
        await DELETEDATA(`/v1/enrollment/hard/${selectedEnrollmentId}`)
      } else if (deleteType === 'restore') {
        await PATCHDATA(`/v1/enrollment/restore/${selectedEnrollmentId}`, {})
      }

      setOpen(false)
      setSelectedEnrollmentId(null)
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
          placeholder="Search by student/course"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          placeholder="Enrollment Status"
          value={status || ''}
          onChange={(e) => setStatus(e.target.value || undefined)}
        />
        <Input
          placeholder="Payment Status"
          value={paymentStatus || ''}
          onChange={(e) => setPaymentStatus(e.target.value || undefined)}
        />
      </div>

      {/* ---------- Table ---------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Enrollment Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Total / Paid / Due</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!isLoading &&
            enrollments.map((enrollment:any, index:number) => (
              <TableRow key={enrollment._id}>
                <TableCell className="text-center font-medium">
                  {getSerialNumber(index)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {enrollment.student?.image && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                        <Image
                          src={enrollment.student.image}
                          alt={enrollment.student.id || 'Student'}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div>
                      <div>{enrollment.student?.id}</div>
                      <div className="text-muted-foreground text-sm">{enrollment.student?.bio}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{enrollment.course?.title}</TableCell>
                <TableCell>{enrollment.enrollmentStatus}</TableCell>
                <TableCell>{enrollment.paymentStatus}</TableCell>
                <TableCell>
                  {enrollment.totalAmount} / {enrollment.paidAmount} / {enrollment.dueAmount}
                </TableCell>
                <TableCell>{enrollment.progress}%</TableCell>

                <TableCell>
                  <Badge variant={enrollment.isDeleted ? 'destructive' : 'secondary'}>
                    {enrollment.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </TableCell>

                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/enrollment/edit/${enrollment._id}`}>
                    <Button size="icon" variant="outline">
                      <Pencil size={16} />
                    </Button>
                  </Link>

                  {!enrollment?.isDeleted && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setSelectedEnrollmentId(enrollment._id)
                        setDeleteType('soft')
                        setOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}

                  {enrollment?.isDeleted && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setSelectedEnrollmentId(enrollment._id)
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
                          setSelectedEnrollmentId(enrollment._id)
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
            {deleteType === 'soft' && 'Are you sure you want to delete this enrollment?'}
            {deleteType === 'hard' && 'This action cannot be undone!'}
            {deleteType === 'restore' && 'Are you sure you want to restore this enrollment?'}
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
