/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import POSTDATA from '@/app/default/functions/Post'
import useFetchQuiz, { Quiz } from '@/app/default/custom-component/useFetchQuiz'

/* -------------------- COMPONENT -------------------- */

export default function CreateQuizSubmission() {
  const router = useRouter()

  /* -------------------- FETCH QUIZZES -------------------- */
  const { quizzes, isLoading } = useFetchQuiz({
    published: true,
    deleted: false,
    limit: 50,
  })

  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)

  /* -------------------- DERIVED QUIZ -------------------- */
  const quiz: Quiz | undefined = useMemo(
    () => quizzes.find((q) => q._id === selectedQuizId),
    [quizzes, selectedQuizId]
  )

  /* -------------------- HANDLERS -------------------- */

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId)
    setAnswers({}) // reset answers on quiz change
  }

  const handleChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }))
  }

  /* -------------------- VALIDATION -------------------- */

  const unansweredCount = useMemo(() => {
    if (!quiz) return 0
    return quiz.questions.filter(
      (_, idx) => !answers[idx]
    ).length
  }, [quiz, answers])

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!quiz) {
      toast.error('Please select a quiz')
      return
    }

    if (unansweredCount > 0) {
      toast.error('Please answer all questions')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        quizId: quiz._id,
        answers: quiz.questions.map((q, idx) => ({
          question: q.question,
          selectedOption: answers[idx],
        })),
      }


      const res = await POSTDATA('/v1/quiz-submission', payload)

      console.log(res)
      if (!res.success) {
        throw new Error(res.message || 'Submission failed')
      }

      toast.success(
        res.data?.isPassed
          ? '🎉 You passed the exam'
          : '❌ Exam submitted. You did not pass'
      )

      router.push('/dashboard/quiz')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* -------------------- LOADING -------------------- */

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      {/* -------------------- QUIZ SELECT -------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Select Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSelectQuiz}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map((q) => (
                <SelectItem key={q._id} value={q._id}>
                  {q.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* -------------------- QUIZ PAPER -------------------- */}
      {quiz && (
        <>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {quiz.title}
              </CardTitle>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <p>Total Marks: {quiz.totalMarks}</p>
                <p>Pass Marks: {quiz.passMarks}</p>
                <p>Duration: {quiz.duration} minutes</p>
                <p>Total Questions: {quiz.questions.length}</p>
              </div>

              {quiz.description && (
                <p className="mt-4 border-t pt-4 text-sm">
                  {quiz.description}
                </p>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="pt-8 space-y-10">
              {quiz.questions.map((q, index) => (
                <div
                  key={index}
                  className="border-b pb-8 last:border-none space-y-4"
                >
                  <Label className="font-semibold">
                    {index + 1}. {q.question}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({q.marks} marks)
                    </span>
                  </Label>

                  <RadioGroup
                    value={answers[index] || ''}
                    onValueChange={(val) =>
                      handleChange(index, val)
                    }
                    className="space-y-3"
                  >
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 rounded border p-3 hover:bg-muted/40"
                      >
                        <RadioGroupItem
                          value={opt}
                          id={`${index}-${idx}`}
                        />
                        <Label
                          htmlFor={`${index}-${idx}`}
                          className="cursor-pointer"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* -------------------- ACTIONS -------------------- */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Unanswered: {unansweredCount}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
