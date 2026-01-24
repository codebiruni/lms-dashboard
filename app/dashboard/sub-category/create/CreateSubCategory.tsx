'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { UploadCloud, ImageIcon, Loader2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import POSTDATA from "@/app/default/functions/Post"
import useFetchCategory from "@/app/default/custom-component/useFeatchCategory"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateSubCategory() {
  const [categoryId, setCategoryId] = useState<string>("")
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch categories for parent selection
  const { categories, isLoading: categoriesLoading } = useFetchCategory({
    page: 1,
    limit: 100,
    search: "",
    deleted: false
  })

  // IMAGE HANDLERS
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

  // SUBMIT FORM
  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error("Please select a parent category")
      return
    }
    if (!name) {
      toast.error("Subcategory name is required")
      return
    }
    if (!image) {
      toast.error("Subcategory image is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("category", categoryId)
      formData.append("name", name)
      formData.append("image", image)

      const res = await POSTDATA("/v1/subcategory", formData)

      if (!res.success) {
        throw new Error(res?.message || "Failed to create subcategory")
      }

      toast.success("Subcategory created successfully 🎉")
      setCategoryId("")
      setName("")
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
            Create New Subcategory
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ---------------- PARENT CATEGORY ---------------- */}
          <div className="space-y-2">
            <Label>Parent Category</Label>
            {categoriesLoading ? <Skeleton className="h-10 w-full" /> : <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
          </div>

          {/* ---------------- SUBCATEGORY NAME ---------------- */}
          <div className="space-y-2">
            <Label>Subcategory Name</Label>
            <Input
              placeholder="e.g. ReactJS"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ---------------- IMAGE UPLOAD ---------------- */}
          <div className="space-y-2">
            <Label>Subcategory Image</Label>
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
                  alt="preview"
                  width={400}
                  height={250}
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
                Creating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Create Subcategory
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
