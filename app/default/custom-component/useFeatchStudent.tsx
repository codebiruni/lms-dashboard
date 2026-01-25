'use client'

import { useQuery } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchStudentsParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
}

export type Student = {
  _id: string
  id: string
  bio?: string
  userId?: {
    _id: string
    name: string
    email?: string
    image?: string
  }
  enrolledCourses?: {
    name: string
    enrollData: string
    amount: number
    paid: number
    left: number
    coursId: string
  }[]
  certificates?: {
    name: string
    date: string
    link: string
  }[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchStudentsResponse = {
  data: Student[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchStudents({
  page = 1,
  limit = 10,
  search,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = -1,
}: UseFetchStudentsParams) {
  // Build query string dynamically
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
    ...(search ? { search } : {}),
    ...(deleted !== undefined ? { deleted: String(deleted) } : {}),
  }).toString()

  const { data, isLoading, error, refetch } = useQuery<FetchStudentsResponse>({
    queryKey: ['Students', page, limit, search, deleted, sortBy, sortOrder],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchStudentsResponse
      }>(`/v1/student?${queryString}`)

      if (!res.success) throw new Error(res.message || 'Failed to fetch students')
      return res.data
    },
    placeholderData: (previousData) => previousData,
  })

  return {
    Students: data?.data ?? [],
    meta: data?.meta ?? { page, limit, total: 0 },
    isLoading,
    error,
    refetch,
  }
}
