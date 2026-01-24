'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { UploadCloud, ImageIcon, Loader2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import useFetchCategory from "@/app/default/custom-component/useFeatchCategory"
import GETDATA from "@/app/default/functions/GetData"
import PATCHDATA from "@/app/default/functions/Patch"

export default function EditSubCategory() {
  /* -------------------- PARAMS -------------------- */
  const { id } = useParams()
  const router = useRouter()

  /* -------------------- STATE -------------------- */
  const [categoryId, setCategoryId] = useState("")
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)

  /* -------------------- FETCH PARENT CATEGORIES -------------------- */
  const { categories, isLoading: categoriesLoading } = useFetchCategory({
    page: 1,
    limit: 100,
    search: "",
    deleted: false,
  })

  /* -------------------- FETCH SUBCATEGORY -------------------- */
  useEffect(() => {
    const fetchSubCategory = async () => {
      try {
        setPageLoading(true)
        const res = await GETDATA(`/v1/subcategory/${id}`)

        if (!res?.success) {
          throw new Error("Failed to load subcategory")
        }

        const sub = res.data

        setCategoryId(sub.category?._id)
        setName(sub.name)
        setPreview(sub.image)
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      } finally {
        setPageLoading(false)
      }
    }

    if (id) fetchSubCategory()
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
    if (!categoryId) {
      toast.error("Please select a parent category")
      return
    }

    if (!name.trim()) {
      toast.error("Subcategory name is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("category", categoryId)
      formData.append("name", name)

      // Only send image if user changed it
      if (image) {
        formData.append("image", image)
      }

      const res = await PATCHDATA(`/v1/subcategory/${id}`, formData)

      if (!res.success) {
        throw new Error(res?.message || "Failed to update subcategory")
      }

      toast.success("Subcategory updated successfully ✅")
      router.push("/dashboard/subcategory")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- PAGE LOADING -------------------- */
  if (pageLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Edit Subcategory
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- PARENT CATEGORY -------- */}
          <div className="space-y-2">
            <Label>Parent Category</Label>

            {categoriesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
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
              </Select>
            )}
          </div>

          {/* -------- NAME -------- */}
          <div className="space-y-2">
            <Label>Subcategory Name</Label>
            <Input
              placeholder="e.g. Python"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* -------- IMAGE -------- */}
          <div className="space-y-2">
            <Label>Subcategory Image</Label>

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

              {preview ? (
                <Image
                  src={preview}
                  alt="preview"
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
          </div>

          {/* -------- SUBMIT -------- */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
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
                Update Subcategory
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
