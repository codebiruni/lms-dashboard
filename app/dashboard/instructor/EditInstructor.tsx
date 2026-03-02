/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { UploadCloud, ImageIcon, Loader2, X, Mail, Phone, User, Briefcase, DollarSign, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'

/* -------------------- Types -------------------- */

interface EditInstructorProps {
  instructor: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditInstructor({
  instructor,
  open,
  onOpenChange,
  onSuccess
}: EditInstructorProps) {
  /* -------------------- STATE -------------------- */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState("")
  const [selery, setSelery] = useState<number | "">("")

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* -------------------- LOAD INSTRUCTOR DATA -------------------- */
  useEffect(() => {
    const loadInstructor = async () => {
      if (!instructor?._id || !open) return

      try {
        setFetching(true)

        // If we have full instructor data from props, use it
        if (instructor) {
          setName(instructor.userId?.name || "")
          setEmail(instructor.userId?.email || "")
          setPhone(instructor.userId?.phone || "")
          setBio(instructor.bio || "")
          setExpertise(instructor.expertise || "")
          setSelery(instructor.selery || "")
          setExistingImage(instructor.userId?.image || null)
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/instructor/${instructor._id}`)
          if (res?.success) {
            const data = res.data
            setName(data.userId?.name || "")
            setEmail(data.userId?.email || "")
            setPhone(data.userId?.phone || "")
            setBio(data.bio || "")
            setExpertise(data.expertise || "")
            setSelery(data.selery || "")
            setExistingImage(data.userId?.image || null)
          }
        }
      } catch (error) {
        toast.error('Failed to load instructor data')
      } finally {
        setFetching(false)
      }
    }

    loadInstructor()
  }, [instructor, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setBio("")
    setExpertise("")
    setSelery("")
    setImage(null)
    setPreview(null)
    setExistingImage(null)
  }

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleFile = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setExistingImage(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    setExistingImage(null)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!name) {
      toast.error("Name is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      if (phone) formData.append("phone", phone)
      if (bio) formData.append("bio", bio)
      if (expertise) formData.append("expertise", expertise)
      if (selery !== "") formData.append("selery", String(selery))
      if (image) formData.append("image", image)

      const res = await PATCHDATA(`/v1/instructor/${instructor._id}`, formData)

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update instructor")
      }

      toast.success("Instructor updated successfully 🎉")
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to update instructor")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!open) return null

  /* -------------------- LOADING STATE -------------------- */
  if (fetching) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded  lg shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-2xl rounded  lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Instructor
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {instructor?.userId?.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 py-6 max-h-[70vh] overflow-y-auto">
              {/* Instructor ID Display */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded  lg">
                <Badge variant="outline">Instructor ID</Badge>
                <Badge variant="secondary" className="font-mono">
                  {instructor?.id}
                </Badge>
              </div>

              {/* -------- BASIC INFO -------- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="required">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-10"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="required">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-10"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      placeholder="+8801XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="expertise"
                      className="pl-10"
                      placeholder="Web Development, Data Science"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* -------- INSTRUCTOR INFO -------- */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    className="pl-10"
                    placeholder="Short instructor bio..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="selery">Salary</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="selery"
                    className="pl-10"
                    type="number"
                    placeholder="50000"
                    value={selery}
                    onChange={(e) =>
                      setSelery(e.target.value ? Number(e.target.value) : "")
                    }
                  />
                </div>
              </div>

              {/* -------- IMAGE -------- */}
              <div className="space-y-2">
                <Label>Profile Image</Label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative flex h-52 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      e.target.files && handleFile(e.target.files[0])
                    }
                  />

                  {(preview || existingImage) ? (
                    <>
                      <Image
                        src={preview || existingImage || ''}
                        alt="preview"
                        fill
                        className="rounded object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop image here or click to upload
                      </p>
                    </>
                  )}
                </div>

                {existingImage && !preview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current image will be kept unless you upload a new one
                  </p>
                )}
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded  lg">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={instructor?.isDeleted ? 'destructive' : 'default'}>
                  {instructor?.isDeleted ? 'Deleted' : 'Active'}
                </Badge>
                {instructor?.approvalStatus && (
                  <Badge
                    variant={
                      instructor.approvalStatus === 'approved' ? 'default' :
                      instructor.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className={instructor.approvalStatus === 'approved' ? 'bg-green-600' : ''}
                  >
                    {instructor.approvalStatus}
                  </Badge>
                )}
              </div>

              {/* -------- SUBMIT -------- */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Update Instructor
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