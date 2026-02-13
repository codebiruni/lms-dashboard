/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

  /* -------- Reset selections when course changes -------- */
  useEffect(() => {
    setSectionId(null)
    setSelectedLessons([])
  }, [courseId])

  /* -------- Reset selections when section changes -------- */
  useEffect(() => {
    setSelectedLessons([])
  }, [sectionId])

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

  /* -------- Submit - Send ALL lessons in ONE request -------- */
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

      // Send ALL selected lessons in ONE request
      const payload = {
        student: studentId.trim(),
        course: courseId,
        completedLessons: selectedLessons, // Send array of ALL lesson IDs
      }

      const res = await POSTDATA('/v1/course-progress', payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update progress')
      }

      toast.success(`Course progress updated successfully! ${selectedLessons.length} lessons marked as completed. 🎉`)

      // Reset form
      setSelectedLessons([])
      setStudentId('')
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to update progress')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Course Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mark completed lessons for a student in a specific course
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- Course Selection Row -------- */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Course Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Course *</Label>

              {courseLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={courseId || undefined}
                  onValueChange={(v) => setCourseId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Course" />
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

            {/* Section Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Section</Label>

              {sectionLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={sectionId || undefined}
                  disabled={!courseId}
                  onValueChange={(v) => setSectionId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Section" />
                  </SelectTrigger>

                  <SelectContent>
                    {courseSections.map((section: any) => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Student ID Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Student ID *</Label>
              <Input
                type="text"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </div>

          {/* -------- Lessons Table -------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Lessons</Label>
              {sectionId && lessons.length > 0 && (
                <Badge variant="outline">
                  {selectedLessons.length} of {lessons.length} selected
                </Badge>
              )}
            </div>

            {!sectionId ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Please select a section to view lessons
                </p>
              </div>
            ) : lessonLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : lessons.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No lessons found in this section
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLessons.length === lessons.length}
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
                            checked={selectedLessons.includes(lesson._id)}
                            onCheckedChange={(v) => handleSelectLesson(lesson._id, !!v)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {lesson.lessonType}
                          </Badge>
                        </TableCell>
                        <TableCell>{lesson.duration || '-'} min</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* -------- Summary Card -------- */}
          {selectedLessons.length > 0 && (
            <div className="bg-muted/20 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ready to submit</p>
                  <p className="text-xs text-muted-foreground">
                    You are marking {selectedLessons.length} lesson{selectedLessons.length > 1 ? 's' : ''} as completed
                  </p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  {selectedLessons.length} lesson{selectedLessons.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          )}

          {/* -------- Submit Button -------- */}
          <Button
            className="w-full"
            size="lg"
            disabled={
              submitting || 
              !courseId || 
              !sectionId || 
              !studentId.trim() || 
              selectedLessons.length === 0
            }
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Progress...
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