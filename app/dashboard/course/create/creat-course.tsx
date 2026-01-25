/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect } from 'react'
import { UploadCloud, Video, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import POSTDATA from '@/app/default/functions/Post'
import useFetchCategory from '@/app/default/custom-component/useFeatchCategory'
import useFetchSubCategory from '@/app/default/custom-component/useFeatchSubCategory'
import useFetchInstructors from '@/app/default/custom-component/useFearchInstructor'

export default function CreateCourse() {
  /* ------------------ Form State ------------------ */
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>()
  const [instructorId, setInstructorId] = useState<string | undefined>()

  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<File | null>(null)

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

  /* ------------------ Handlers ------------------ */
  const handleThumbnail = (file: File) => {
    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // const handleVideo = (file: File) => {
  //   setPreviewVideo(file)
  // }

  const handleSubmit = async () => {
    if (!title || !slug || !description || !categoryId || !instructorId || !thumbnail || !enrollmentStart) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('slug', slug)
      formData.append('description', description)
      formData.append('category', categoryId)
      if (subCategoryId) formData.append('subCategory', subCategoryId)
      formData.append('instructor', instructorId)
      formData.append('thumbnail', thumbnail)
      if (previewVideo) formData.append('previewVideo', previewVideo)
      formData.append('price', String(price))
      formData.append('discountPrice', String(discountPrice))
      formData.append('isFree', String(isFree))
      formData.append('enrollmentStart', enrollmentStart)
      if (enrollmentEnd) formData.append('enrollmentEnd', enrollmentEnd)
      if (durationInHours) formData.append('durationInHours', String(durationInHours))
      if (totalLessons) formData.append('totalLessons', String(totalLessons))
      formData.append('level', level)
      if (language) formData.append('language', language)
      requirements.forEach((r) => formData.append('requirements', r))
      whatYouWillLearn.forEach((w) => formData.append('whatYouWillLearn', w))

      const res = await POSTDATA('/v1/course', formData)
      if (!res.success) throw new Error(res.message || 'Failed to create course')

      toast.success('Course created successfully 🎉')
      // Reset form
      setTitle(''); setSlug(''); setDescription(''); setCategoryId(undefined); setSubCategoryId(undefined)
      setInstructorId(undefined); setThumbnail(null); setThumbnailPreview(null); setPreviewVideo(null)
      setPrice(0); setDiscountPrice(0); setIsFree(false); setEnrollmentStart(''); setEnrollmentEnd('')
      setDurationInHours(undefined); setTotalLessons(undefined); setLevel('beginner'); setLanguage('')
      setRequirements([]); setWhatYouWillLearn([])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="rounded shadow-lg">
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="course-slug" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description" />
          </div>

          {/* Category / SubCategory / Instructor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c:any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SubCategory</Label>
              <Select onValueChange={(v) => setSubCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                <SelectContent>
                  {subcategories.map((s:any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Instructor</Label>
              <Select onValueChange={(v) => setInstructorId(v)}>
                <SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger>
                <SelectContent>
                  {instructors.map((i:any) => <SelectItem key={i._id} value={i._id}>{i.userId.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Thumbnail & Video */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Thumbnail</Label>
              <div className="relative h-40 w-full border rounded border-dashed flex items-center justify-center cursor-pointer" 
                   onClick={() => document.getElementById('thumbnail')?.click()}>
                <input type="file" id="thumbnail" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleThumbnail(e.target.files[0])} />
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover rounded" />
                ) : (
                  <UploadCloud className="text-muted-foreground h-8 w-8" />
                )}
              </div>
            </div>
            {/* <div>
              <Label>Preview Video</Label>
              <div className="relative h-40 w-full border rounded border-dashed flex items-center justify-center cursor-pointer" 
                   onClick={() => document.getElementById('previewVideo')?.click()}>
                <input type="file" id="previewVideo" className="hidden" accept="video/*" onChange={(e) => e.target.files && handleVideo(e.target.files[0])} />
                {previewVideo ? (
  <video
    src={URL.createObjectURL(previewVideo)}
    className="h-full w-full object-cover rounded"
    controls
  />
) : (
  <UploadCloud className="text-muted-foreground h-8 w-8" />
)}

              </div>
            </div> */}
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Price</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} disabled={isFree} />
            </div>
            <div>
              <Label>Discount Price</Label>
              <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(Number(e.target.value))} disabled={isFree} />
            </div>
            <div>
              <Label>Is Free</Label>
              <Select onValueChange={(v) => setIsFree(v === 'true')}>
                <SelectTrigger><SelectValue placeholder="Free / Paid" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Free</SelectItem>
                  <SelectItem value="false">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enrollment Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Enrollment Start</Label>
              <Input type="date" value={enrollmentStart} onChange={(e) => setEnrollmentStart(e.target.value)} />
            </div>
            <div>
              <Label>Enrollment End</Label>
              <Input type="date" value={enrollmentEnd} onChange={(e) => setEnrollmentEnd(e.target.value)} />
            </div>
          </div>

          {/* Duration & Lessons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (Hours)</Label>
              <Input type="number" value={durationInHours || ''} onChange={(e) => setDurationInHours(Number(e.target.value))} />
            </div>
            <div>
              <Label>Total Lessons</Label>
              <Input type="number" value={totalLessons || ''} onChange={(e) => setTotalLessons(Number(e.target.value))} />
            </div>
          </div>

          {/* Level & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Level</Label>
              <Select onValueChange={(v: any) => setLevel(v)}>
                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English" />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <Label>Requirements (comma separated)</Label>
            <Input value={requirements.join(',')} onChange={(e) => setRequirements(e.target.value.split(','))} placeholder="Requirement1,Requirement2" />
          </div>

          {/* What You Will Learn */}
          <div>
            <Label>What You Will Learn (comma separated)</Label>
            <Input value={whatYouWillLearn.join(',')} onChange={(e) => setWhatYouWillLearn(e.target.value.split(','))} placeholder="Topic1,Topic2" />
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Create Course
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
