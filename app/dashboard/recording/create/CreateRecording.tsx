/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'

export default function CreateRecording() {
  const router = useRouter()

  /* ---------- STATES ---------- */
  const [courseId, setCourseId] = useState<string>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState<number | undefined>()
  const [size, setSize] = useState<number | undefined>()

  const [loading, setLoading] = useState(false)

  /* ---------- FETCH COURSES ---------- */
  const { courses } = useFetchCourses({ limit: 100 })

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
      // uploadedBy will be set automatically from backend auth
    }

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/recording', payload)

      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success('Recording created successfully')

      router.push('/dashboard/recording')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Recording</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* COURSE SELECT */}
        <div>
          <Label>Course *</Label>

          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>

            <SelectContent>
              {courses.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TITLE */}
        <div>
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Recording title"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        {/* VIDEO URL */}
        <div>
          <Label>Video URL *</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* DURATION & SIZE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={duration || ''}
              onChange={(e) =>
                setDuration(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="e.g 45"
            />
          </div>

          <div>
            <Label>File Size (MB)</Label>
            <Input
              type="number"
              value={size || ''}
              onChange={(e) =>
                setSize(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="e.g 500"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Recording'}
        </Button>
      </CardContent>
    </Card>
  )
}
