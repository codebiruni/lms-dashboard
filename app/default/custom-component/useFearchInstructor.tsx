'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchInstructorsParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  sortBy?: 'joinDate' | 'selery'
  sortOrder?: 1 | -1
}

/* ---------- User (populated userId) ---------- */
export type InstructorUser = {
  _id: string
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  image?: string
  status: string
  isVerified: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

/* -------------------- Instructor -------------------- */
export type Instructor = {
  _id: string
  id: string
  userId: InstructorUser
  bio?: string
  expertise?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  joinDate: string
  selery?: number
  totalStudents?: number
  totalCourses?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

/* -------------------- API Response -------------------- */
type FetchInstructorsResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Instructor[]
}

/* -------------------- Hook -------------------- */

export default function useFetchInstructors({
  page = 1,
  limit = 10,
  search,
  approvalStatus,
  deleted = false,
  sortBy = 'joinDate',
  sortOrder = -1,
}: UseFetchInstructorsParams = {}) {
  /* -------- Build query string (backend-safe) -------- */
  const queryParams: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
    deleted: String(deleted),
  }

  if (search) queryParams.search = search
  if (approvalStatus) queryParams.approvalStatus = approvalStatus

  const queryString = new URLSearchParams(queryParams).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchInstructorsResponse>({
    queryKey: [
      'instructors',
      page,
      limit,
      search,
      approvalStatus,
      deleted,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchInstructorsResponse
      }>(`/v1/instructor?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch instructors')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    instructors: data?.data ?? [],
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
