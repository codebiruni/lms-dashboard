/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

import POSTDATA from '@/app/default/functions/Post'

export default function CreateMeeting() {
  const router = useRouter()

  /* ---------- STATES ---------- */
  const [platform, setPlatform] =
    useState<'google-meet' | 'zoom' | 'teams' | 'other'>('google-meet')

  const [meetingId, setMeetingId] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [passcode, setPasscode] = useState('')

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [status, setStatus] =
    useState<'scheduled' | 'ongoing' | 'ended' | 'cancelled'>('scheduled')

  const [loading, setLoading] = useState(false)

  /* ---------- DIALOG STATE ---------- */
  const [openDialog, setOpenDialog] = useState(false)
  const [tempLink, setTempLink] = useState('')

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

    const payload = {
      platform,
      meetingId,
      meetingLink,
      passcode,
      startTime,
      endTime,
      status,
    }

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/meeting', payload)
console.log(res)
      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success('Meeting created successfully')

      router.push('/dashboard/meeting')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Meeting</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* PLATFORM */}
          <div>
            <Label>Platform *</Label>

            <Select
              value={platform}
              onValueChange={(v: any) => setPlatform(v)}
            >
              <SelectTrigger>
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
          <div className="border p-4 rounded bg-slate-50 space-y-3">
            <Label>Meeting Link *</Label>

            <div className="flex gap-2">
              <Input
                value={meetingLink}
                readOnly
                placeholder="No meeting link added"
              />

              <Button type="button" onClick={openPlatform}>
                Create Meeting
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Click to open platform, create meeting, then paste the generated
              link.
            </p>
          </div>

          {/* MEETING ID */}
          <div>
            <Label>Meeting ID (Optional)</Label>
            <Input
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="e.g. 123-456-789"
            />
          </div>

          {/* PASSCODE */}
          <div>
            <Label>Passcode (Optional)</Label>
            <Input
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          {/* TIME */}
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

          {/* STATUS */}
          <div>
            <Label>Status</Label>

            <Select
              value={status}
              onValueChange={(v: any) => setStatus(v)}
            >
              <SelectTrigger>
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

          {/* SUBMIT */}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </CardContent>
      </Card>

      {/* DIALOG TO PASTE GENERATED LINK */}
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
