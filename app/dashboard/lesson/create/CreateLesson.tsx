'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { Loader2, BookOpen, Video, FileText } from 'lucide-react'
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
import GETDATA from '@/app/default/functions/GetData'

/* -------------------------------------------------------------------------- */

type CourseSection = {
  _id: string
  title: string
}

/* -------------------------------------------------------------------------- */

export default function CreateLesson() {
  /* -------------------- SECTION LIST -------------------- */
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loadingSections, setLoadingSections] = useState(false)

  const fetchSections = async () => {
    try {
      setLoadingSections(true)
      const res = await GETDATA<any>('/v1/course-section?deleted=false')

      if (!res.success) throw new Error('Failed to load sections')

      setSections(res.data.data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingSections(false)
    }
  }

  /* -------------------- FORM STATE -------------------- */
  const [courseSection, setCourseSection] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lessonType, setLessonType] =
    useState<'video' | 'document' | 'quiz'>('video')
  const [videoUrl, setVideoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [order, setOrder] = useState<number | ''>('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!courseSection || !title || order === '') {
      toast.error('Section, title and order are required')
      return
    }

    if (lessonType === 'video' && !videoUrl) {
      toast.error('Video URL is required')
      return
    }

    if (lessonType === 'document' && !documentUrl) {
      toast.error('Document URL is required')
      return
    }

    try {
      setLoading(true)

      const payload: any = {
        courseSection,
        title,
        description,
        lessonType,
        order: Number(order),
        isPublished,
        duration: duration ? Number(duration) : 0,
      }

      if (lessonType === 'video') payload.videoUrl = videoUrl
      if (lessonType === 'document') payload.documentUrl = documentUrl

      const res = await POSTDATA('/v1/lesson', payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create lesson')
      }

      toast.success('Lesson created successfully 🎉')

      /* reset */
      setTitle('')
      setDescription('')
      setVideoUrl('')
      setDocumentUrl('')
      setDuration('')
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
            Create Lesson
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- SECTION ---------------- */}
          <div className="space-y-2">
            <Label>Course Section</Label>
            <Select
              value={courseSection}
              onValueChange={setCourseSection}
              onOpenChange={(open) => open && fetchSections()}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingSections ? 'Loading...' : 'Select section'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ---------------- TITLE ---------------- */}
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input
              placeholder="e.g. Variables & Data Types"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ---------------- DESCRIPTION ---------------- */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Short lesson description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ---------------- TYPE ---------------- */}
          <div className="space-y-2">
            <Label>Lesson Type</Label>
            <Select
              value={lessonType}
              onValueChange={(v: any) => setLessonType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video size={16} /> Video
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <FileText size={16} /> Document
                  </div>
                </SelectItem>
                <SelectItem value="quiz">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} /> Quiz
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ---------------- VIDEO URL ---------------- */}
          {lessonType === 'video' && (
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          )}

          {/* ---------------- DOCUMENT URL ---------------- */}
          {lessonType === 'document' && (
            <div className="space-y-2">
              <Label>Document URL</Label>
              <Input
                placeholder="https://..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
              />
            </div>
          )}

          {/* ---------------- DURATION ---------------- */}
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="10"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value ? Number(e.target.value) : '')
              }
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
              Order must be unique per section
            </p>
          </div>

          {/* ---------------- PUBLISH ---------------- */}
          <div className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">Publish Lesson</p>
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
                <BookOpen className="mr-2 h-4 w-4" />
                Create Lesson
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
