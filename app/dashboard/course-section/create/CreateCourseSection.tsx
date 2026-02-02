'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { Loader2, Layers } from 'lucide-react'
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

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------------------------------------------------------------- */

export default function CreateCourseSection() {
  /* -------------------- COURSES -------------------- */
  const {
    courses,
    isLoading: coursesLoading,
    isFetching,
  } = useFetchCourses({
    page: 1,
    limit: 100, // enough for dropdown
    deleted: false,
  })

  /* -------------------- FORM STATE -------------------- */
  const [course, setCourse] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState<number | ''>('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

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

      const res = await POSTDATA('/v1/course-section', payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create section')
      }

      toast.success('Course section created successfully 🎉')

      /* reset */
      setCourse('')
      setTitle('')
      setDescription('')
      setOrder('')
      setIsPublished(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create Course Section
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- COURSE ---------------- */}
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={course}
              onValueChange={setCourse}
              disabled={coursesLoading || isFetching}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    coursesLoading || isFetching
                      ? 'Loading courses...'
                      : 'Select course'
                  }
                />
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

          {/* ---------------- TITLE ---------------- */}
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input
              placeholder="e.g. Introduction to JavaScript"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ---------------- DESCRIPTION ---------------- */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Short description of this section"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ---------------- ORDER ---------------- */}
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              placeholder="1"
              value={order}
              onChange={(e) =>
                setOrder(e.target.value ? Number(e.target.value) : '')
              }
            />
            <p className="text-xs text-muted-foreground">
              Order must be unique per course
            </p>
          </div>

          {/* ---------------- PUBLISH ---------------- */}
          <div className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">Publish Section</p>
              <p className="text-xs text-muted-foreground">
                Visible to students
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {/* ---------------- SUBMIT ---------------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Layers className="mr-2 h-4 w-4" />
                Create Section
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
