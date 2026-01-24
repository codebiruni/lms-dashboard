"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { UploadCloud, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import PATCHDATA from "@/app/default/functions/Patch"
import GETDATA from "@/app/default/functions/GetData"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditCategory() {
  const { id } = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* -------------------- FETCH EXISTING DATA -------------------- */
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await GETDATA(`/v1/category/${id}`)

        if (!res?.success) {
          throw new Error("Failed to fetch category")
        }

        setName(res.data.name)
        setPreview(res.data.image) // existing image URL
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setFetching(false)
      }
    }

    if (id) fetchCategory()
  }, [id])

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
    if (!name) {
      toast.error("Category name is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", name)

      // image is optional in edit
      if (image) {
        formData.append("image", image)
      }

      const res = await PATCHDATA(`/v1/category/${id}`, formData)

      if (!res.success) {
        throw new Error(res?.message || "Failed to update category")
      }

      toast.success("Category updated successfully 🎉")
      router.back()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-52 w-full rounded" />
          </div>

          {/* Button */}
          <Skeleton className="h-12 w-full rounded" />
        </CardContent>
      </Card>
    </div>
  )
}


  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Edit Category
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- NAME ---------------- */}
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              placeholder="e.g. Programming"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ---------------- IMAGE UPLOAD ---------------- */}
          <div className="space-y-2">
            <Label>Category Image</Label>

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

              {preview ? (
                <Image
                  src={preview}
                  alt="Category Preview"
                  fill
                  className="rounded object-cover"
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

            {image && (
              <p className="text-xs text-muted-foreground">
                New image selected — will replace the old one
              </p>
            )}
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
                Updating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Update Category
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
