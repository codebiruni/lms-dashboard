/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import  { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Users, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'

import PATCHDATA from '@/app/default/functions/Patch'

/* -------------------- Types -------------------- */

interface EditAttendanceProps {
  attendance: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditAttendance({
  attendance,
  open,
  onOpenChange,
  onSuccess
}: EditAttendanceProps) {
  /* ---------- STATES ---------- */
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present')
  const [joinedAt, setJoinedAt] = useState('')
  const [leftAt, setLeftAt] = useState('')
  const [loading, setLoading] = useState(false)

  /* ---------- LOAD ATTENDANCE DATA ---------- */
  useEffect(() => {
    if (attendance && open) {
      setStatus(attendance.status || 'present')
      
      // Format dates for datetime-local input
      if (attendance.joinedAt) {
        const join = new Date(attendance.joinedAt)
        setJoinedAt(join.toISOString().slice(0, 16))
      }
      if (attendance.leftAt) {
        const left = new Date(attendance.leftAt)
        setLeftAt(left.toISOString().slice(0, 16))
      }
    }
  }, [attendance, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setStatus('present')
    setJoinedAt('')
    setLeftAt('')
  }

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = async () => {
    try {
      setLoading(true)

      const payload: any = {
        status,
      }

      if (joinedAt) {
        payload.joinedAt = new Date(joinedAt).toISOString()
      }

      if (leftAt) {
        payload.leftAt = new Date(leftAt).toISOString()
      }

      const res = await PATCHDATA(`/v1/attendance/${attendance._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update attendance')
      }

      toast.success('Attendance updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update attendance')
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
          <Card className="w-full max-w-2xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Edit Attendance
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Student:</p>
                  <p className="font-medium">{attendance.studentId?.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Course:</p>
                  <p className="font-medium">{attendance.courseId?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Live Class:</p>
                  <p className="font-medium">{attendance.liveClassId?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student ID:</p>
                  <Badge variant="outline" className="font-mono">
                    {attendance.studentId?.id || attendance.studentId?._id?.slice(-6)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 py-6">
              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status" className="required">Attendance Status</Label>
                <Select
                  value={status}
                  onValueChange={(v: any) => setStatus(v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>Present</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="absent">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-destructive" />
                        <span>Absent</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="late">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-yellow-500" />
                        <span>Late</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Join Time */}
              <div className="space-y-2">
                <Label htmlFor="joinedAt">Join Time</Label>
                <Input
                  id="joinedAt"
                  type="datetime-local"
                  value={joinedAt}
                  onChange={(e) => setJoinedAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {attendance.joinedAt ? new Date(attendance.joinedAt).toLocaleString() : 'Not recorded'}
                </p>
              </div>

              {/* Left Time */}
              <div className="space-y-2">
                <Label htmlFor="leftAt">Left Time</Label>
                <Input
                  id="leftAt"
                  type="datetime-local"
                  value={leftAt}
                  onChange={(e) => setLeftAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {attendance.leftAt ? new Date(attendance.leftAt).toLocaleString() : 'Not recorded'}
                </p>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline">Current Status</Badge>
                {attendance.isDeleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <Badge 
                    variant={
                      attendance.status === 'present' ? 'default' : 
                      attendance.status === 'absent' ? 'destructive' : 'secondary'
                    }
                    className={attendance.status === 'present' ? 'bg-green-600' : attendance.status === 'late' ? 'bg-yellow-500' : ''}
                  >
                    {attendance.status}
                  </Badge>
                )}
              </div>

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
                      <Users className="mr-2 h-4 w-4" />
                      Update Attendance
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