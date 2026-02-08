/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchLessons from '@/app/default/custom-component/useFeatchLesson'

import POSTDATA from '@/app/default/functions/Post'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function CreateCourseProgress() {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string>('')

  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  /* -------- Fetch Courses -------- */
  const { courses, isLoading: courseLoading } = useFetchCourses({})

  /* -------- Fetch Sections -------- */
  const {
    courseSections,
    isLoading: sectionLoading,
  } = useFetchCourseSections({
    course: courseId || undefined,
    limit: 100,
  })

  /* -------- Fetch Lessons -------- */
  const {
    lessons,
    isLoading: lessonLoading,
  } = useFetchLessons({
    courseSection: sectionId || undefined,
    limit: 100,
  })

  /* -------- Select All Lessons -------- */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLessons(lessons.map((l: any) => l._id))
    } else {
      setSelectedLessons([])
    }
  }

  /* -------- Single Select -------- */
  const handleSelectLesson = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLessons((prev) => [...prev, id])
    } else {
      setSelectedLessons((prev) => prev.filter((l) => l !== id))
    }
  }

  /* -------- Submit -------- */
  const handleSubmit = async () => {
    if (!courseId) {
      toast.error('Please select course')
      return
    }

    if (!studentId.trim()) {
      toast.error('Please enter student ID')
      return
    }

    if (selectedLessons.length === 0) {
      toast.error('Please select at least one lesson')
      return
    }

    try {
      setSubmitting(true)

      for (const lessonId of selectedLessons) {
        const payload = {
          student: studentId.trim(),
          course: courseId,
          completedLessons: [lessonId],
        }

        await POSTDATA('/v1/course-progress', payload)
      }

      toast.success('Course progress updated successfully 🎉')

      setSelectedLessons([])
      setStudentId('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update progress')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Course Progress</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* -------- Course -------- */}
            <div>
              <p className="mb-2 text-sm font-medium">Select Course</p>

              {courseLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  onValueChange={(v) => {
                    setCourseId(v)
                    setSectionId(null)
                    setSelectedLessons([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Course" />
                  </SelectTrigger>

                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem
                        key={course._id}
                        value={course._id}
                      >
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* -------- Section -------- */}
            <div>
              <p className="mb-2 text-sm font-medium">Select Section</p>

              {sectionLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  disabled={!courseId}
                  onValueChange={(v) => {
                    setSectionId(v)
                    setSelectedLessons([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Section" />
                  </SelectTrigger>

                  <SelectContent>
                    {courseSections.map((section: any) => (
                      <SelectItem
                        key={section._id}
                        value={section._id}
                      >
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* -------- Student Input -------- */}
            <div>
              <p className="mb-2 text-sm font-medium">Student ID</p>
              <input
                type="text"
                placeholder="Enter Student ID"
                className="w-full border rounded px-3 py-2 text-sm"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </div>

          {/* -------- Lessons -------- */}
          <div>
            <p className="mb-3 font-medium">Lessons</p>

            {lessonLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No lessons found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={
                          selectedLessons.length === lessons.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>

                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {lessons.map((lesson: any) => (
                    <TableRow key={lesson._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLessons.includes(
                            lesson._id
                          )}
                          onCheckedChange={(v) =>
                            handleSelectLesson(
                              lesson._id,
                              !!v
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>{lesson.title}</TableCell>

                      <TableCell>
                        <Badge>{lesson.lessonType}</Badge>
                      </TableCell>

                      <TableCell>{lesson.duration} min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Button
            className="w-full"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Progress...
              </>
            ) : (
              'Create Course Progress'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
