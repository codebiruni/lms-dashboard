/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'
import POSTDATA from '@/app/default/functions/Post'
import Image from 'next/image'
import { UploadCloud } from 'lucide-react'

interface SingleQuestionType {
  question: string
  isTrue?: boolean
  marks: number
}

export default function CreateQuestion() {
  const router = useRouter()

  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalMarks, setTotalMarks] = useState<number>(0)
  const [passMarks, setPassMarks] = useState<number>(0)
  const [type, setType] = useState<'true-false' | 'written'>('true-false')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  const [questions, setQuestions] = useState<SingleQuestionType[]>([
    { question: '', isTrue: true, marks: 0 },
  ])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const { courses } = useFetchCourses({ limit: 100 })
  const { courseSections } = useFetchCourseSections({ course: courseId, limit: 100 })

  useEffect(() => setSectionId(undefined), [courseId])

  const handleQuestionChange = (index: number, field: keyof SingleQuestionType, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleAddQuestion = () => setQuestions([...questions, { question: '', isTrue: true, marks: 0 }])
  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = [...questions]
      updated.splice(index, 1)
      setQuestions(updated)
    } else toast.error('At least one question is required')
  }

  const handleFile = (file: File) => {
    setImages([...images, file])
    setPreviews([...previews, URL.createObjectURL(file)])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) Array.from(e.dataTransfer.files).forEach(handleFile)
  }

  const removeImage = (index: number) => {
    const updatedImages = [...images]
    const updatedPreviews = [...previews]
    updatedImages.splice(index, 1)
    updatedPreviews.splice(index, 1)
    setImages(updatedImages)
    setPreviews(updatedPreviews)
  }

  const handleSubmit = async () => {
    if (!courseId || !title || totalMarks <= 0 || passMarks < 0) {
      toast.error('Please fill all required fields')
      return
    }

    if (passMarks > totalMarks) {
      toast.error('Pass marks cannot be greater than total marks')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question || q.marks <= 0) {
        toast.error(`Complete all fields for question ${i + 1}`)
        return
      }
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('courseId', courseId)
      if (sectionId) formData.append('courseSection', sectionId)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('totalMarks', totalMarks.toString())
      formData.append('passMarks', passMarks.toString())
      formData.append('type', type)
      formData.append('isPublished', isPublished.toString())

      questions.forEach((q, i) => {
        formData.append(`questions[${i}][question]`, q.question)
        formData.append(`questions[${i}][marks]`, q.marks.toString())
        if (q.isTrue !== undefined) formData.append(`questions[${i}][isTrue]`, q.isTrue.toString())
      })

      images.forEach(img => formData.append('images', img))

      const res = await POSTDATA('/v1/question', formData)

      if (!res.success) throw new Error(res.message || 'Failed to create question')

      toast.success('Question created successfully 🎉')
      router.push('/dashboard/question')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader><CardTitle>Create Question</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* COURSE & SECTION */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Course *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Section</Label>
            <Select value={sectionId} onValueChange={setSectionId} disabled={!courseId}>
              <SelectTrigger><SelectValue placeholder="Select section (optional)" /></SelectTrigger>
              <SelectContent>
                {courseSections.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {/* TOTAL & PASS MARKS */}
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Total Marks *</Label><Input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} /></div>
          <div><Label>Pass Marks *</Label><Input type="number" value={passMarks} onChange={e => setPassMarks(Number(e.target.value))} /></div>
        </div>

        {/* TYPE & PUBLISH */}
        <div className="flex items-center gap-4">
          <Label>Type</Label>
          <Select value={type} onValueChange={val => setType(val as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true-false">True / False</SelectItem>
              <SelectItem value="written">Written</SelectItem>
            </SelectContent>
          </Select>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} /><Label>Publish</Label>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-4">
          <h3 className="font-semibold">Questions</h3>
          {questions.map((q, i) => (
            <Card key={i} className="p-4 space-y-2 border">
              <div className="flex justify-between items-center">
                <Label>Question {i + 1}</Label>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveQuestion(i)}>Remove</Button>
              </div>
              <Input placeholder="Question text" value={q.question} onChange={e => handleQuestionChange(i, 'question', e.target.value)} />
              {type === 'true-false' && (
                <div className="flex items-center gap-2">
                  <Label>Answer:</Label>
                  <Select value={q.isTrue?.toString()} onValueChange={val => handleQuestionChange(i, 'isTrue', val === 'true')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Input type="number" min={0} placeholder="Marks" value={q.marks} onChange={e => handleQuestionChange(i, 'marks', Number(e.target.value))} />
            </Card>
          ))}
          <Button onClick={handleAddQuestion}>Add Question</Button>
        </div>

        {/* IMAGES */}
        <div className="space-y-2">
          <Label>Quiz Images</Label>
          <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} className="relative flex h-32 cursor-pointer items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 bg-muted/30">
            <input type="file" multiple className="absolute inset-0 cursor-pointer opacity-0" onChange={e => e.target.files && Array.from(e.target.files).forEach(handleFile)} />
            {previews.length ? (
              <div className="flex gap-2 overflow-x-auto">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative">
                    <Image src={p} width={100} height={80} alt="preview" className="rounded" />
                    <Button size="icon" variant="destructive" onClick={() => removeImage(idx)} className="absolute top-0 right-0">X</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="mb-1 h-6 w-6" />
                <span className="text-sm text-muted-foreground">Drag & drop or click to upload images</span>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Question'}</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
