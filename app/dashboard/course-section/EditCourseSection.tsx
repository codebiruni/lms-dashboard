/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Layers, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------------------------------------------------------------- */

interface EditCourseSectionProps {
  section: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditCourseSection({ 
  section, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditCourseSectionProps) {
  /* -------------------- COURSES -------------------- */
  const {
    courses,
    isLoading: coursesLoading,
    isFetching,
  } = useFetchCourses({
    page: 1,
    limit: 100,
    deleted: false,
  })

  /* -------------------- FORM STATE -------------------- */
  const [course, setCourse] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState<number | ''>('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  /* -------------------- LOAD SECTION DATA -------------------- */
  useEffect(() => {
    if (section && open) {
      setCourse(section.course?._id || '')
      setTitle(section.title || '')
      setDescription(section.description || '')
      setOrder(section.order !== undefined ? section.order : '')
      setIsPublished(section.isPublished || false)
    }
  }, [section, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCourse('')
    setTitle('')
    setDescription('')
    setOrder('')
    setIsPublished(false)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!course || !title || order === '') {
      toast.error('Course, title and order are required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        course,
        title,
        description,
        order: Number(order),
        isPublished,
      }

      const res = await PATCHDATA(`/v1/course-section/${section._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update section')
      }

      toast.success('Course section updated successfully 🎉')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update section')
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
          <Card className="w-full max-w-xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Edit Course Section
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {section?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6">
              {/* ---------------- COURSE ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="course" className="required">Course</Label>
                <Select
                  value={course}
                  onValueChange={setCourse}
                  disabled={coursesLoading || isFetching}
                >
                  <SelectTrigger id="course">
                    <SelectValue
                      placeholder={
                        coursesLoading || isFetching
                          ? 'Loading courses...'
                          : 'Select course'
                      }
                    />
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
                {section?.course && (
                  <p className="text-xs text-muted-foreground">
                    Current: {section.course.title}
                  </p>
                )}
              </div>

              {/* ---------------- TITLE ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Section Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Introduction to JavaScript"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* ---------------- DESCRIPTION ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Short description of this section"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* ---------------- ORDER ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="order" className="required">Order</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="1"
                  value={order}
                  onChange={(e) =>
                    setOrder(e.target.value ? Number(e.target.value) : '')
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Order must be unique per course
                </p>
              </div>

              {/* ---------------- PUBLISH ---------------- */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="publish" className="text-base font-medium">
                    Publish Section
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

              {/* ---------------- SUBMIT ---------------- */}
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
                      <Layers className="mr-2 h-4 w-4" />
                      Update Section
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

              {/* ---------------- REQUIRED FIELDS NOTE ---------------- */}
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