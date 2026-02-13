'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, X, Calendar, User, BookOpen } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------- Types -------------------- */

interface EditFollowUpProps {
  followUp: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditFollowUp({
  followUp,
  open,
  onOpenChange,
  onSuccess
}: EditFollowUpProps) {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [note, setNote] = useState<string>('')
  const [followUpDate, setFollowUpDate] = useState<string>('')
  const [status, setStatus] = useState<'requested' | 'approved' | 'will-try'>('requested')
  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* Fetch Courses */
  const { courses, isLoading: courseLoading } = useFetchCourses({})

  /* Load FollowUp Data */
  useEffect(() => {
    if (followUp && open) {
      setCourseId(followUp.courseId?._id || null)
      setNote(followUp.note || '')
      
      // Format date for datetime-local input
      if (followUp.followUpDate) {
        const date = new Date(followUp.followUpDate)
        setFollowUpDate(date.toISOString().slice(0, 16))
      }
      
      setStatus(followUp.status || 'requested')
      setFetching(false)
    }
  }, [followUp, open])

  /* Reset Form */
  const resetForm = () => {
    setCourseId(null)
    setNote('')
    setFollowUpDate('')
    setStatus('requested')
  }

  /* Submit Handler */
  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!note.trim()) {
        toast.error('Please enter a note')
        return
      }

      if (!followUpDate) {
        toast.error('Please select a follow-up date')
        return
      }

      const payload = {
        courseId: courseId || undefined,
        note,
        followUpDate: new Date(followUpDate),
        status,
      }

      const res = await PATCHDATA(`/v1/follow-up/${followUp._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update follow-up')
      }

      toast.success('Follow-up updated successfully 🎉')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow-up')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!open) return null

  /* Loading State */
  if (fetching) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  /* UI */
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-2xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Follow-Up
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{followUp?.user?.name} ({followUp?.user?.email})</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 py-6">
              {/* User Info Display */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                {followUp?.user?.image ? (
                  <div className="relative w-10 h-10 rounded full overflow-hidden">
                    <Image
                      src={followUp.user.image}
                      alt={followUp.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">User ID: {followUp?.user?.id}</p>
                  <p className="text-xs text-muted-foreground">Role: {followUp?.user?.role}</p>
                </div>
              </div>

              {/* Course Selector (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="course">Course (optional)</Label>
                {courseLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={courseId || ''}
                    onValueChange={(v) => setCourseId(v || null)}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course._id} value={course._id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {followUp?.courseId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {followUp.courseId.title}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note" className="required">Note</Label>
                <Input
                  id="note"
                  placeholder="Enter follow-up note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Follow-Up Date */}
              <div className="space-y-2">
                <Label htmlFor="followUpDate" className="required">Follow-Up Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="followUpDate"
                    type="datetime-local"
                    className="pl-10"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as any)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="will-try">Will Try</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={followUp?.isDeleted ? 'destructive' : 'default'}>
                  {followUp?.isDeleted ? 'Deleted' : 'Active'}
                </Badge>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Follow-Up'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
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