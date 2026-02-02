'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchLessonsParams = {
  courseSection?: string
  search?: string
  page?: number
  limit?: number
  deleted?: boolean
  published?: boolean
  sortBy?: 'order' | 'createdAt'
  sortOrder?: 1 | -1
}

export type CourseSection = {
  _id: string
  title: string
  order: number
}

export type Lesson = {
  _id: string
  courseSection: CourseSection
  title: string
  description?: string
  lessonType: 'video' | 'document' | 'quiz'
  videoUrl?: string
  documentUrl?: string
  duration: number
  order: number
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchLessonsResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Lesson[]
}

/* -------------------- Hook -------------------- */

export default function useFetchLessons({
  courseSection,
  search,
  page = 1,
  limit = 10,
  deleted = false,
  published,
  sortBy = 'order',
  sortOrder = 1,
}: UseFetchLessonsParams) {
  /* -------- Build query string -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    sortBy,
    sortOrder: String(sortOrder),

    ...(courseSection && { courseSection }),
    ...(search && { search }),
    ...(published !== undefined && { published: String(published) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchLessonsResponse>({
    queryKey: [
      'Lessons',
      courseSection,
      search,
      page,
      limit,
      deleted,
      published,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchLessonsResponse
      }>(`/v1/lesson?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch lessons')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    lessons: data?.data ?? [],
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
