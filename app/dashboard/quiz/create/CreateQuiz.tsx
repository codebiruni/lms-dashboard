/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

import POSTDATA from '@/app/default/functions/Post'
import useFetchCourses from '@/app/default/custom-component/useFeatchCourse'
import useFetchCourseSections from '@/app/default/custom-component/useCouesSection'

/* -------------------- QUESTION TYPE -------------------- */
interface QuestionType {
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

export default function CreateQuiz() {
  const router = useRouter()

  /* -------------------- QUIZ FIELDS (SAME AS MODEL) -------------------- */
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
  const [questions, setQuestions] = useState<QuestionType[]>([
    {
      question: '',
      options: ['', ''],
      correctAnswer: '',
      marks: 1,
    },
  ])

  /* -------------------- FETCH DATA -------------------- */
  const { courses } = useFetchCourses({ limit: 100 })
  const { courseSections } = useFetchCourseSections({
    course: courseId,
    limit: 100,
  })

  useEffect(() => {
    setSectionId(undefined)
  }, [courseId])

  /* -------------------- QUESTION HANDLERS -------------------- */
  const updateQuestionField = (
    qIndex: number,
    field: keyof QuestionType,
    value: any
  ) => {
    const updated = [...questions]
    updated[qIndex] = { ...updated[qIndex], [field]: value }
    setQuestions(updated)
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

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', ''], correctAnswer: '', marks: 1 },
    ])
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    const payload = {
      courseId,
      sectionId,
      title,
      description,
      duration,
      totalMarks,
      passMarks,
      isPublished,

      // 👇 THIS NAME MATCHES MODEL
      questions,
    }

    console.log('SEND TO BACKEND 👇', payload)

    try {
      setLoading(true)

      const res = await POSTDATA('/v1/quez', payload)

      if (!res.success) throw new Error(res.message)

      toast.success('Quiz created successfully')
      router.push('/dashboard/quiz')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Create Exam Quiz</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* COURSE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>courseId</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c: any) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>sectionId</Label>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {courseSections.map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* QUIZ INFO */}
        <div>
          <Label>title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <Label>description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>duration (minutes)</Label>
            <Input type="number" value={duration} onChange={e => setDuration(+e.target.value)} />
          </div>

          <div>
            <Label>totalMarks</Label>
            <Input type="number" value={totalMarks} onChange={e => setTotalMarks(+e.target.value)} />
          </div>

          <div>
            <Label>passMarks</Label>
            <Input type="number" value={passMarks} onChange={e => setPassMarks(+e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <Label>isPublished</Label>
        </div>

        {/* QUESTIONS */}
        {questions.map((q, qi) => (
          <Card key={qi} className="p-4 space-y-3 border">
            <Label>questions[{qi}].question</Label>
            <Textarea
              value={q.question}
              onChange={e => updateQuestionField(qi, 'question', e.target.value)}
            />

            {q.options.map((opt, oi) => (
              <div key={oi} className="flex gap-2">
                <Input
                  placeholder={`options[${oi}]`}
                  value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                />
                <Button
                  variant={q.correctAnswer === opt ? 'default' : 'outline'}
                  onClick={() =>
                    updateQuestionField(qi, 'correctAnswer', opt)
                  }
                >
                  Correct
                </Button>
              </div>
            ))}

            <Button size="sm" onClick={() => addOption(qi)}>
              Add Option
            </Button>

            <Label>questions[{qi}].marks</Label>
            <Input
              type="number"
              value={q.marks}
              onChange={e => updateQuestionField(qi, 'marks', +e.target.value)}
            />
          </Card>
        ))}

        <Button onClick={addQuestion}>Add Question</Button>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Quiz'}
        </Button>
      </CardContent>
    </Card>
  )
}
