/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

type UseFetchQuestionParams = {
  page?: number
  limit?: number
  search?: string
  courseId?: string
  courseSection?: string
  deleted?: boolean
  sortOrder?: number
}

type Question = {
  _id: string
  title: string
  description?: string
  courseId: any
  passMarks: number
  totalMarks: number
  images?: any
  courseSection: any
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchQuestionResponse = {
  data: Question[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export default function useFetchQuestion({
  page = 1,
  limit = 20,
  search = "",
  courseId,
  courseSection,
  deleted = false,
  sortOrder = 1,
}: UseFetchQuestionParams) {

  // Construct query string
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    sortOrder: String(sortOrder),
    ...(search && { search }),
    ...(courseId && { courseId }),
    ...(courseSection && { courseSection }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchQuestionResponse>({
      queryKey: [
        "questions",
        page,
        limit,
        search,
        courseId,
        courseSection,
        deleted,
        sortOrder,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchQuestionResponse
        }>(`/v1/question?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || "Failed to fetch questions")
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

    console.log(data)

  return {
    questions: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
