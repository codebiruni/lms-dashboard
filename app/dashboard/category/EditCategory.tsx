/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from "react"
import { UploadCloud, ImageIcon, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

import PATCHDATA from "@/app/default/functions/Patch"

/* -------------------- Types -------------------- */

interface EditCategoryProps {
  category: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditCategory({
  category,
  open,
  onOpenChange,
  onSuccess
}: EditCategoryProps) {
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /* ---------- LOAD CATEGORY DATA ---------- */
  useEffect(() => {
    if (category && open) {
      setName(category.name || "")
      setExistingImage(category.image || null)
      setPreview(null)
      setImage(null)
    }
  }, [category, open])

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    setName("")
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
    setExistingImage(category?.image || null)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!name) {
      toast.error("Category name is required")
      return
    }

    if (!image && !existingImage) {
      toast.error("Category image is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", name)
      
      if (image) {
        formData.append("image", image)
      }

      const res = await PATCHDATA(`/v1/category/${category._id}`, formData)

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update category")
      }

      toast.success("Category updated successfully 🎉")
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message)
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
          <Card className="w-full max-w-xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Category
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {category?.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6">
              {/* ---------------- NAME ---------------- */}
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Programming"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* ---------------- IMAGE UPLOAD ---------------- */}
              <div className="space-y-2">
                <Label className="required">Category Image</Label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative flex h-52 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition hover:border-primary"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.jfif,.png,.webp,.gif"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      e.target.files && handleFile(e.target.files[0])
                    }
                  />

                  {(preview || existingImage) ? (
                    <>
                      <Image
                        src={preview || existingImage || ""}
                        alt="preview"
                        fill
                        className="object-cover rounded"
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
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={category.isDeleted ? 'destructive' : 'default'}>
                  {category.isDeleted ? 'Deleted' : 'Active'}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Update Category
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