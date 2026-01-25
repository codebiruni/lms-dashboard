'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchStaffsParams = {
  page?: number
  limit?: number
  search?: string
  deleted?: boolean
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
}

/* ---------- User (populated userId) ---------- */
export type StaffUser = {
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

/* -------------------- Staff -------------------- */
export type Staff = {
  _id: string
  id: string
  userId: StaffUser
  assignedLeads: {
    userId: string
    name: string
    description?: string
    isCompleted: boolean
  }[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

/* -------------------- API Response -------------------- */
type FetchStaffsResponse = {
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Staff[]
}

/* -------------------- Hook -------------------- */

export default function useFetchStaffs({
  page = 1,
  limit = 100,
  search,
  deleted = false,
  sortBy = 'createdAt',
  sortOrder = -1,
}: UseFetchStaffsParams = {}) {
  /* -------- Build query string -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),
    ...(search && { search }),
    ...(deleted !== undefined && { deleted: String(deleted) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchStaffsResponse>({
    queryKey: ['staffs', page, limit, search, deleted, sortBy, sortOrder],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchStaffsResponse
      }>(`/v1/staff?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch staffs')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    staffs: data?.data ?? [],
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
