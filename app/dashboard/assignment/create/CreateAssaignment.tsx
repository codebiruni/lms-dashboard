/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchLessons from '@/app/default/custom-component/useFeatchLesson'
import POSTDATA from '@/app/default/functions/Post'

export default function CreateAssignment() {
  const router = useRouter()

  /* -------------------- STATE -------------------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [lessonId, setLessonId] = useState<string>()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalMarks, setTotalMarks] = useState<number>(0)
  const [dueDate, setDueDate] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const [loading, setLoading] = useState(false)

  /* -------------------- DATA -------------------- */
  const { courses } = useFetchCourses({ limit: 100 })

  const { courseSections } = useFetchCourseSections({
    course: courseId,
    published: true,
    limit: 100,
  })

  const { lessons } = useFetchLessons({
    courseSection: sectionId,
    published: true,
    limit: 100,
  })

  /* -------------------- RESET DEPENDENCIES -------------------- */
  useEffect(() => {
    setSectionId(undefined)
    setLessonId(undefined)
  }, [courseId])

  useEffect(() => {
    setLessonId(undefined)
  }, [sectionId])

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!courseId || !title || !totalMarks || !dueDate) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/assignment', {
        courseId,
        sectionId,
        lessonId,
        title,
        description,
        totalMarks,
        dueDate,
        isPublished,
      })

      if (res.success) {
        toast.success('Assignment created successfully')
        router.push('/dashboard/assignment')
      } else {
        toast.error(res.message || 'Failed to create assignment')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Create Assignment</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* COURSE */}
        <div className="space-y-1">
          <Label>Course *</Label>
          <Select
            value={courseId}
            onValueChange={(v) => setCourseId(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c:any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SECTION */}
        <div className="space-y-1">
          <Label>Section</Label>
          <Select
            value={sectionId}
            onValueChange={(v) => setSectionId(v)}
            disabled={!courseId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {courseSections.map((s:any) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LESSON */}
        <div className="space-y-1">
          <Label>Lesson</Label>
          <Select
            value={lessonId}
            onValueChange={(v) => setLessonId(v)}
            disabled={!sectionId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l:any) => (
                <SelectItem key={l._id} value={l._id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TITLE */}
        <div className="space-y-1">
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Assignment description"
          />
        </div>

        {/* MARKS & DATE */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Total Marks *</Label>
            <Input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label>Due Date *</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* PUBLISH */}
        <div className="flex items-center gap-3">
          <Switch
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label>Published</Label>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
