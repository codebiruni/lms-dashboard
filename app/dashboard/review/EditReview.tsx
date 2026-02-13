/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { UploadCloud, ImageIcon, Loader2, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'

/* -------------------- Types -------------------- */

interface EditReviewProps {
  review: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditReview({
  review,
  open,
  onOpenChange,
  onSuccess
}: EditReviewProps) {
  /* -------------------- STATE -------------------- */
  const [name, setName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(5)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* -------------------- LOAD REVIEW DATA -------------------- */
  useEffect(() => {
    const loadReview = async () => {
      if (!review?._id || !open) return

      try {
        setFetching(true)

        // If we have full review data from props, use it
        if (review) {
          setName(review.name || '')
          setCourseName(review.courseName || '')
          setDescription(review.description || '')
          setComment(review.comment || '')
          setRating(review.rating || 5)
          setExistingImage(review.image || null)
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/review/${review._id}`)
          if (res?.success) {
            const data = res.data
            setName(data.name || '')
            setCourseName(data.courseName || '')
            setDescription(data.description || '')
            setComment(data.comment || '')
            setRating(data.rating || 5)
            setExistingImage(data.image || null)
          }
        }
      } catch (error) {
        toast.error('Failed to load review data')
      } finally {
        setFetching(false)
      }
    }

    loadReview()
  }, [review, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setName('')
    setCourseName('')
    setDescription('')
    setComment('')
    setRating(5)
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
    if (!name || !courseName || !description || !rating) {
      toast.error('All required fields must be filled')
      return
    }

    if (!image && !existingImage) {
      toast.error('Reviewer image is required')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('courseName', courseName)
      formData.append('description', description)
      formData.append('rating', String(rating))
      
      if (comment) {
        formData.append('comment', comment)
      }

      // Only send image if user changed it
      if (image) {
        formData.append('image', image)
      }

      const res = await PATCHDATA(`/v1/review/${review._id}`, formData)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update review')
      }

      toast.success('Review updated successfully ⭐')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update review')
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
            <Card className="w-full max-w-xl rounded shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
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
          <Card className="w-full max-w-xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Review
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating review by: {review?.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* ---------------- NAME ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Reviewer Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Robius Sani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* ---------------- COURSE NAME ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="courseName" className="required">Course Name</Label>
                <Input
                  id="courseName"
                  placeholder="e.g. Full Stack Web Development"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              {/* ---------------- DESCRIPTION ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="description" className="required">Short Description</Label>
                <Input
                  id="description"
                  placeholder="e.g. Amazing learning experience"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* ---------------- COMMENT ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="comment">Detailed Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  rows={4}
                  placeholder="Write your detailed feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* ---------------- RATING ---------------- */}
              <div className="space-y-2">
                <Label className="required">Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition ${
                        star <= rating ? 'text-yellow-400' : 'text-muted-foreground'
                      }`}
                    >
                      <Star
                        className="h-8 w-8"
                        fill={star <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------------- IMAGE UPLOAD ---------------- */}
              <div className="space-y-2">
                <Label className="required">Reviewer Image</Label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative flex h-52 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
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

              {/* ---------------- CURRENT STATUS ---------------- */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={review?.isDeleted ? 'destructive' : 'default'}>
                  {review?.isDeleted ? 'Deleted' : 'Active'}
                </Badge>
              </div>

              {/* ---------------- SUBMIT ---------------- */}
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
                      Updating Review...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Update Review
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

              {/* ---------------- REQUIRED FIELDS NOTE ---------------- */}
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