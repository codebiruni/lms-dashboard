/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

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

export default function CreateFollowUp() {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [note, setNote] = useState<string>('')
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date().toISOString().slice(0, 16) // for datetime-local input
  )
  const [status, setStatus] = useState<'requested' | 'approved' | 'will-try'>('requested')
  const [submitting, setSubmitting] = useState(false)

  /* Fetch Courses for optional course selection */
  const { courses, isLoading: courseLoading } = useFetchCourses({})

  /* -------- Submit Handler -------- */
  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!note.trim()) {
        toast.error('Please enter a note')
        return
      }

      const payload = {
        courseId: courseId || undefined, // optional
        note,
        followUpDate: new Date(followUpDate),
        status,
      }

      await POSTDATA('/v1/follow-up', payload)
      toast.success('Follow-up created successfully 🎉')

      // Reset form
      setCourseId(null)
      setNote('')
      setFollowUpDate(new Date().toISOString().slice(0, 16))
      setStatus('requested')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create follow-up')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Follow-Up</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Course Selector (Optional) */}
          <div>
            <p className="mb-1 text-sm font-medium">Course (optional)</p>
            {courseLoading ? (
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <Select
                onValueChange={(v) => setCourseId(v)}
                value={courseId || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Note */}
          <div>
            <p className="mb-1 text-sm font-medium">Note</p>
            <Input
              placeholder="Enter follow-up note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Follow-Up Date */}
          <div>
            <p className="mb-1 text-sm font-medium">Follow-Up Date</p>
            <Input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <p className="mb-1 text-sm font-medium">Status</p>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="will-try">Will Try</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Follow-Up'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
