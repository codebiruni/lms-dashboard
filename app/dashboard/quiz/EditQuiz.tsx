/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, FileQuestion, X, Plus, Trash2, CheckCircle } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import PATCHDATA from '@/app/default/functions/Patch'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'

/* -------------------- QUESTION TYPE -------------------- */
interface QuestionType {
  _id?: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

interface EditQuizProps {
  quiz: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditQuiz({ quiz, open, onOpenChange, onSuccess }: EditQuizProps) {
  /* -------------------- QUIZ FIELDS -------------------- */
  const [courseId, setCourseId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState<number>(30)
  const [totalMarks, setTotalMarks] = useState<number>(0)
  const [passMarks, setPassMarks] = useState<number>(0)
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  /* -------------------- QUESTIONS -------------------- */
  const [questions, setQuestions] = useState<QuestionType[]>([])

  /* -------------------- FETCH DATA -------------------- */
  const { courses, isLoading: coursesLoading } = useFetchCourses({ limit: 100 })
  const { courseSections, isLoading: sectionsLoading } = useFetchCourseSections({
    course: courseId,
    limit: 100,
  })

  /* -------------------- LOAD QUIZ DATA -------------------- */
  useEffect(() => {
    if (quiz && open) {
      setCourseId(quiz.courseId?._id || '')
      setSectionId(quiz.sectionId?._id || '')
      setTitle(quiz.title || '')
      setDescription(quiz.description || '')
      setDuration(quiz.duration || 30)
      setTotalMarks(quiz.totalMarks || 0)
      setPassMarks(quiz.passMarks || 0)
      setIsPublished(quiz.isPublished || false)
      setQuestions(quiz.questions || [])
    }
  }, [quiz, open])

  /* -------------------- RESET DEPENDENCIES -------------------- */
  useEffect(() => {
    if (open) {
      if (!courseId) {
        setSectionId(undefined)
      }
    }
  }, [courseId, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setCourseId('')
    setSectionId(undefined)
    setTitle('')
    setDescription('')
    setDuration(30)
    setTotalMarks(0)
    setPassMarks(0)
    setIsPublished(false)
    setQuestions([])
  }

  /* -------------------- QUESTION HANDLERS -------------------- */
  const updateQuestionField = (
    qIndex: number,
    field: keyof QuestionType,
    value: any
  ) => {
    const updated = [...questions]
    updated[qIndex] = { ...updated[qIndex], [field]: value }
    setQuestions(updated)
    calculateTotalMarks(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const addOption = (qIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.push('')
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.splice(oIndex, 1)
    
    // If correct answer was removed, reset it
    if (updated[qIndex].correctAnswer === questions[qIndex].options[oIndex]) {
      updated[qIndex].correctAnswer = ''
    }
    setQuestions(updated)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', ''], correctAnswer: '', marks: 1 },
    ])
  }

  const removeQuestion = (qIndex: number) => {
    const updated = questions.filter((_, i) => i !== qIndex)
    setQuestions(updated)
    calculateTotalMarks(updated)
  }

  const calculateTotalMarks = (ques: QuestionType[]) => {
    const total = ques.reduce((sum, q) => sum + (q.marks || 0), 0)
    setTotalMarks(total)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!courseId || !title || !duration || !totalMarks || !passMarks) {
      toast.error('Course, title, duration, total marks and pass marks are required')
      return
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question')
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question) {
        toast.error(`Question ${i + 1} is empty`)
        return
      }
      if (q.options.filter(opt => opt.trim() !== '').length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`)
        return
      }
      if (!q.correctAnswer) {
        toast.error(`Please select correct answer for question ${i + 1}`)
        return
      }
      if (!q.marks || q.marks <= 0) {
        toast.error(`Question ${i + 1} must have valid marks`)
        return
      }
    }

    try {
      setLoading(true)

      const payload = {
        courseId,
        sectionId: sectionId || null,
        title,
        description,
        duration,
        totalMarks,
        passMarks,
        isPublished,
        questions: questions.map(q => ({
          ...q,
          options: q.options.filter(opt => opt.trim() !== '')
        })),
      }

      const res = await PATCHDATA(`/v1/quez/${quiz._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update quiz')
      }

      toast.success('Quiz updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quiz')
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
          <Card className="w-full max-w-4xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" />
                  Edit Quiz
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updating: {quiz?.title}
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
                  {quiz?.courseId && (
                    <p className="text-xs text-muted-foreground">
                      Current: {quiz.courseId.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section (Optional)</Label>
                  <Select
                    value={sectionId}
                    onValueChange={setSectionId}
                    disabled={!courseId || sectionsLoading}
                  >
                    <SelectTrigger id="section">
                      <SelectValue placeholder={!courseId ? 'Select course first' : 'Select section'} />
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
                  {quiz?.sectionId && (
                    <p className="text-xs text-muted-foreground">
                      Current: {quiz.sectionId.title}
                    </p>
                  )}
                </div>
              </div>

              {/* QUIZ INFO */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quiz title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Quiz description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="required">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="required">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    min={0}
                    readOnly
                    className="bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from questions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passMarks" className="required">Pass Marks</Label>
                  <Input
                    id="passMarks"
                    type="number"
                    value={passMarks}
                    onChange={(e) => setPassMarks(Number(e.target.value))}
                    min={0}
                    max={totalMarks}
                  />
                  {passMarks > totalMarks && (
                    <p className="text-xs text-destructive">
                      Pass marks cannot exceed total marks
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="publish" className="text-base font-medium">
                    Publish Quiz
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible to students when published
                  </p>
                </div>
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              {/* QUESTIONS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Questions</Label>
                  <Badge variant="outline">{questions.length} questions</Badge>
                </div>

                {questions.map((q, qi) => (
                  <Card key={qi} className="p-4 space-y-3 border relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive"
                      onClick={() => removeQuestion(qi)}
                    >
                      <Trash2 size={16} />
                    </Button>

                    <div className="space-y-2">
                      <Label>Question {qi + 1}</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestionField(qi, 'question', e.target.value)}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <div className="flex-1 flex gap-2">
                            <div className="w-8 h-10 flex items-center justify-center bg-muted rounded-md">
                              <span className="text-sm font-medium">
                                {String.fromCharCode(65 + oi)}
                              </span>
                            </div>
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              value={opt}
                              onChange={(e) => updateOption(qi, oi, e.target.value)}
                              className="flex-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant={q.correctAnswer === opt ? 'default' : 'outline'}
                            size="icon"
                            className={q.correctAnswer === opt ? 'bg-green-600 hover:bg-green-700' : ''}
                            onClick={() => updateQuestionField(qi, 'correctAnswer', opt)}
                          >
                            <CheckCircle size={16} />
                          </Button>
                          {q.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeOption(qi, oi)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qi)}
                        className="mt-2"
                      >
                        <Plus size={14} className="mr-2" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Marks</Label>
                      <Input
                        type="number"
                        value={q.marks}
                        onChange={(e) => updateQuestionField(qi, 'marks', Number(e.target.value))}
                        min={1}
                        className="w-32"
                      />
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Question
                </Button>
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
                    <>
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Update Quiz
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