/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchCoursesParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  subCategory?: string
  instructor?: string
  level?: string
  status?: string
  deleted?: boolean
  sortBy?: 'createdAt' | 'price'
  sortOrder?: 1 | -1
}

export type Course = {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  discountPrice: number
  isFree: boolean
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  status: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string

  category: any
  subCategory?: any
  instructor: any
}

type FetchCoursesResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Course[]
}

/* -------------------- Hook -------------------- */

export default function useFetchCourses({
  page = 1,
  limit = 100,
  search,
  category,
  subCategory,
  instructor,
  level,
  status,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = -1,
}: UseFetchCoursesParams) {

  /* -------- Build query string -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
    deleted: String(deleted),

    ...(search && { search }),
    ...(category && { category }),
    ...(subCategory && { subCategory }),
    ...(instructor && { instructor }),
    ...(level && { level }),
    ...(status && { status }),
  }).toString()

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<FetchCoursesResponse>({
      queryKey: [
        'courses',
        page,
        limit,
        search,
        category,
        subCategory,
        instructor,
        level,
        status,
        deleted,
        sortBy,
        sortOrder,
      ],
      queryFn: async () => {
        const res = await GETDATA<{
          success: boolean
          message: string
          data: FetchCoursesResponse
        }>(`/v1/course?${queryString}`)

        if (!res.success) {
          throw new Error(res.message || 'Failed to fetch courses')
        }

        return res.data
      },
      placeholderData: keepPreviousData,
    })

  /* -------------------- Return -------------------- */

  return {
    courses: data?.data ?? [],
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
