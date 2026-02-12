/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, FileQuestion, X, CheckCircle, Award } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

import PATCHDATA from '@/app/default/functions/Patch'

/* -------------------- Types -------------------- */

interface Answer {
  selectedOptions: string[]
  writtenAnswer: string
  obtainedMarks: number
}

interface QuizSubmission {
  _id: string
  quizId: {
    _id: string
    title: string
    totalMarks: number
    passMarks: number
    questions?: Array<{
      question: string
      options: string[]
      correctAnswer: string
      marks: number
      _id: string
    }>
  }
  userId: {
    _id: string
    name: string
    email: string
  }
  attemptNumber: number
  answers: Answer[]
  totalMarks: number
  obtainedMarks: number
  isPassed: boolean
  isDeleted: boolean
  isEvaluated?: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
}

interface EditQuizSubmissionProps {
  submission: QuizSubmission
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/* -------------------- Component -------------------- */

export default function EditQuizSubmission({
  submission,
  open,
  onOpenChange,
  onSuccess
}: EditQuizSubmissionProps) {
  /* -------------------- STATE -------------------- */
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isPassed, setIsPassed] = useState(false)
  const [isEvaluated, setIsEvaluated] = useState(true)
  const [totalMarks, setTotalMarks] = useState(0)
  const [obtainedMarks, setObtainedMarks] = useState(0)
  const [loading, setLoading] = useState(false)

  /* -------------------- LOAD SUBMISSION DATA -------------------- */
  useEffect(() => {
    if (submission && open) {
      setAnswers(submission.answers || [])
      setIsPassed(submission.isPassed || false)
      setIsEvaluated(submission.isEvaluated !== false)
      setTotalMarks(submission.totalMarks || 0)
      setObtainedMarks(submission.obtainedMarks || 0)
    }
  }, [submission, open])

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setAnswers([])
    setIsPassed(false)
    setIsEvaluated(true)
    setTotalMarks(0)
    setObtainedMarks(0)
  }

  /* -------------------- HANDLERS -------------------- */
  const handleMarksChange = (index: number, value: number) => {
    const updatedAnswers = [...answers]
    updatedAnswers[index].obtainedMarks = value
    setAnswers(updatedAnswers)
    
    // Recalculate total obtained marks
    const total = updatedAnswers.reduce((sum, ans) => sum + (ans.obtainedMarks || 0), 0)
    setObtainedMarks(total)
    
    // Auto-determine if passed based on pass marks
    if (submission.quizId?.passMarks) {
      setIsPassed(total >= submission.quizId.passMarks)
    }
  }

  const handleIsPassedChange = (checked: boolean) => {
    setIsPassed(checked)
  }

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!submission) return

    try {
      setLoading(true)

      // Validate marks don't exceed question marks
      if (submission.quizId?.questions) {
        for (let i = 0; i < answers.length; i++) {
          const questionMarks = submission.quizId.questions[i]?.marks || 0
          if (answers[i].obtainedMarks > questionMarks) {
            toast.error(`Question ${i + 1} marks cannot exceed ${questionMarks}`)
            return
          }
          if (answers[i].obtainedMarks < 0) {
            toast.error(`Question ${i + 1} marks cannot be negative`)
            return
          }
        }
      }

      const payload = {
        answers,
        obtainedMarks,
        isPassed,
        isEvaluated,
      }

      const res = await PATCHDATA(`/v1/quiz-submission/${submission._id}`, payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to update submission')
      }

      toast.success('Quiz submission updated successfully')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update submission')
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
          <Card className="w-full max-w-3xl rounded-lg shadow-lg border">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" />
                  Evaluate Quiz Submission
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Quiz:</p>
                  <p className="font-medium">{submission.quizId?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student:</p>
                  <p className="font-medium">{submission.userId?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attempt:</p>
                  <Badge variant="outline">#{submission.attemptNumber}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted:</p>
                  <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Total Marks</div>
                  <div className="text-2xl font-bold">{submission.totalMarks}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Pass Marks</div>
                  <div className="text-2xl font-bold">{submission.quizId?.passMarks || 0}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Obtained Marks</div>
                  <div className="text-2xl font-bold">{obtainedMarks}</div>
                </div>
              </div>

              {/* Pass/Fail Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isPassed" className="text-base font-medium">
                    Exam Result
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as passed or failed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isPassed ? 'default' : 'destructive'} className={isPassed ? 'bg-green-600' : ''}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </Badge>
                  <Switch
                    id="isPassed"
                    checked={isPassed}
                    onCheckedChange={handleIsPassedChange}
                  />
                </div>
              </div>

              {/* Evaluation Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isEvaluated" className="text-base font-medium">
                    Evaluation Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as evaluated/unevaluated
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isEvaluated ? 'default' : 'secondary'}>
                    {isEvaluated ? 'Evaluated' : 'Pending'}
                  </Badge>
                  <Switch
                    id="isEvaluated"
                    checked={isEvaluated}
                    onCheckedChange={setIsEvaluated}
                  />
                </div>
              </div>

              {/* Questions & Answers */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Question Evaluation
                </h3>
                
                {answers.map((answer, idx) => {
                  const question = submission.quizId?.questions?.[idx]
                  const maxMarks = question?.marks || 0
                  
                  return (
                    <div key={idx} className="border rounded-lg p-4 mb-4 bg-muted/10">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">
                          Question {idx + 1}: {question?.question || `Question ${idx + 1}`}
                        </h4>
                        <Badge variant="outline">{maxMarks} marks</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Student Answer:</p>
                          <div className="p-2 bg-muted/30 rounded text-sm">
                            {answer.selectedOptions?.length > 0 
                              ? answer.selectedOptions.join(', ') 
                              : answer.writtenAnswer || 'No answer provided'}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Correct Answer:</p>
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-sm">
                            {question?.correctAnswer || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <Label htmlFor={`marks-${idx}`}>Marks Obtained</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              id={`marks-${idx}`}
                              type="number"
                              value={answer.obtainedMarks || 0}
                              onChange={(e) => handleMarksChange(idx, Number(e.target.value))}
                              min={0}
                              max={maxMarks}
                              step={0.5}
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">
                              / {maxMarks}
                            </span>
                          </div>
                        </div>
                        
                        {answer.obtainedMarks === maxMarks && (
                          <Badge className="bg-green-600">
                            <CheckCircle size={12} className="mr-1" />
                            Full Marks
                          </Badge>
                        )}
                        
                        {answer.obtainedMarks === 0 && answer.obtainedMarks !== undefined && (
                          <Badge variant="destructive">No Marks</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
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
                      <Award className="mr-2 h-4 w-4" />
                      Update Evaluation
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}