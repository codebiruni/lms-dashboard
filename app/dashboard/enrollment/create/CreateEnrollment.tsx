/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

export default function CreateEnrollment() {
  const router = useRouter()

  /* ---------- STATES ---------- */
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState<string>()

  const [totalAmount, setTotalAmount] = useState<number | undefined>()
  const [paidAmount, setPaidAmount] = useState<number | undefined>()
  const [dueAmount, setDueAmount] = useState<number | undefined>()

  const [enrollmentStatus, setEnrollmentStatus] = useState('active')
  const [paymentStatus, setPaymentStatus] = useState('pending')

  const [loading, setLoading] = useState(false)

  /* ---------- FETCH COURSES ---------- */
  const { courses } = useFetchCourses({ limit: 100 })

  /* ---------- AUTO CALCULATE DUE AMOUNT ---------- */
  useEffect(() => {
    if (totalAmount !== undefined && paidAmount !== undefined) {
      setDueAmount(totalAmount - paidAmount)
    }
  }, [totalAmount, paidAmount])

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    if (!studentId || !courseId || !totalAmount) {
      toast.error('Student ID, Course and Total Amount are required')
      return
    }

    const payload = {
      student: studentId,
      course: courseId,

      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount: dueAmount || totalAmount,

      enrollmentStatus,
      paymentStatus,
    }

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/enrollment', payload)

      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success('Enrollment created successfully')

      router.push('/dashboard/enrollment')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Enrollment</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* STUDENT ID */}
        <div>
          <Label>Student ID *</Label>
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter student ID"
          />
        </div>

        {/* COURSE SELECT */}
        <div>
          <Label>Course *</Label>

          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>

            <SelectContent>
              {courses.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TOTAL AMOUNT */}
        <div>
          <Label>Total Amount *</Label>
          <Input
            type="number"
            value={totalAmount || ''}
            onChange={(e) =>
              setTotalAmount(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="e.g 5000"
          />
        </div>

        {/* PAID AMOUNT */}
        <div>
          <Label>Paid Amount</Label>
          <Input
            type="number"
            value={paidAmount || ''}
            onChange={(e) =>
              setPaidAmount(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="e.g 2000"
          />
        </div>

        {/* DUE AMOUNT (READ ONLY) */}
        <div>
          <Label>Due Amount</Label>
          <Input
            type="number"
            value={dueAmount || ''}
            readOnly
            placeholder="Auto calculated"
          />
        </div>

        {/* ENROLLMENT STATUS */}
        <div>
          <Label>Enrollment Status</Label>

          <Select
            value={enrollmentStatus}
            onValueChange={setEnrollmentStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PAYMENT STATUS */}
        <div>
          <Label>Payment Status</Label>

          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SUBMIT BUTTON */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Enrollment'}
        </Button>
      </CardContent>
    </Card>
  )
}
