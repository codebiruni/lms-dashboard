/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Loader2,
  UploadCloud,
  User,
  X,
  Mail,
  Phone,
  Key,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'
import Image from 'next/image'

/* -------------------- Types -------------------- */

interface EditUserProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const roles = ['admin', 'instructor', 'student', 'staff']
const statuses = ['active', 'inactive', 'blocked']

/* -------------------- Component -------------------- */

export default function EditUser({
  user,
  open,
  onOpenChange,
  onSuccess
}: EditUserProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* -------------------- LOAD USER DATA -------------------- */
  useEffect(() => {
    const loadUser = async () => {
      if (!user?._id || !open) return

      try {
        setFetching(true)

        // If we have full user data from props, use it
        if (user) {
          setName(user.name || "")
          setEmail(user.email || "")
          setPhone(user.phone || "")
          setRole(user.role || "")
          setStatus(user.status || "")
          setIsVerified(user.isVerified || false)
          setExistingImage(user.image || null)
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/user/${user._id}`)
          if (res?.success) {
            const data = res.data
            setName(data.name || "")
            setEmail(data.email || "")
            setPhone(data.phone || "")
            setRole(data.role || "")
            setStatus(data.status || "")
            setIsVerified(data.isVerified || false)
            setExistingImage(data.image || null)
          }
        }
      } catch (error) {
        toast.error('Failed to load user data')
      } finally {
        setFetching(false)
      }
    }

    loadUser()
  }, [user, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setRole("")
    setStatus("")
    setIsVerified(false)
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

  /* -------------------- SUBMIT HANDLER -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Name is required")
      return
    }

    try {
      setLoading(true)

      const payload = new FormData()
      payload.append("name", name)

      if (email) payload.append("email", email)
      if (phone) payload.append("phone", phone)
      if (password) payload.append("password", password)
      if (role) payload.append("role", role)
      if (status) payload.append("status", status)
      payload.append("isVerified", String(isVerified))
      if (image) payload.append("image", image)

      const res = await PATCHDATA(`/v1/user/${user._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update user")
      }

      toast.success("User updated successfully 🎉")
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to update user")
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
            <Card className="w-full max-w-xl rounded  lg shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-20" />
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
          <Card className="w-full max-w-xl rounded  lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Edit User
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {user?.name}
              </p>
            </CardHeader>

            <CardContent className="py-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User ID Display */}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded  lg">
                  <Badge variant="outline">User ID</Badge>
                  <Badge variant="secondary" className="font-mono">
                    {user?.id}
                  </Badge>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="required">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-10"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-10"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
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

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      className="pl-10"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <Label htmlFor="role">Role</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role" className="pl-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified */}
                <div className="flex items-center justify-between rounded  lg border p-3">
                  <div>
                    <p className="font-medium">Verified</p>
                    <p className="text-xs text-muted-foreground">Mark user as verified</p>
                  </div>
                  <Switch
                    checked={isVerified}
                    onCheckedChange={setIsVerified}
                  />
                </div>

                {/* -------- IMAGE -------- */}
                <div className="space-y-2">
                  <Label>Profile Image (optional)</Label>

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
                  <Badge variant={user?.isDeleted ? 'destructive' : 'default'}>
                    {user?.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update User"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Required Fields Note */}
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">*</span> Required fields
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}