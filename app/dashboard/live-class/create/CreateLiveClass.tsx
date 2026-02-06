/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'

export default function CreateLiveClass() {
  const router = useRouter()

  /* ---------- STATES ---------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [instructorId, setInstructorId] = useState<string>()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [meetingLink, setMeetingLink] = useState('')
  const [meetingPlatform, setMeetingPlatform] =
    useState<'google-meet' | 'zoom' | 'other'>('google-meet')

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [isRecorded, setIsRecorded] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')

  const [isCancelled, setIsCancelled] = useState(false)

  const [loading, setLoading] = useState(false)

  /* ---------- DIALOG STATE ---------- */
  const [openDialog, setOpenDialog] = useState(false)
  const [tempLink, setTempLink] = useState('')

  /* ---------- FETCH DATA ---------- */
  const { courses } = useFetchCourses({ limit: 100 })

  const { courseSections } = useFetchCourseSections({
    course: courseId,
    limit: 100,
  })

  const { instructors } = useFetchInstructors({
    limit: 100,
  })

  useEffect(() => {
    setSectionId(undefined)
  }, [courseId])

  /* ---------- OPEN PLATFORM ---------- */
  const openPlatformForMeeting = () => {
    if (meetingPlatform === 'google-meet') {
      window.open('https://calendar.google.com/calendar/u/0/r/eventedit?vcon=meet&dates=now&hl=en&pli=1', '_blank')
    } else if (meetingPlatform === 'zoom') {
      window.open('https://zoom.us/meeting/schedule', '_blank')
    } else {
      toast.info('Please manually create meeting and paste link')
    }

    setTempLink(meetingLink)
    setOpenDialog(true)
  }

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!courseId || !title || !startTime || !endTime || !instructorId) {
      toast.error('Please fill all required fields')
      return
    }

    const payload = {
      courseId,
      sectionId,
      instructorId,
      title,
      description,
      meetingLink,
      meetingPlatform,
      startTime,
      endTime,
      isRecorded,
      recordingUrl,
      isCancelled,
    }

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/live-class', payload)

      if (!res.success) throw new Error(res.message)

      toast.success('Live class created successfully')

      router.push('/dashboard/live-class')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create Live Class</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <Label>Section (Optional)</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {courseSections.map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Instructor *</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((inst: any) => (
                  <SelectItem key={inst._id} value={inst._id}>
                    {inst.userId?.name || 'Unknown Instructor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Meeting Platform</Label>
            <Select
              value={meetingPlatform}
              onValueChange={(v: any) => setMeetingPlatform(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-meet">Google Meet</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SMART MEETING LINK SECTION */}
          <div className="space-y-3 border p-4 rounded-md bg-slate-50">
            <Label>Meeting Link</Label>

            <div className="flex gap-2">
              <Input
                value={meetingLink}
                readOnly
                placeholder="No meeting link added yet"
              />

              <Button type="button" onClick={openPlatformForMeeting}>
                Create Meeting Link
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Click the button to open meeting platform, create the meeting,
              then paste the generated link.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time *</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label>End Time *</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Live Class'}
          </Button>
        </CardContent>
      </Card>

      {/* DIALOG TO PASTE LINK */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paste Generated Meeting Link</DialogTitle>
          </DialogHeader>

          <Input
            value={tempLink}
            onChange={(e) => setTempLink(e.target.value)}
            placeholder="Paste meeting link here..."
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                setMeetingLink(tempLink)
                setOpenDialog(false)
                toast.success('Meeting link saved')
              }}
            >
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
