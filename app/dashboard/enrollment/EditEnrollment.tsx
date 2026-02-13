/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Users, X, DollarSign } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------- Types -------------------- */

interface EditEnrollmentProps {
  enrollment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditEnrollment({
  enrollment,
  open,
  onOpenChange,
  onSuccess
}: EditEnrollmentProps) {
  /* ---------- STATES ---------- */
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState<string>()
  const [totalAmount, setTotalAmount] = useState<number | undefined>()
  const [paidAmount, setPaidAmount] = useState<number | undefined>()
  const [dueAmount, setDueAmount] = useState<number | undefined>()
  const [enrollmentStatus, setEnrollmentStatus] = useState('active')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  /* ---------- FETCH COURSES ---------- */
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })

  /* ---------- LOAD ENROLLMENT DATA ---------- */
  useEffect(() => {
    if (enrollment && open) {
      setStudentId(enrollment.student?.id || '')
      setCourseId(enrollment.course?._id || '')
      setTotalAmount(enrollment.totalAmount || 0)
      setPaidAmount(enrollment.paidAmount || 0)
      setDueAmount(enrollment.dueAmount || 0)
      setEnrollmentStatus(enrollment.enrollmentStatus || 'active')
      setPaymentStatus(enrollment.paymentStatus || 'pending')
      setProgress(enrollment.progress || 0)
    }
  }, [enrollment, open])

  /* ---------- AUTO CALCULATE DUE AMOUNT ---------- */
  useEffect(() => {
    if (totalAmount !== undefined && paidAmount !== undefined) {
      const due = Math.max(0, totalAmount - paidAmount)
      setDueAmount(due)
    }
  }, [totalAmount, paidAmount])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setStudentId('')
    setCourseId(undefined)
    setTotalAmount(undefined)
    setPaidAmount(undefined)
    setDueAmount(undefined)
    setEnrollmentStatus('active')
    setPaymentStatus('pending')
    setProgress(0)
  }

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    if (!studentId || !courseId || !totalAmount) {
      toast.error('Student ID, Course and Total Amount are required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        student: enrollment.student._id,
        course: courseId,
        totalAmount,
        paidAmount: paidAmount || 0,
        dueAmount: dueAmount || totalAmount,
        enrollmentStatus,
        paymentStatus,
        progress,
        ...(enrollmentStatus === 'completed' && { completedAt: new Date().toISOString() }),
      }

      const res = await PATCHDATA(`/v1/enrollment/${enrollment._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update enrollment')
      }

      toast.success('Enrollment updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update enrollment')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!open) return null

  /* -------------------- UI -------------------- */
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-3xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Edit Enrollment
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Student:</p>
                  <p className="font-medium">{enrollment.student?.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student ID:</p>
                  <Badge variant="outline" className="font-mono">
                    {enrollment.student?.id || enrollment.student?._id?.slice(-6)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* Student ID (Read Only) */}
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  readOnly
                  className="bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Student ID cannot be changed
                </p>
              </div>

              {/* COURSE SELECT */}
              <div className="space-y-2">
                <Label htmlFor="course" className="required">Course</Label>
                <Select
                  value={courseId}
                  onValueChange={setCourseId}
                  disabled={coursesLoading}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        <div className="flex items-center gap-2">
                          <span>{c.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({c._id.slice(-6)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {enrollment?.course && (
                  <p className="text-xs text-muted-foreground">
                    Current: {enrollment.course.title}
                  </p>
                )}
              </div>

              {/* TOTAL AMOUNT */}
              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="required">Total Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <Input
                    id="totalAmount"
                    type="number"
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g 5000"
                    min={0}
                  />
                </div>
              </div>

              {/* PAID AMOUNT */}
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Paid Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <Input
                    id="paidAmount"
                    type="number"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g 2000"
                    min={0}
                    max={totalAmount}
                  />
                </div>
              </div>

              {/* DUE AMOUNT (READ ONLY) */}
              <div className="space-y-2">
                <Label htmlFor="dueAmount">Due Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <Input
                    id="dueAmount"
                    type="number"
                    value={dueAmount || ''}
                    readOnly
                    placeholder="Auto calculated"
                    className="bg-muted/30"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-calculated from total and paid amounts
                </p>
              </div>

              {/* PROGRESS */}
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  Course completion percentage (0-100)
                </p>
              </div>

              {/* ENROLLMENT STATUS */}
              <div className="space-y-2">
                <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
                <Select value={enrollmentStatus} onValueChange={setEnrollmentStatus}>
                  <SelectTrigger id="enrollmentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PAYMENT STATUS */}
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline">Current Status</Badge>
                {enrollment.isDeleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <>
                    <Badge 
                      variant={
                        enrollment.enrollmentStatus === 'active' ? 'default' : 
                        enrollment.enrollmentStatus === 'completed' ? 'default' : 'destructive'
                      }
                      className={enrollment.enrollmentStatus === 'active' ? 'bg-green-600' : 
                                 enrollment.enrollmentStatus === 'completed' ? 'bg-blue-600' : ''}
                    >
                      {enrollment.enrollmentStatus}
                    </Badge>
                    <Badge 
                      variant={
                        enrollment.paymentStatus === 'paid' ? 'default' : 
                        enrollment.paymentStatus === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={enrollment.paymentStatus === 'paid' ? 'bg-green-600' : ''}
                    >
                      {enrollment.paymentStatus}
                    </Badge>
                  </>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || coursesLoading}
                  size="lg"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Update Enrollment
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Required Fields Note */}
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}