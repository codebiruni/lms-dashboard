/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Film, X, Link as LinkIcon } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

/* -------------------- Types -------------------- */

interface EditRecordingProps {
  recording: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditRecording({
  recording,
  open,
  onOpenChange,
  onSuccess
}: EditRecordingProps) {
  /* ---------- STATES ---------- */
  const [courseId, setCourseId] = useState<string>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState<number | undefined>()
  const [size, setSize] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)

  /* ---------- FETCH COURSES ---------- */
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })

  /* ---------- LOAD RECORDING DATA ---------- */
  useEffect(() => {
    if (recording && open) {
      setCourseId(recording.courseId?._id || '')
      setTitle(recording.title || '')
      setDescription(recording.description || '')
      setVideoUrl(recording.videoUrl || '')
      setDuration(recording.duration || undefined)
      setSize(recording.size || undefined)
    }
  }, [recording, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setCourseId('')
    setTitle('')
    setDescription('')
    setVideoUrl('')
    setDuration(undefined)
    setSize(undefined)
  }

  /* ---------- HELPER: CONVERT YOUTUBE TO EMBED ---------- */
  const convertToEmbedUrl = (url: string) => {
    try {
      if (!url) return url

      // Handle different youtube formats
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

      const match = url.match(youtubeRegex)

      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }

      // If not youtube link, return original
      return url
    } catch (error) {
      return url
    }
  }

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    if (!courseId || !title || !videoUrl) {
      toast.error('Course, Title and Video URL are required')
      return
    }

    // Convert youtube url to embed url if needed
    const finalVideoUrl = convertToEmbedUrl(videoUrl)

    const payload = {
      courseId,
      title,
      description,
      videoUrl: finalVideoUrl,
      duration,
      size,
    }

    try {
      setLoading(true)

      const res = await PATCHDATA(`/v1/recording/${recording._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update recording')
      }

      toast.success('Recording updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update recording')
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
          <Card className="w-full max-w-3xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Edit Recording
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {recording?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* Video Preview */}
              {videoUrl && (
                <div className="space-y-2">
                  <Label>Video Preview</Label>
                  <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
                    <iframe
                      src={convertToEmbedUrl(videoUrl)}
                      title={title || 'Video preview'}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}

              {/* COURSE SELECT */}
              <div className="space-y-2">
                <Label htmlFor="course" className="required">Course</Label>
                <Select
                  value={courseId}
                  onValueChange={setCourseId}
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
                {recording?.courseId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {recording.courseId.title}
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
                  placeholder="Recording title"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              {/* VIDEO URL */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="required">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1"
                  />
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 border rounded hover:bg-muted"
                    >
                      <LinkIcon size={16} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports YouTube links (automatically converted to embed format)
                </p>
              </div>

              {/* DURATION & SIZE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration || ''}
                    onChange={(e) =>
                      setDuration(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="e.g 45"
                    min={0}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">File Size (MB)</Label>
                  <Input
                    id="size"
                    type="number"
                    value={size || ''}
                    onChange={(e) =>
                      setSize(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="e.g 500"
                    min={0}
                    step={1}
                  />
                </div>
              </div>

              {/* Current Status Badge */}
              {recording && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                  <Badge variant="outline">Current Status</Badge>
                  <Badge variant={recording.isDeleted ? 'destructive' : 'secondary'}>
                    {recording.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                  {recording.uploadedBy && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Uploaded by: {recording.uploadedBy.name}
                    </span>
                  )}
                </div>
              )}

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
                      <Film className="mr-2 h-4 w-4" />
                      Update Recording
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