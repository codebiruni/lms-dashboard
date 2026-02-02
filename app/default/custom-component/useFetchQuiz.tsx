'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type GetQuizOptions = {
  page?: number
  limit?: number
  search?: string
  courseId?: string
  sectionId?: string
  published?: boolean
  deleted?: boolean
  sortOrder?: 1 | -1
}

export type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

export type Quiz = {
  _id: string
  courseId: { _id: string; title?: string } | string
  sectionId?: { _id: string; title?: string } | string
  title: string
  description?: string
  totalMarks: number
  passMarks: number
  duration: number
  startTime?: string
  endTime?: string
  isPublished: boolean
  isDeleted: boolean
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

type FetchQuizResponse = {
  data: Quiz[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchQuiz({
  page = 1,
  limit = 100,
  search,
  courseId,
  sectionId,
  published,
  deleted = false,
  sortOrder = -1,
}: GetQuizOptions) {
  /* -------- Build query string dynamically -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortOrder: String(sortOrder),
    ...(search && { search }),
    ...(courseId && { courseId }),
    ...(sectionId && { sectionId }),
    ...(published !== undefined && { published: String(published) }),
    ...(deleted !== undefined && { deleted: String(deleted) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchQuizResponse>({
    queryKey: [
      'quizzes',
      page,
      limit,
      search,
      courseId,
      sectionId,
      published,
      deleted,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchQuizResponse
      }>(`/v1/quez?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch quizzes')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    quizzes: data?.data ?? [],
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
