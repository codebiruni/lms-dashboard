'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type GetQuizSubmissionOptions = {
  page?: number
  limit?: number
  quizId?: string
  userId?: string
  deleted?: boolean
}

export type QuizSubmissionAnswer = {
  selectedOptions: string[]
  writtenAnswer?: string
  obtainedMarks: number
}

export type QuizSubmission = {
  _id: string
  quizId: {
    _id: string
    title?: string
  }
  userId: {
    _id: string
    name?: string
    email?: string
  }
  attemptNumber: number
  answers: QuizSubmissionAnswer[]
  totalMarks: number
  obtainedMarks: number
  isPassed: boolean
  submittedAt: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchQuizSubmissionResponse = {
  data: QuizSubmission[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchQuizSubmission({
  page = 1,
  limit = 10,
  quizId,
  userId,
  deleted = false,
}: GetQuizSubmissionOptions) {

  /* -------- Build query string dynamically -------- */

  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(quizId && { quizId }),
    ...(userId && { userId }),
    ...(deleted !== undefined && { deleted: String(deleted) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchQuizSubmissionResponse>({
    queryKey: ['quiz-submissions', page, limit, quizId, userId, deleted],

    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchQuizSubmissionResponse
      }>(`/v1/quiz-submission?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch quiz submissions')
      }

      return res.data
    },

    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    submissions: data?.data ?? [],
    meta: {
      page: data?.meta.page ?? page,
      limit: data?.meta.limit ?? limit,
      total: data?.meta.total ?? 0,
    },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
