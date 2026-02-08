/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import POSTDATA from '@/app/default/functions/Post' // your POST helper

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

export default function CreateLead() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'lost' | 'converted'>('new')
  const [submitting, setSubmitting] = useState(false)

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = await POSTDATA('/v1/lead', payload)

      toast.success('Lead created successfully 🎉')

      // Reset form
      setName('')
      setEmail('')
      setDescription('')
      setStatus('new')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create lead')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Lead</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lead Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">Name</label>
            <Input
              placeholder="Enter lead name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Lead Email */}
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <Input
              placeholder="Enter email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Lead Description */}
          <div>
            <label className="block mb-2 text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Lead Status */}
          <div>
            <label className="block mb-2 text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(v:any) => setStatus(v)}
            >
              <SelectTrigger>
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

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Lead...
              </>
            ) : (
              'Create Lead'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
