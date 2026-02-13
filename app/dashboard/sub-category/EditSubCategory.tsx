/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { UploadCloud, ImageIcon, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

/* -------------------- Types -------------------- */

interface EditSubCategoryProps {
  subCategory: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditSubCategory({
  subCategory,
  open,
  onOpenChange,
  onSuccess
}: EditSubCategoryProps) {
  /* -------------------- STATE -------------------- */
  const [categoryId, setCategoryId] = useState("")
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [currentCategory, setCurrentCategory] = useState<string>("")

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  /* -------------------- FETCH PARENT CATEGORIES -------------------- */
  const { categories, isLoading: categoriesLoading } = useFetchCategory({
    page: 1,
    limit: 100,
    search: "",
    deleted: false,
  })

  /* -------------------- LOAD SUBCATEGORY DATA -------------------- */
  useEffect(() => {
    const loadSubCategory = async () => {
      if (!subCategory?._id || !open) return

      try {
        setFetching(true)
        
        // If we have full subCategory data from props, use it
        if (subCategory) {
          setCategoryId(subCategory.category?._id || "")
          setCurrentCategory(subCategory.category?.name || "")
          setName(subCategory.name || "")
          setExistingImage(subCategory.image || null)
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/subcategory/${subCategory._id}`)
          if (res?.success) {
            const data = res.data
            setCategoryId(data.category?._id || "")
            setCurrentCategory(data.category?.name || "")
            setName(data.name || "")
            setExistingImage(data.image || null)
          }
        }
      } catch (error) {
        toast.error("Failed to load subcategory data")
      } finally {
        setFetching(false)
      }
    }

    loadSubCategory()
  }, [subCategory, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCategoryId("")
    setName("")
    setImage(null)
    setPreview(null)
    setExistingImage(null)
    setCurrentCategory("")
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
    if (!categoryId) {
      toast.error("Please select a parent category")
      return
    }

    if (!name.trim()) {
      toast.error("Subcategory name is required")
      return
    }

    if (!image && !existingImage) {
      toast.error("Subcategory image is required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("category", categoryId)
      formData.append("name", name.trim())

      // Only send image if user changed it
      if (image) {
        formData.append("image", image)
      }

      const res = await PATCHDATA(`/v1/subcategory/${subCategory._id}`, formData)

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update subcategory")
      }

      toast.success("Subcategory updated successfully ✅")
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to update subcategory")
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
            <Card className="w-full max-w-xl rounded-lg shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-52 w-full" />
                </div>
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
          <Card className="w-full max-w-xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Subcategory
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {subCategory?.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* -------- PARENT CATEGORY -------- */}
              <div className="space-y-2">
                <Label htmlFor="category" className="required">
                  Parent Category
                </Label>

                {categoriesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            <div className="flex items-center gap-2">
                              <span>{cat.name}</span>
                              {cat.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentCategory && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {currentCategory}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* -------- NAME -------- */}
              <div className="space-y-2">
                <Label htmlFor="name" className="required">
                  Subcategory Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Python"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* -------- IMAGE -------- */}
              <div className="space-y-2">
                <Label className="required">Subcategory Image</Label>

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

                  {preview || existingImage ? (
                    <>
                      <Image
                        src={preview || existingImage || ""}
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

              {/* -------- CURRENT STATUS -------- */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline">Current Status</Badge>
                <Badge variant={subCategory?.isDeleted ? "destructive" : "default"}>
                  {subCategory?.isDeleted ? "Deleted" : "Active"}
                </Badge>
              </div>

              {/* -------- SUBMIT -------- */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || categoriesLoading}
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
                      Update Subcategory
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

              {/* -------- REQUIRED FIELDS NOTE -------- */}
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