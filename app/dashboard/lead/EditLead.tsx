/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, X, Mail, User, FileText } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Input,
} from '@/components/ui/input'
import {
  Textarea,
} from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'

/* -------------------- Types -------------------- */

interface EditLeadProps {
  lead: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditLead({
  lead,
  open,
  onOpenChange,
  onSuccess
}: EditLeadProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'lost' | 'converted'>('new')
  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* Load Lead Data */
  useEffect(() => {
    const loadLead = async () => {
      if (!lead?._id || !open) return

      try {
        setFetching(true)

        // If we have full lead data from props, use it
        if (lead) {
          setName(lead.name || '')
          setEmail(lead.email || '')
          setDescription(lead.description || '')
          setStatus(lead.status || 'new')
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/lead/${lead._id}`)
          if (res?.success) {
            const data = res.data
            setName(data.name || '')
            setEmail(data.email || '')
            setDescription(data.description || '')
            setStatus(data.status || 'new')
          }
        }
      } catch (error) {
        toast.error('Failed to load lead data')
      } finally {
        setFetching(false)
      }
    }

    loadLead()
  }, [lead, open])

  /* Reset Form */
  const resetForm = () => {
    setName('')
    setEmail('')
    setDescription('')
    setStatus('new')
  }

  /* Submit Handler */
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter lead name')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        description: description.trim() || undefined,
        status,
      }

      const res = await PATCHDATA(`/v1/lead/${lead._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update lead')
      }

      toast.success('Lead updated successfully 🎉')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lead')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!open) return null

  /* Loading State */
  if (fetching) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  /* UI */
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-2xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Lead
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {lead?.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 py-6">
              {/* Lead Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-10"
                    placeholder="Enter lead name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Lead Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    className="pl-10"
                    placeholder="Enter email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Lead Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    className="pl-10"
                    placeholder="Enter description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Lead Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v: any) => setStatus(v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={lead?.isDeleted ? 'destructive' : 'default'}>
                  {lead?.isDeleted ? 'Deleted' : 'Active'}
                </Badge>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Lead...
                    </>
                  ) : (
                    'Update Lead'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
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