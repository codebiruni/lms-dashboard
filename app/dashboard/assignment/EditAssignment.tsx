/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, FileText, X } from 'lucide-react'

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

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchLessons from '@/app/default/custom-component/useFeatchLesson'

/* -------------------------------------------------------------------------- */

interface EditAssignmentProps {
  assignment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------------------------------------------------------------- */

export default function EditAssignment({ 
  assignment, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditAssignmentProps) {
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
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })

  const { courseSections, isLoading: sectionsLoading } = useFetchCourseSections({
    course: courseId,
    published: true,
    limit: 100,
  })

  const { lessons, isLoading: lessonsLoading } = useFetchLessons({
    courseSection: sectionId,
    published: true,
    limit: 100,
  })

  /* -------------------- LOAD ASSIGNMENT DATA -------------------- */
  useEffect(() => {
    if (assignment && open) {
      setCourseId(assignment.courseId?._id || '')
      setSectionId(assignment.sectionId?._id || '')
      setLessonId(assignment.lessonId?._id || '')
      setTitle(assignment.title || '')
      setDescription(assignment.description || '')
      setTotalMarks(assignment.totalMarks || 0)
      setDueDate(assignment.dueDate ? assignment.dueDate.split('T')[0] : '')
      setIsPublished(assignment.isPublished || false)
    }
  }, [assignment, open])

  /* -------------------- RESET DEPENDENCIES -------------------- */
  useEffect(() => {
    if (open) {
      if (!courseId) {
        setSectionId(undefined)
        setLessonId(undefined)
      }
    }
  }, [courseId, open])

  useEffect(() => {
    if (open) {
      if (!sectionId) {
        setLessonId(undefined)
      }
    }
  }, [sectionId, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCourseId('')
    setSectionId(undefined)
    setLessonId(undefined)
    setTitle('')
    setDescription('')
    setTotalMarks(0)
    setDueDate('')
    setIsPublished(true)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!courseId || !title || !totalMarks || !dueDate) {
      toast.error('Course, title, total marks and due date are required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        courseId,
        sectionId: sectionId || null,
        lessonId: lessonId || null,
        title,
        description,
        totalMarks,
        dueDate: new Date(dueDate).toISOString(),
        isPublished,
      }

      const res = await PATCHDATA(`/v1/assignment/${assignment._id}`, payload)

      if (res?.success) {
        toast.success('Assignment updated successfully')
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        throw new Error(res?.message || 'Failed to update assignment')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update assignment')
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
          <Card className="w-full max-w-2xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Edit Assignment
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {assignment?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 py-6">
              {/* COURSE */}
              <div className="space-y-2">
                <Label htmlFor="course" className="required">Course</Label>
                <Select
                  value={courseId}
                  onValueChange={(v) => setCourseId(v)}
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
                {assignment?.courseId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {assignment.courseId.title}
                  </p>
                )}
              </div>

              {/* SECTION */}
              <div className="space-y-2">
                <Label htmlFor="section">Section (Optional)</Label>
                <Select
                  value={sectionId}
                  onValueChange={(v) => setSectionId(v)}
                  disabled={!courseId || sectionsLoading}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder={!courseId ? 'Select course first' : 'Select section'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {courseSections.map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignment?.sectionId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {assignment.sectionId.title}
                  </p>
                )}
              </div>

              {/* LESSON */}
              <div className="space-y-2">
                <Label htmlFor="lesson">Lesson (Optional)</Label>
                <Select
                  value={lessonId}
                  onValueChange={(v) => setLessonId(v === 'none' ? undefined : v)}
                  disabled={!sectionId || lessonsLoading}
                >
                  <SelectTrigger id="lesson">
                    <SelectValue placeholder={!sectionId ? 'Select section first' : 'Select lesson'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {lessons.map((l: any) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignment?.lessonId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {assignment.lessonId.title}
                  </p>
                )}
              </div>

              {/* TITLE */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Assignment title"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Assignment description"
                  rows={3}
                />
              </div>

              {/* MARKS & DATE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="required">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="required">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* PUBLISH */}
              <div className="flex items-center justify-between rounded border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="publish" className="text-base font-medium">
                    Publish Assignment
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible to students when published
                  </p>
                </div>
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
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
                      <FileText className="mr-2 h-4 w-4" />
                      Update Assignment
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

              {/* REQUIRED FIELDS NOTE */}
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