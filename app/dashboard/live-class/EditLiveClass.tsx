/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Video, X, Link as LinkIcon } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'

/* -------------------- Types -------------------- */

interface EditLiveClassProps {
  liveClass: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditLiveClass({
  liveClass,
  open,
  onOpenChange,
  onSuccess
}: EditLiveClassProps) {
  /* ---------- STATES ---------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [instructorId, setInstructorId] = useState<string>()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [meetingLink, setMeetingLink] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState<'google-meet' | 'zoom' | 'other'>('google-meet')

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
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })

  const { courseSections, isLoading: sectionsLoading } = useFetchCourseSections({
    course: courseId,
    limit: 100,
  })

  const { instructors, isLoading: instructorsLoading } = useFetchInstructors({
    limit: 100,
  })

  /* ---------- LOAD LIVE CLASS DATA ---------- */
  useEffect(() => {
    if (liveClass && open) {
      setCourseId(liveClass.courseId?._id || '')
      setSectionId(liveClass.sectionId?._id || '')
      setInstructorId(liveClass.instructorId?._id || '')
      setTitle(liveClass.title || '')
      setDescription(liveClass.description || '')
      setMeetingLink(liveClass.meetingLink || '')
      setMeetingPlatform(liveClass.meetingPlatform || 'google-meet')
      
      // Format dates for datetime-local input
      if (liveClass.startTime) {
        const start = new Date(liveClass.startTime)
        setStartTime(start.toISOString().slice(0, 16))
      }
      if (liveClass.endTime) {
        const end = new Date(liveClass.endTime)
        setEndTime(end.toISOString().slice(0, 16))
      }
      
      setIsRecorded(liveClass.isRecorded || false)
      setRecordingUrl(liveClass.recordingUrl || '')
      setIsCancelled(liveClass.isCancelled || false)
      setTempLink(liveClass.meetingLink || '')
    }
  }, [liveClass, open])

  /* ---------- RESET DEPENDENCIES ---------- */
  useEffect(() => {
    if (open) {
      if (!courseId) {
        setSectionId(undefined)
      }
    }
  }, [courseId, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setCourseId('')
    setSectionId(undefined)
    setInstructorId('')
    setTitle('')
    setDescription('')
    setMeetingLink('')
    setMeetingPlatform('google-meet')
    setStartTime('')
    setEndTime('')
    setIsRecorded(false)
    setRecordingUrl('')
    setIsCancelled(false)
    setTempLink('')
  }

  /* ---------- OPEN PLATFORM FOR MEETING ---------- */
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
      toast.error('Course, title, start time, end time and instructor are required')
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('End time must be after start time')
      return
    }

    try {
      setLoading(true)

      const payload = {
        courseId,
        sectionId: sectionId || null,
        instructorId,
        title,
        description,
        meetingLink,
        meetingPlatform,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        isRecorded,
        recordingUrl: recordingUrl || null,
        isCancelled,
      }

      const res = await PATCHDATA(`/v1/live-class/${liveClass._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update live class')
      }

      toast.success('Live class updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update live class')
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
          <Card className="w-full max-w-4xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Edit Live Class
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {liveClass?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* Course & Section */}
              <div className="grid grid-cols-2 gap-4">
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
                  {liveClass?.courseId && (
                    <p className="text-xs text-muted-foreground">
                      Current: {liveClass.courseId.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section (Optional)</Label>
                  <Select
                    value={sectionId}
                    onValueChange={setSectionId}
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
                  {liveClass?.sectionId && (
                    <p className="text-xs text-muted-foreground">
                      Current: {liveClass.sectionId.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Instructor */}
              <div className="space-y-2">
                <Label htmlFor="instructor" className="required">Instructor</Label>
                <Select
                  value={instructorId}
                  onValueChange={setInstructorId}
                  disabled={instructorsLoading}
                >
                  <SelectTrigger id="instructor">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((inst: any) => (
                      <SelectItem key={inst._id} value={inst._id}>
                        <div className="flex items-center gap-2">
                          <span>{inst.userId?.name || 'Unknown Instructor'}</span>
                          <span className="text-xs text-muted-foreground">
                            ({inst.id})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {liveClass?.instructorId && (
                  <p className="text-xs text-muted-foreground">
                    Current: {liveClass.instructorId.userId?.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Live class title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Class description"
                  rows={3}
                />
              </div>

              {/* Meeting Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Meeting Platform</Label>
                <Select
                  value={meetingPlatform}
                  onValueChange={(v: any) => setMeetingPlatform(v)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Link */}
              <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                <Label htmlFor="meetingLink">Meeting Link</Label>

                <div className="flex gap-2">
                  <Input
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Paste meeting link here"
                    className="flex-1"
                  />

                  <Button type="button" onClick={openPlatformForMeeting} variant="outline">
                    <LinkIcon size={16} className="mr-2" />
                    Create Link
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Click the button to open meeting platform, create the meeting, then paste the generated link.
                </p>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="required">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="required">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Recording Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isRecorded" className="text-base font-medium">
                    Class Recorded
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable if this class was recorded
                  </p>
                </div>
                <Switch
                  id="isRecorded"
                  checked={isRecorded}
                  onCheckedChange={setIsRecorded}
                />
              </div>

              {/* Recording URL - Show only if recorded */}
              {isRecorded && (
                <div className="space-y-2">
                  <Label htmlFor="recordingUrl">Recording URL</Label>
                  <Input
                    id="recordingUrl"
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Cancel Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isCancelled" className="text-base font-medium">
                    Cancel Class
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark this class as cancelled
                  </p>
                </div>
                <Switch
                  id="isCancelled"
                  checked={isCancelled}
                  onCheckedChange={setIsCancelled}
                />
              </div>

              {/* Current Status Badge */}
              {liveClass && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Badge variant="outline">Current Status</Badge>
                  {liveClass.isDeleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : liveClass.isCancelled ? (
                    <Badge variant="destructive">Cancelled</Badge>
                  ) : new Date(liveClass.startTime) > new Date() ? (
                    <Badge variant="default">Upcoming</Badge>
                  ) : new Date(liveClass.endTime) < new Date() ? (
                    <Badge variant="secondary">Ended</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">Live</Badge>
                  )}
                </div>
              )}

              {/* Actions */}
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
                      <Video className="mr-2 h-4 w-4" />
                      Update Live Class
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

      {/* Dialog to Paste Link */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paste Generated Meeting Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <Input
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              placeholder="Paste meeting link here..."
              className="w-full"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
    </div>
  )
}