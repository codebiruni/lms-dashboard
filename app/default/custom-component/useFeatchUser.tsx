'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import GETDATA from '../functions/GetData'

/* -------------------- Types -------------------- */

export type UseFetchUsersParams = {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  verified?: boolean
  deleted?: boolean
  year?: number
  month?: number
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
}

export type User = {
  _id: string
  id: string
  name: string
  email?: string
  phone?: string
  image?: string
  role: string
  status: string
  isVerified: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchUsersResponse = {
  users: User[]
  total: number
  page: number
  limit: number
}

/* -------------------- Hook -------------------- */

export default function useFetchUsers({
  page = 1,
  limit = 100,
  search,
  role,
  status,
  verified,
  deleted,
  year,
  month,
  sortBy = 'createdAt',
  sortOrder = -1,
}: UseFetchUsersParams) {
  /* -------- Build query string dynamically -------- */
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder: String(sortOrder),

    ...(search && { search }),
    ...(role && { role }),
    ...(status && { status }),
    ...(verified !== undefined && { verified: String(verified) }),
    ...(deleted !== undefined && { deleted: String(deleted) }),
    ...(year !== undefined && { year: String(year) }),
    ...(month !== undefined && { month: String(month) }),
  }).toString()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FetchUsersResponse>({
    queryKey: [
      'users',
      page,
      limit,
      search,
      role,
      status,
      verified,
      deleted,
      year,
      month,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await GETDATA<{
        success: boolean
        message: string
        data: FetchUsersResponse
      }>(`/v1/user?${queryString}`)

      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch users')
      }

      return res.data
    },
    placeholderData: keepPreviousData,
  })

  /* -------------------- Return -------------------- */
  return {
    users: data?.users ?? [],
    meta: {
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      total: data?.total ?? 0,
    },
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
