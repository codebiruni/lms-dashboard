/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { UploadCloud, X, Plus, Loader2 } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import PATCHDATA from '@/app/default/functions/Patch'
import GETDATA from '@/app/default/functions/GetData'

/* -------------------- Types -------------------- */

interface EditQuestionProps {
  question: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface SingleQuestionType {
  question: string
  isTrue?: boolean
  marks: number
}

/* -------------------- Component -------------------- */

export default function EditQuestion({
  question,
  open,
  onOpenChange,
  onSuccess
}: EditQuestionProps) {
  /* -------------------- STATE -------------------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalMarks, setTotalMarks] = useState<number>(0)
  const [passMarks, setPassMarks] = useState<number>(0)
  const [type, setType] = useState<'true-false' | 'written'>('true-false')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [questions, setQuestions] = useState<SingleQuestionType[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  /* -------------------- FETCH COURSES & SECTIONS -------------------- */
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })
  const { courseSections, isLoading: sectionsLoading } = useFetchCourseSections({ 
    course: courseId, 
    limit: 100 
  })

  /* -------------------- LOAD QUESTION DATA -------------------- */
  useEffect(() => {
    const loadQuestion = async () => {
      if (!question?._id || !open) return

      try {
        setFetching(true)
        
        // If we have full question data from props, use it
        if (question) {
          setCourseId(question.courseId?._id || '')
          setSectionId(question.courseSection?._id || '')
          setTitle(question.title || '')
          setDescription(question.description || '')
          setTotalMarks(question.totalMarks || 0)
          setPassMarks(question.passMarks || 0)
          setType(question.type || 'true-false')
          setIsPublished(question.isPublished || false)
          setQuestions(question.questions || [])
          setExistingImages(question.images || [])
        } else {
          // Otherwise fetch it
          const res = await GETDATA<any>(`/v1/question/${question._id}`)
          if (res?.success) {
            const data = res.data
            setCourseId(data.courseId?._id || '')
            setSectionId(data.courseSection?._id || '')
            setTitle(data.title || '')
            setDescription(data.description || '')
            setTotalMarks(data.totalMarks || 0)
            setPassMarks(data.passMarks || 0)
            setType(data.type || 'true-false')
            setIsPublished(data.isPublished || false)
            setQuestions(data.questions || [])
            setExistingImages(data.images || [])
          }
        }
      } catch (error) {
        toast.error('Failed to load question data')
      } finally {
        setFetching(false)
      }
    }

    loadQuestion()
  }, [question, open])

  /* -------------------- RESET SECTION WHEN COURSE CHANGES -------------------- */
  useEffect(() => {
    if (!courseId) setSectionId(undefined)
  }, [courseId])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCourseId(undefined)
    setSectionId(undefined)
    setTitle('')
    setDescription('')
    setTotalMarks(0)
    setPassMarks(0)
    setType('true-false')
    setIsPublished(false)
    setQuestions([])
    setExistingImages([])
    setNewImages([])
    setPreviews([])
  }

  /* -------------------- QUESTION HANDLERS -------------------- */
  const handleQuestionChange = (index: number, field: keyof SingleQuestionType, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)

    // Recalculate total marks
    const total = updated.reduce((sum, q) => sum + (q.marks || 0), 0)
    setTotalMarks(total)
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', isTrue: true, marks: 0 }])
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index)
      setQuestions(updated)
      const total = updated.reduce((sum, q) => sum + (q.marks || 0), 0)
      setTotalMarks(total)
    } else {
      toast.error('At least one question is required')
    }
  }

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleFile = (file: File) => {
    setNewImages([...newImages, file])
    setPreviews([...previews, URL.createObjectURL(file)])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) {
      Array.from(e.dataTransfer.files).forEach(handleFile)
    }
  }

  const removeNewImage = (index: number) => {
    const updatedImages = [...newImages]
    const updatedPreviews = [...previews]
    updatedImages.splice(index, 1)
    updatedPreviews.splice(index, 1)
    setNewImages(updatedImages)
    setPreviews(updatedPreviews)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!courseId) {
      toast.error('Please select a course')
      return
    }

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (totalMarks <= 0) {
      toast.error('Total marks must be greater than 0')
      return
    }

    if (passMarks < 0) {
      toast.error('Pass marks cannot be negative')
      return
    }

    if (passMarks > totalMarks) {
      toast.error('Pass marks cannot be greater than total marks')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text is required`)
        return
      }
      if (q.marks <= 0) {
        toast.error(`Question ${i + 1} marks must be greater than 0`)
        return
      }
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      // Basic fields
      formData.append('courseId', courseId)
      if (sectionId) formData.append('courseSection', sectionId)
      formData.append('title', title)
      formData.append('description', description || '')
      formData.append('totalMarks', totalMarks.toString())
      formData.append('passMarks', passMarks.toString())
      formData.append('type', type)
      formData.append('isPublished', isPublished.toString())

      // Questions as JSON
      formData.append('questions', JSON.stringify(questions))

      // Add existing images (as JSON array)
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages))
      }

      // Add new images
      newImages.forEach(img => {
        formData.append('images', img)
      })

      const res = await PATCHDATA(`/v1/question/${question._id}`, formData)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update question')
      }

      toast.success('Question updated successfully ✅')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update question')
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
            <Card className="w-full max-w-5xl rounded shadow-lg border">
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
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
          <Card className="w-full max-w-5xl rounded shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Edit Question
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {question?.title}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 py-6 max-h-[80vh] overflow-y-auto">
              {/* COURSE & SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course" className="required">Course</Label>
                  <Select 
                    value={courseId} 
                    onValueChange={setCourseId}
                    disabled={coursesLoading}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>
                          <div className="flex items-center gap-2">
                            <span>{c.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ({c._id.slice(-6)})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {question?.courseId && (
                    <p className="text-xs text-muted-foreground">
                      Current: {question.courseId.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select 
                    value={sectionId} 
                    onValueChange={setSectionId}
                    disabled={!courseId || sectionsLoading}
                  >
                    <SelectTrigger id="section">
                      <SelectValue placeholder="Select section (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {courseSections.map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {question?.courseSection && (
                    <p className="text-xs text-muted-foreground">
                      Current: {question.courseSection.title}
                    </p>
                  )}
                </div>
              </div>

              {/* TITLE & DESCRIPTION */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Question title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Question description"
                  rows={3}
                />
              </div>

              {/* TOTAL & PASS MARKS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="required">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passMarks" className="required">Pass Marks</Label>
                  <Input
                    id="passMarks"
                    type="number"
                    value={passMarks}
                    onChange={e => setPassMarks(Number(e.target.value))}
                    min={0}
                  />
                  {passMarks > totalMarks && (
                    <p className="text-xs text-destructive">
                      Pass marks cannot exceed total marks
                    </p>
                  )}
                </div>
              </div>

              {/* TYPE & PUBLISH */}
              <div className="flex items-center gap-6">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select value={type} onValueChange={val => setType(val as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true-false">True / False</SelectItem>
                      <SelectItem value="written">Written</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Switch 
                    id="publish"
                    checked={isPublished} 
                    onCheckedChange={setIsPublished} 
                  />
                  <Label htmlFor="publish">Published</Label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Badge variant="outline">Current Status</Badge>
                  <Badge variant={question?.isDeleted ? 'destructive' : 'default'}>
                    {question?.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>
              </div>

              {/* QUESTIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Questions</h3>
                  <Badge variant="outline">{questions.length} total</Badge>
                </div>

                {questions.map((q, i) => (
                  <Card key={i} className="p-4 space-y-3 border relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive"
                      onClick={() => handleRemoveQuestion(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <Label>Question {i + 1}</Label>
                      <Input
                        placeholder="Question text"
                        value={q.question}
                        onChange={e => handleQuestionChange(i, 'question', e.target.value)}
                      />
                    </div>

                    {type === 'true-false' && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Select 
                          value={q.isTrue?.toString()} 
                          onValueChange={val => handleQuestionChange(i, 'isTrue', val === 'true')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Marks</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Marks"
                        value={q.marks}
                        onChange={e => handleQuestionChange(i, 'marks', Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                  </Card>
                ))}

                <Button 
                  onClick={handleAddQuestion} 
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {/* EXISTING IMAGES */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Existing Images</Label>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-20 h-20 rounded border overflow-hidden">
                          <Image
                            src={img}
                            alt={`Existing ${idx}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW IMAGES UPLOAD */}
              <div className="space-y-2">
                <Label>Add New Images</Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative flex min-h-30 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30 p-4 transition hover:border-primary"
                >
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => e.target.files && Array.from(e.target.files).forEach(handleFile)}
                  />

                  {previews.length > 0 ? (
                    <div className="flex gap-2 flex-wrap w-full">
                      {previews.map((p, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative w-20 h-20 rounded border overflow-hidden">
                            <Image
                              src={p}
                              width={80}
                              height={80}
                              alt="preview"
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop images here or click to upload
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || passMarks > totalMarks}
                  size="lg"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Question'
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

              {/* REQUIRED FIELDS NOTE */}
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