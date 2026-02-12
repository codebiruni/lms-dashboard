/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type GetQuizSubmissionOptions = {
  page?: number
  limit?: number
  quizId?: string
  userId?: string
  courseId?: string
  sectionId?: string
  isPassed?: boolean
  deleted?: boolean
  sortBy?: 'submittedAt' | 'obtainedMarks' | 'attemptNumber' | 'createdAt'
  sortOrder?: 1 | -1
  search?: string
}

export type QuizSubmissionAnswer = {
  selectedOptions: string[]
  writtenAnswer?: string
  obtainedMarks: number
}

export type Quiz = {
  _id: string
  title: string
  totalMarks: number
  passMarks: number
  duration: number
  questions?: Array<{
    question: string
    options: string[]
    correctAnswer: string
    marks: number
    _id: string
  }>
}

export type User = {
  _id: string
  name: string
  email: string
  id?: string
  image?: string
}

export type QuizSubmission = {
  _id: string
  quizId: Quiz | string
  userId: User | string
  attemptNumber: number
  answers: QuizSubmissionAnswer[]
  totalMarks: number
  obtainedMarks: number
  isPassed: boolean
  isEvaluated?: boolean
  isDeleted: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchQuizSubmissionResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: QuizSubmission[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchQuizSubmission({
  page = 1,
  limit = 10,
  quizId,
  userId,
  courseId,
  sectionId,
  isPassed,
  deleted = false,
  sortBy = 'submittedAt',
  sortOrder = -1,
  search,
}: GetQuizSubmissionOptions) {

  /* -------- Build query string dynamically -------- */
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
  }

  if (quizId) params.quizId = quizId
  if (userId) params.userId = userId
  if (courseId) params.courseId = courseId
  if (sectionId) params.sectionId = sectionId
  if (isPassed !== undefined) params.isPassed = String(isPassed)
  if (deleted !== undefined) params.deleted = String(deleted)
  if (search) params.search = search

  const queryString = new URLSearchParams(params).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
    isSuccess,
    isPlaceholderData,
  } = useQuery<FetchQuizSubmissionResponse>({
    queryKey: [
      'quiz-submissions',
      page,
      limit,
      quizId,
      userId,
      courseId,
      sectionId,
      isPassed,
      deleted,
      sortBy,
      sortOrder,
      search,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchQuizSubmissionResponse>(
          `/v1/quiz-submission?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to fetch quiz submissions')
        }

        return res
      } catch (error: any) {
        throw new Error(
          error?.message || 'Network error while fetching quiz submissions'
        )
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  /* -------------------- Process and return data -------------------- */
  const submissions = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate additional stats
  const passedCount = submissions.filter((s: QuizSubmission) => s.isPassed).length
  const failedCount = submissions.length - passedCount
  const averageScore = submissions.length > 0
    ? Math.round(
        submissions.reduce((acc: number, s: QuizSubmission) => acc + s.obtainedMarks, 0) /
          submissions.length
      )
    : 0

  return {
    submissions,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
    isPlaceholderData,
    refetch,
    totalCount: meta.total,
    currentPage: meta.page,
    totalPages: meta.totalPages,
    pageSize: meta.limit,
    stats: {
      passedCount,
      failedCount,
      averageScore,
      submissionRate: meta.total > 0 ? Math.round((submissions.length / meta.total) * 100) : 0,
    },
  }
}