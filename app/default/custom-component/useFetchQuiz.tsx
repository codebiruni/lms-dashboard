/* eslint-disable @typescript-eslint/no-explicit-any */
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
  sortBy?: 'createdAt' | 'totalMarks' | 'duration' | 'title'
  sortOrder?: 1 | -1
}

export type QuizQuestion = {
  _id?: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

export type Quiz = {
  _id: string
  courseId: { _id: string; title: string; slug?: string } | string
  sectionId?: { _id: string; title: string; course?: string } | string
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
  __v?: number
}

type FetchQuizResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
    }
    data: Quiz[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchQuiz({
  page = 1,
  limit = 10,
  search,
  courseId,
  sectionId,
  published,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = -1,
}: GetQuizOptions) {
  /* -------- Build query string dynamically -------- */
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortOrder: String(sortOrder),
    sortBy: sortBy,
  }

  if (search) params.search = search
  if (courseId) params.courseId = courseId
  if (sectionId) params.sectionId = sectionId
  if (published !== undefined) params.published = String(published)
  if (deleted !== undefined) params.deleted = String(deleted)

  const queryString = new URLSearchParams(params).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
    isSuccess,
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
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchQuizResponse>(`/v1/quez?${queryString}`)

        if (!res?.success) {
          throw new Error(res?.message || 'Failed to fetch quizzes')
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || 'Network error while fetching quizzes')
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  /* -------------------- Process and return data -------------------- */
  const quizzes = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
  }

  return {
    quizzes,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
    totalCount: meta.total,
    currentPage: meta.page,
    totalPages: Math.ceil(meta.total / meta.limit),
  }
}