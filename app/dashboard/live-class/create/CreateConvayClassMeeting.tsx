/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, Clock, Users, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogDescription,
} from '@/components/ui/dialog'

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'

interface ConvayMeetingConfig {
  audioEnabled: boolean
  videoEnabled: boolean
  passwordProtected: boolean
  authRequired: boolean
  chatControl: boolean
  reactionsEnabled: boolean
  pollEnabled: boolean
  autoRecord: boolean
}

export default function CreateConvayClassMeeting() {
  const router = useRouter()

  /* ---------- STATES ---------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [instructorId, setInstructorId] = useState<string>()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [isRecorded, setIsRecorded] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [generatingMeeting, setGeneratingMeeting] = useState(false)
  const [generatedMeetingLink, setGeneratedMeetingLink] = useState('')
  const [meetingPassword, setMeetingPassword] = useState('')

  /* ---------- MEETING CONFIGURATION ---------- */
  const [meetingConfig, setMeetingConfig] = useState<ConvayMeetingConfig>({
    audioEnabled: true,
    videoEnabled: false,
    passwordProtected: true,
    authRequired: false,
    chatControl: true,
    reactionsEnabled: true,
    pollEnabled: true,
    autoRecord: false,
  })

  /* ---------- DIALOG STATE ---------- */
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)
  const [createdClass, setCreatedClass] = useState<any>(null)

  /* ---------- FETCH DATA ---------- */
  const { courses } = useFetchCourses({ limit: 100 })
  const { courseSections } = useFetchCourseSections({
    course: courseId,
    limit: 100,
  })
  const { instructors } = useFetchInstructors({ limit: 100 })

  useEffect(() => {
    setSectionId(undefined)
  }, [courseId])

  /* ---------- HELPER: Convert to ISO string with timezone ---------- */
  const convertToISOString = (dateTimeStr: string) => {
    if (!dateTimeStr) return null
    // Create a date object from the local datetime string
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return null
    // Return ISO string which will be parsed correctly on backend
    return date.toISOString()
  }

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    if (!courseId) {
      toast.error('Please select a course')
      return false
    }
    if (!instructorId) {
      toast.error('Please select an instructor')
      return false
    }
    if (!title.trim()) {
      toast.error('Please enter a meeting title')
      return false
    }
    if (!startTime) {
      toast.error('Please select start time')
      return false
    }
    if (!endTime) {
      toast.error('Please select end time')
      return false
    }
    
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    const now = new Date()
    
    if (isNaN(startDate.getTime())) {
      toast.error('Invalid start time')
      return false
    }
    
    if (isNaN(endDate.getTime())) {
      toast.error('Invalid end time')
      return false
    }
    
    if (startDate >= endDate) {
      toast.error('Start time must be before end time')
      return false
    }
    
    if (startDate < now) {
      toast.error('Start time cannot be in the past')
      return false
    }
    
    // Check if meeting duration is reasonable (max 8 hours)
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    if (durationMinutes > 480) {
      toast.error('Meeting duration cannot exceed 8 hours')
      return false
    }
    
    if (durationMinutes < 1) {
      toast.error('Meeting must be at least 1 minute long')
      return false
    }
    
    return true
  }

  /* ---------- CREATE CONVAY MEETING ---------- */
  const handleCreateConvayMeeting = async () => {
    if (!validateForm()) return

    setGeneratingMeeting(true)

    // Convert times to ISO strings for backend
    const startTimeISO = convertToISOString(startTime)
    const endTimeISO = convertToISOString(endTime)

    if (!startTimeISO || !endTimeISO) {
      toast.error('Invalid date/time format')
      setGeneratingMeeting(false)
      return
    }

    const payload = {
      courseId,
      sectionId: sectionId === 'none' ? undefined : sectionId,
      instructorId,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startTimeISO,
      endTime: endTimeISO,
      meetingPlatform: 'convay',
      isRecorded,
      recordingUrl: isRecorded && recordingUrl ? recordingUrl : undefined,
      isCancelled: false,
      convayConfig: {
        audioEnabled: meetingConfig.audioEnabled,
        videoEnabled: meetingConfig.videoEnabled,
        passwordProtected: meetingConfig.passwordProtected,
        authRequired: meetingConfig.authRequired,
        chatControl: meetingConfig.chatControl,
        reactionsEnabled: meetingConfig.reactionsEnabled,
        pollEnabled: meetingConfig.pollEnabled,
        autoRecord: meetingConfig.autoRecord,
      },
    }

    try {
      const res = await POSTDATA('/v1/live-class/convay/create', payload)

      if (!res.success) {
        throw new Error(res.message || 'Failed to create Convay meeting')
      }

      setCreatedClass(res.data)
      setGeneratedMeetingLink(res.data.meetingLink)
      setMeetingPassword(res.data.meetingPassword || '')
      setOpenSuccessDialog(true)

      toast.success('Convay meeting created successfully!')

      // Redirect after 3 seconds
      setTimeout(() => {
        setOpenSuccessDialog(false)
        router.push('/dashboard/live-class')
      }, 3000)
    } catch (err: any) {
      console.error('Convay meeting creation error:', err)
      toast.error(err.message || 'Failed to create Convay meeting')
    } finally {
      setGeneratingMeeting(false)
    }
  }

  /* ---------- PREVIEW MEETING ---------- */
  const handlePreviewMeeting = () => {
    if (!validateForm()) return
    setOpenPreviewDialog(true)
  }

  /* ---------- FORMAT DATE FOR DISPLAY ---------- */
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'Not set'
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /* ---------- SET MIN DATETIME FOR INPUT ---------- */
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Convay Meeting
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and configure your Convay video conference meeting
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Video className="w-4 h-4 mr-2" />
            Convay Meeting v6.1
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>
                  Enter the basic information for your Convay meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Course and Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      Course <span className="text-red-500">*</span>
                    </Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-sm font-semibold">
                      Section (Optional)
                    </Label>
                    <Select value={sectionId} onValueChange={setSectionId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Section</SelectItem>
                        {courseSections.map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Instructor */}
                <div>
                  <Label className="text-sm font-semibold">
                    Instructor <span className="text-red-500">*</span>
                  </Label>
                  <Select value={instructorId} onValueChange={setInstructorId}>
                    <SelectTrigger className="mt-1">
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

                {/* Title */}
                <div>
                  <Label className="text-sm font-semibold">
                    Meeting Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="mt-1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to React - Session 1"
                    maxLength={200}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea
                    className="mt-1"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what will be covered in this session..."
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      className="mt-1"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      min={getMinDateTime()}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      className="mt-1"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      min={startTime || getMinDateTime()}
                    />
                  </div>
                </div>

                {/* Recording Option */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="font-semibold">Record Meeting</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically record this meeting
                    </p>
                  </div>
                  <Switch
                    checked={isRecorded}
                    onCheckedChange={setIsRecorded}
                  />
                </div>

                {isRecorded && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Recording URL (Optional)
                    </Label>
                    <Input
                      className="mt-1"
                      value={recordingUrl}
                      onChange={(e) => setRecordingUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meeting Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Configuration</CardTitle>
                <CardDescription>
                  Customize participant permissions and meeting features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Audio for Participants</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow participants to use microphone
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.audioEnabled}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, audioEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Video for Participants</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow participants to use camera
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.videoEnabled}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, videoEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Password Protection</Label>
                      <p className="text-xs text-muted-foreground">
                        Require password to join meeting
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.passwordProtected}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, passwordProtected: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Authenticated Users Only</Label>
                      <p className="text-xs text-muted-foreground">
                        Only Convay account holders can join
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.authRequired}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, authRequired: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Host Chat Control</Label>
                      <p className="text-xs text-muted-foreground">
                        Host controls participant chat
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.chatControl}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, chatControl: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Reactions</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable emoji reactions
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.reactionsEnabled}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, reactionsEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Polls</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable polling feature
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.pollEnabled}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, pollEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Auto Recording</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-start recording when host joins
                      </p>
                    </div>
                    <Switch
                      checked={meetingConfig.autoRecord}
                      onCheckedChange={(checked) =>
                        setMeetingConfig({ ...meetingConfig, autoRecord: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {startTime && endTime ? (
                        <>
                          {formatDateTime(startTime)}
                          <br />
                          to {formatDateTime(endTime)}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-sm text-muted-foreground">
                      {meetingConfig.authRequired
                        ? 'Authenticated users only'
                        : 'Guests allowed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Video className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Features</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meetingConfig.audioEnabled && (
                        <Badge variant="secondary" className="text-xs">Audio</Badge>
                      )}
                      {meetingConfig.videoEnabled && (
                        <Badge variant="secondary" className="text-xs">Video</Badge>
                      )}
                      {meetingConfig.passwordProtected && (
                        <Badge variant="secondary" className="text-xs">Password</Badge>
                      )}
                      {meetingConfig.reactionsEnabled && (
                        <Badge variant="secondary" className="text-xs">Reactions</Badge>
                      )}
                      {meetingConfig.pollEnabled && (
                        <Badge variant="secondary" className="text-xs">Polls</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {startTime && endTime
                        ? `${Math.round(
                            (new Date(endTime).getTime() - new Date(startTime).getTime()) /
                              (1000 * 60)
                          )} minutes`
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={handlePreviewMeeting}
                  variant="outline"
                  className="w-full"
                  disabled={generatingMeeting}
                >
                  Preview Meeting Details
                </Button>

                <Button
                  onClick={handleCreateConvayMeeting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={generatingMeeting}
                >
                  {generatingMeeting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Convay Meeting...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Create Convay Meeting
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-1">Convay Meeting Features:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>HD video and audio conferencing</li>
                  <li>Screen sharing with host controls</li>
                  <li>Interactive polls and reactions</li>
                  <li>Meeting recording capability</li>
                  <li>Up to 10 concurrent meetings per user</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={openPreviewDialog} onOpenChange={setOpenPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Preview</DialogTitle>
            <DialogDescription>
              Review your Convay meeting details before creating
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-b pb-3">
              <h3 className="font-semibold text-lg">{title || 'Untitled Meeting'}</h3>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Course</p>
                <p className="mt-1">
                  {courses.find((c: any) => c._id === courseId)?.title || 'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instructor</p>
                <p className="mt-1">
                  {instructors.find((i: any) => i._id === instructorId)?.userId?.name ||
                    'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                <p className="mt-1">{formatDateTime(startTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Time</p>
                <p className="mt-1">{formatDateTime(endTime)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Meeting Configuration</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {meetingConfig.audioEnabled && (
                  <Badge variant="default">Audio Enabled</Badge>
                )}
                {meetingConfig.videoEnabled && (
                  <Badge variant="default">Video Enabled</Badge>
                )}
                {meetingConfig.passwordProtected && (
                  <Badge variant="default">Password Protected</Badge>
                )}
                {meetingConfig.authRequired && (
                  <Badge variant="default">Auth Required</Badge>
                )}
                {meetingConfig.autoRecord && <Badge variant="default">Auto Record</Badge>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPreviewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setOpenPreviewDialog(false)
              handleCreateConvayMeeting()
            }}>
              Proceed to Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Convay Meeting Created!</DialogTitle>
            <DialogDescription className="text-center">
              Your meeting has been successfully scheduled
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Meeting Link</p>
              <p className="text-sm text-blue-600 break-all">{generatedMeetingLink}</p>
            </div>
            {meetingPassword && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Meeting Password</p>
                <p className="text-sm font-mono">{meetingPassword}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(generatedMeetingLink)
                toast.success('Meeting link copied to clipboard')
              }}
            >
              Copy Meeting Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}