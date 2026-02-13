/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchQuestionParams = {
  page?: number
  limit?: number
  search?: string
  courseId?: string
  courseSection?: string
  deleted?: boolean
  sortOrder?: 1 | -1 | number
  type?: 'true-false' | 'written'
  minMarks?: number
  maxMarks?: number
}

export type Question = {
  _id: string
  courseId: {
    _id: string
    title: string
    slug?: string
  }
  courseSection?: {
    _id: string
    title: string
  }
  title: string
  description?: string
  type: 'true-false' | 'written'
  questions: Array<{
    question: string
    isTrue?: boolean
    marks: number
  }>
  images: string[]
  totalMarks: number
  passMarks: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchQuestionResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Question[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchQuestion({
  page = 1,
  limit = 20,
  search = "",
  courseId,
  courseSection,
  deleted = false,
  sortOrder = -1,
  type,
  minMarks,
  maxMarks,
}: UseFetchQuestionParams) {

  // Construct query string
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortOrder: String(sortOrder),
  }

  if (search) params.search = search
  if (courseId) params.courseId = courseId
  if (courseSection) params.courseSection = courseSection
  if (deleted !== undefined) params.deleted = String(deleted)
  if (type) params.type = type
  if (minMarks !== undefined) params.minMarks = String(minMarks)
  if (maxMarks !== undefined) params.maxMarks = String(maxMarks)

  const queryString = new URLSearchParams(params).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
    isSuccess,
    isPlaceholderData
  } = useQuery<FetchQuestionResponse>({
    queryKey: [
      "questions",
      page,
      limit,
      search,
      courseId,
      courseSection,
      deleted,
      sortOrder,
      type,
      minMarks,
      maxMarks,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchQuestionResponse>(
          `/v1/question?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch questions")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching questions")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const questions = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const totalQuestionsCount = questions.reduce((acc: number, q: Question) => acc + q.questions.length, 0)
  const averageMarks = questions.length > 0
    ? Math.round(questions.reduce((acc: number, q: Question) => acc + q.totalMarks, 0) / questions.length)
    : 0

  return {
    questions,
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
      totalQuestionsCount,
      averageMarks,
      writtenCount: questions.filter((q: Question) => q.type === 'written').length,
      trueFalseCount: questions.filter((q: Question) => q.type === 'true-false').length,
      deletedCount: questions.filter((q: Question) => q.isDeleted).length,
    },
  }
}