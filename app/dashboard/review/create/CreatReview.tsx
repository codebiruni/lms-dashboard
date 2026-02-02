'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { UploadCloud, ImageIcon, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import POSTDATA from '@/app/default/functions/Post'

export default function CreateReview() {
  const [name, setName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(5)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleFile = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!name || !courseName || !description || !rating || !image) {
      toast.error('All required fields must be filled')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('courseName', courseName)
      formData.append('description', description)
      formData.append('rating', String(rating))
      formData.append('image', image)

      if (comment) {
        formData.append('comment', comment)
      }

      const res = await POSTDATA('/v1/review', formData)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create review')
      }

      toast.success('Review created successfully ⭐')

      // Reset form
      setName('')
      setCourseName('')
      setDescription('')
      setComment('')
      setRating(5)
      setImage(null)
      setPreview(null)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create New Review
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- NAME ---------------- */}
          <div className="space-y-2">
            <Label>Reviewer Name</Label>
            <Input
              placeholder="e.g. Robius Sani"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ---------------- COURSE NAME ---------------- */}
          <div className="space-y-2">
            <Label>Course Name</Label>
            <Input
              placeholder="e.g. Full Stack Web Development"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          {/* ---------------- DESCRIPTION ---------------- */}
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Input
              placeholder="e.g. Amazing learning experience"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ---------------- COMMENT ---------------- */}
          <div className="space-y-2">
            <Label>Detailed Comment (Optional)</Label>
            <Textarea
              rows={4}
              placeholder="Write your detailed feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* ---------------- RATING ---------------- */}
          <div className="space-y-2">
            <Label>Rating</Label>
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
                    className="h-6 w-6"
                    fill={star <= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- IMAGE UPLOAD ---------------- */}
          <div className="space-y-2">
            <Label>Reviewer Image</Label>

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

              {preview ? (
                <Image
                  src={preview}
                  alt="preview"
                  width={200}
                  height={200}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <>
                  <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop image here or click to upload
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ---------------- SUBMIT ---------------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Review...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Create Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
