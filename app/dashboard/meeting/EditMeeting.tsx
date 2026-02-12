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
import { Label } from '@/components/ui/label'
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

/* -------------------- Types -------------------- */

interface EditMeetingProps {
  meeting: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditMeeting({
  meeting,
  open,
  onOpenChange,
  onSuccess
}: EditMeetingProps) {
  /* ---------- STATES ---------- */
  const [platform, setPlatform] = useState<'google-meet' | 'zoom' | 'teams' | 'other'>('google-meet')
  const [meetingId, setMeetingId] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [passcode, setPasscode] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState<'scheduled' | 'ongoing' | 'ended' | 'cancelled'>('scheduled')
  const [loading, setLoading] = useState(false)

  /* ---------- DIALOG STATE ---------- */
  const [openDialog, setOpenDialog] = useState(false)
  const [tempLink, setTempLink] = useState('')

  /* ---------- LOAD MEETING DATA ---------- */
  useEffect(() => {
    if (meeting && open) {
      setPlatform(meeting.platform || 'google-meet')
      setMeetingId(meeting.meetingId || '')
      setMeetingLink(meeting.meetingLink || '')
      setPasscode(meeting.passcode || '')
      
      // Format dates for datetime-local input
      if (meeting.startTime) {
        const start = new Date(meeting.startTime)
        setStartTime(start.toISOString().slice(0, 16))
      }
      if (meeting.endTime) {
        const end = new Date(meeting.endTime)
        setEndTime(end.toISOString().slice(0, 16))
      }
      
      setStatus(meeting.status || 'scheduled')
      setTempLink(meeting.meetingLink || '')
    }
  }, [meeting, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setPlatform('google-meet')
    setMeetingId('')
    setMeetingLink('')
    setPasscode('')
    setStartTime('')
    setEndTime('')
    setStatus('scheduled')
    setTempLink('')
  }

  /* ---------- OPEN PLATFORM FOR CREATING MEETING ---------- */
  const openPlatform = () => {
    if (platform === 'google-meet') {
      window.open(
        'https://calendar.google.com/calendar/u/0/r/eventedit?vcon=meet',
        '_blank'
      )
    } else if (platform === 'zoom') {
      window.open('https://zoom.us/meeting/schedule', '_blank')
    } else if (platform === 'teams') {
      window.open('https://teams.microsoft.com', '_blank')
    } else {
      toast.info('Please create meeting manually and paste link')
    }

    setTempLink(meetingLink)
    setOpenDialog(true)
  }

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    if (!meetingLink || !startTime || !endTime) {
      toast.error('Meeting link, start time and end time are required')
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('End time must be after start time')
      return
    }

    try {
      setLoading(true)

      const payload = {
        platform,
        meetingId,
        meetingLink,
        passcode,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status,
      }

      const res = await PATCHDATA(`/v1/meeting/${meeting._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update meeting')
      }

      toast.success('Meeting updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update meeting')
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
          <Card className="w-full max-w-3xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Edit Meeting
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {meeting?.meetingId || meeting?.meetingLink?.substring(0, 30)}...
              </p>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* PLATFORM */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="required">Platform</Label>
                <Select
                  value={platform}
                  onValueChange={(v: any) => setPlatform(v)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* MEETING LINK SECTION */}
              <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                <Label htmlFor="meetingLink" className="required">Meeting Link</Label>

                <div className="flex gap-2">
                  <Input
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Paste meeting link here"
                    className="flex-1"
                  />

                  <Button type="button" onClick={openPlatform} variant="outline">
                    <LinkIcon size={16} className="mr-2" />
                    Create Link
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Click to open platform, create meeting, then paste the generated link.
                </p>
              </div>

              {/* MEETING ID */}
              <div className="space-y-2">
                <Label htmlFor="meetingId">Meeting ID (Optional)</Label>
                <Input
                  id="meetingId"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="e.g. 123-456-789"
                />
              </div>

              {/* PASSCODE */}
              <div className="space-y-2">
                <Label htmlFor="passcode">Passcode (Optional)</Label>
                <Input
                  id="passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. 123456"
                />
              </div>

              {/* TIME */}
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

              {/* STATUS */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v: any) => setStatus(v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Badge */}
              {meeting && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Badge variant="outline">Current Status</Badge>
                  {meeting.isDeleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : (
                    <Badge 
                      variant={
                        meeting.status === 'ongoing' ? 'default' : 
                        meeting.status === 'ended' ? 'secondary' : 
                        meeting.status === 'cancelled' ? 'destructive' : 'default'
                      }
                      className={meeting.status === 'ongoing' ? 'bg-green-600' : ''}
                    >
                      {meeting.status}
                    </Badge>
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
                      <Video className="mr-2 h-4 w-4" />
                      Update Meeting
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

      {/* DIALOG TO PASTE GENERATED LINK */}
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