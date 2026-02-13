/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect } from 'react'
import { UploadCloud, ImageIcon, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCategory from '@/app/default/custom-component/useFeatchCategory'
import useFetchSubCategory from '@/app/default/custom-component/useFeatchSubCategory'
import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'

interface EditCourseProps {
  course: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditCourse({ course, open, onOpenChange, onSuccess }: EditCourseProps) {
  /* ------------------ Form State ------------------ */
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>()
  const [instructorId, setInstructorId] = useState<string | undefined>()

  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)

  const [price, setPrice] = useState<number>(0)
  const [discountPrice, setDiscountPrice] = useState<number>(0)
  const [isFree, setIsFree] = useState(false)

  const [enrollmentStart, setEnrollmentStart] = useState('')
  const [enrollmentEnd, setEnrollmentEnd] = useState('')
  const [durationInHours, setDurationInHours] = useState<number>()
  const [totalLessons, setTotalLessons] = useState<number>()

  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [language, setLanguage] = useState('')
  const [requirements, setRequirements] = useState<string[]>([])
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([])

  const [loading, setLoading] = useState(false)

  /* ------------------ Fetch Data ------------------ */
  const { categories } = useFetchCategory({})
  const { subcategories } = useFetchSubCategory({ category: categoryId })
  const { instructors } = useFetchInstructors({})

  /* ------------------ Load Course Data ------------------ */
  useEffect(() => {
    if (course && open) {
      // Basic Info
      setTitle(course.title || '')
      setSlug(course.slug || '')
      setDescription(course.description || '')
      
      // Category & SubCategory
      setCategoryId(course.category?._id || undefined)
      setSubCategoryId(course.subCategory?._id || undefined)
      setInstructorId(course.instructor?._id || undefined)
      
      // Thumbnail
      setExistingThumbnail(course.thumbnail || null)
      setThumbnailPreview(null)
      setThumbnail(null)
      
      // Pricing
      setPrice(course.price || 0)
      setDiscountPrice(course.discountPrice || 0)
      setIsFree(course.isFree || false)
      
      // Enrollment
      setEnrollmentStart(course.enrollmentStart ? course.enrollmentStart.split('T')[0] : '')
      setEnrollmentEnd(course.enrollmentEnd ? course.enrollmentEnd.split('T')[0] : '')
      
      // Course Details
      setDurationInHours(course.durationInHours || undefined)
      setTotalLessons(course.totalLessons || undefined)
      setLevel(course.level || 'beginner')
      setLanguage(course.language || '')
      
      // Requirements & Learning Outcomes
      setRequirements(course.requirements || [])
      setWhatYouWillLearn(course.whatYouWillLearn || [])
    }
  }, [course, open])

  /* ------------------ Handlers ------------------ */
  const handleThumbnail = (file: File) => {
    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setExistingThumbnail(null)
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
    setExistingThumbnail(course?.thumbnail || null)
  }

  const handleSubmit = async () => {
    if (!title || !slug || !description || !categoryId || !instructorId) {
      toast.error('Please fill all required fields')
      return
    }

    if (!thumbnail && !existingThumbnail) {
      toast.error('Please upload a thumbnail')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      // Basic Info
      formData.append('title', title)
      formData.append('slug', slug)
      formData.append('description', description)
      
      // Category & Instructor
      formData.append('category', categoryId)
      if (subCategoryId) formData.append('subCategory', subCategoryId)
      formData.append('instructor', instructorId)
      
      // Thumbnail - only if new one is uploaded
      if (thumbnail) {
        formData.append('thumbnail', thumbnail)
      }
      
      // Pricing
      formData.append('price', String(price))
      formData.append('discountPrice', String(discountPrice))
      formData.append('isFree', String(isFree))
      
      // Enrollment
      if (enrollmentStart) formData.append('enrollmentStart', enrollmentStart)
      if (enrollmentEnd) formData.append('enrollmentEnd', enrollmentEnd)
      
      // Course Details
      if (durationInHours) formData.append('durationInHours', String(durationInHours))
      if (totalLessons) formData.append('totalLessons', String(totalLessons))
      formData.append('level', level)
      if (language) formData.append('language', language)
      
      // Requirements & Learning Outcomes
      requirements.forEach((r) => r.trim() && formData.append('requirements', r))
      whatYouWillLearn.forEach((w) => w.trim() && formData.append('whatYouWillLearn', w))

      const res = await PATCHDATA(`/v1/course/${course._id}`, formData)
      
      if (!res.success) throw new Error(res.message || 'Failed to update course')

      toast.success('Course updated successfully 🎉')
      onSuccess()
      
      // Reset form
      setTitle(''); setSlug(''); setDescription(''); setCategoryId(undefined); setSubCategoryId(undefined)
      setInstructorId(undefined); setThumbnail(null); setThumbnailPreview(null); setExistingThumbnail(null)
      setPrice(0); setDiscountPrice(0); setIsFree(false); setEnrollmentStart(''); setEnrollmentEnd('')
      setDurationInHours(undefined); setTotalLessons(undefined); setLevel('beginner'); setLanguage('')
      setRequirements([]); setWhatYouWillLearn([])
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setThumbnail(null)
    setThumbnailPreview(null)
  }

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRequirements(value.split(',').map(item => item.trim()).filter(Boolean))
  }

  const handleLearningOutcomesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWhatYouWillLearn(value.split(',').map(item => item.trim()).filter(Boolean))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-4xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Edit Course: {course?.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="required">Course Title</Label>
                  <Input 
                    id="title"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Course title"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="required">Slug</Label>
                  <Input 
                    id="slug"
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="course-slug"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="required">Description</Label>
                <Textarea 
                  id="description"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Course description"
                  className="min-h-30"
                />
              </div>

              {/* Category / SubCategory / Instructor */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="required">Category</Label>
                  <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SubCategory</Label>
                  <Select value={subCategoryId} onValueChange={(v) => setSubCategoryId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="required">Instructor</Label>
                  <Select value={instructorId} onValueChange={(v) => setInstructorId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((i: any) => (
                        <SelectItem key={i._id} value={i._id}>
                          {i.userId?.name || i.id || i._id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label className="required">Thumbnail</Label>
                <div className="relative h-48 w-full border-2 rounded border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                     onClick={() => document.getElementById('edit-thumbnail')?.click()}>
                  <input 
                    type="file" 
                    id="edit-thumbnail" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && handleThumbnail(e.target.files[0])} 
                  />
                  {(thumbnailPreview || existingThumbnail) ? (
                    <>
                      <Image 
                        src={thumbnailPreview || existingThumbnail || ''} 
                        alt="Thumbnail" 
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
                          removeThumbnail()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="h-8 w-8" />
                      <span className="text-sm">Click to upload new thumbnail</span>
                    </div>
                  )}
                </div>
                {existingThumbnail && !thumbnailPreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current thumbnail will be kept unless you upload a new one
                  </p>
                )}
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    disabled={isFree}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price</Label>
                  <Input 
                    type="number" 
                    value={discountPrice} 
                    onChange={(e) => setDiscountPrice(Number(e.target.value))} 
                    disabled={isFree}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Is Free</Label>
                  <Select value={String(isFree)} onValueChange={(v) => setIsFree(v === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Free / Paid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Free</SelectItem>
                      <SelectItem value="false">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enrollment Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Enrollment Start</Label>
                  <Input 
                    type="date" 
                    value={enrollmentStart} 
                    onChange={(e) => setEnrollmentStart(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enrollment End</Label>
                  <Input 
                    type="date" 
                    value={enrollmentEnd} 
                    onChange={(e) => setEnrollmentEnd(e.target.value)} 
                  />
                </div>
              </div>

              {/* Duration & Lessons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (Hours)</Label>
                  <Input 
                    type="number" 
                    value={durationInHours || ''} 
                    onChange={(e) => setDurationInHours(Number(e.target.value))} 
                    min={0}
                    placeholder="e.g. 40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Lessons</Label>
                  <Input 
                    type="number" 
                    value={totalLessons || ''} 
                    onChange={(e) => setTotalLessons(Number(e.target.value))} 
                    min={0}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {/* Level & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    placeholder="e.g. English, Bengali"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label>Requirements (comma separated)</Label>
                <Input 
                  value={requirements.join(', ')} 
                  onChange={handleRequirementsChange} 
                  placeholder="Basic computer knowledge, Internet connection, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple requirements with commas
                </p>
              </div>

              {/* What You Will Learn */}
              <div className="space-y-2">
                <Label>What You Will Learn (comma separated)</Label>
                <Input 
                  value={whatYouWillLearn.join(', ')} 
                  onChange={handleLearningOutcomesChange} 
                  placeholder="JavaScript fundamentals, React hooks, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple learning outcomes with commas
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Updating Course...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Update Course
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}