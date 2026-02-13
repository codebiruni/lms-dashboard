/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, BookOpen, Video, FileText, X } from 'lucide-react'
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
import GETDATA from '@/app/default/functions/GetData'

/* -------------------------------------------------------------------------- */

interface EditLessonProps {
  lesson: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type CourseSection = {
  _id: string
  title: string
  course: string
}

/* -------------------------------------------------------------------------- */

export default function EditLesson({ 
  lesson, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditLessonProps) {
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
  const [lessonType, setLessonType] = useState<'video' | 'document' | 'quiz'>('video')
  const [videoUrl, setVideoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [order, setOrder] = useState<number | ''>('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  /* -------------------- LOAD LESSON DATA -------------------- */
  useEffect(() => {
    if (lesson && open) {
      setCourseSection(lesson.courseSection?._id || '')
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setLessonType(lesson.lessonType || 'video')
      setVideoUrl(lesson.videoUrl || '')
      setDocumentUrl(lesson.documentUrl || '')
      setDuration(lesson.duration || '')
      setOrder(lesson.order !== undefined ? lesson.order : '')
      setIsPublished(lesson.isPublished || false)
    }
  }, [lesson, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCourseSection('')
    setTitle('')
    setDescription('')
    setLessonType('video')
    setVideoUrl('')
    setDocumentUrl('')
    setDuration('')
    setOrder('')
    setIsPublished(false)
  }

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

      const res = await PATCHDATA(`/v1/lesson/${lesson._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update lesson')
      }

      toast.success('Lesson updated successfully 🎉')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lesson')
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
          <Card className="w-full max-w-xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Edit Lesson
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {lesson?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6">
              {/* ---------------- COURSE SECTION ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="section" className="required">Course Section</Label>
                <Select
                  value={courseSection}
                  onValueChange={setCourseSection}
                  onOpenChange={(open) => open && fetchSections()}
                >
                  <SelectTrigger id="section">
                    <SelectValue
                      placeholder={
                        loadingSections ? 'Loading...' : 'Select section'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        <div className="flex items-center gap-2">
                          <span>{s.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({s._id.slice(-6)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lesson?.courseSection && (
                  <p className="text-xs text-muted-foreground">
                    Current: {lesson.courseSection.title}
                  </p>
                )}
              </div>

              {/* ---------------- TITLE ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Lesson Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Variables & Data Types"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* ---------------- DESCRIPTION ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Short lesson description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* ---------------- TYPE ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="type">Lesson Type</Label>
                <Select
                  value={lessonType}
                  onValueChange={(v: any) => setLessonType(v)}
                >
                  <SelectTrigger id="type">
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
                  <Label htmlFor="videoUrl" className="required">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  {lesson?.videoUrl && lesson.lessonType === 'video' && (
                    <p className="text-xs text-muted-foreground">
                      Current: {lesson.videoUrl.substring(0, 50)}...
                    </p>
                  )}
                </div>
              )}

              {/* ---------------- DOCUMENT URL ---------------- */}
              {lessonType === 'document' && (
                <div className="space-y-2">
                  <Label htmlFor="documentUrl" className="required">Document URL</Label>
                  <Input
                    id="documentUrl"
                    placeholder="https://..."
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                  />
                  {lesson?.documentUrl && lesson.lessonType === 'document' && (
                    <p className="text-xs text-muted-foreground">
                      Current: {lesson.documentUrl.substring(0, 50)}...
                    </p>
                  )}
                </div>
              )}

              {/* ---------------- DURATION ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="10"
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value ? Number(e.target.value) : '')
                  }
                  min={0}
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
                  Order must be unique per section
                </p>
              </div>

              {/* ---------------- PUBLISH ---------------- */}
              <div className="flex items-center justify-between rounded border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="publish" className="text-base font-medium">
                    Publish Lesson
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
                      <BookOpen className="mr-2 h-4 w-4" />
                      Update Lesson
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