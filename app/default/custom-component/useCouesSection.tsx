'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchCourseSectionsParams = {
  course?: string
  search?: string
  page?: number
  limit?: number
  deleted?: boolean
  published?: boolean
  sortBy?: 'order' | 'createdAt'
  sortOrder?: 1 | -1
}

export type Course = {
  _id: string
  title: string
}

export type CourseSection = {
  _id: string
  course: Course
  title: string
  description?: string
  order: number
  totalLessons: number
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchCourseSectionsResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: CourseSection[]
}

/* -------------------- Hook -------------------- */

export default function useFetchCourseSections({
  course,
  search,
  page = 1,
  limit = 10,
  deleted = false,
  published,
  sortBy = 'order',
  sortOrder = 1,
}: UseFetchCourseSectionsParams) {
  /* -------- Build query string -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    deleted: String(deleted),
    sortBy,
    sortOrder: String(sortOrder),

    ...(course && { course }),
    ...(search && { search }),
    ...(published !== undefined && { published: String(published) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchCourseSectionsResponse>({
    queryKey: [
      'CourseSections',
      course,
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
        data: FetchCourseSectionsResponse
      }>(`/v1/course-section?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch course sections')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    courseSections: data?.data ?? [],
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
