/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchFollowUpParams = {
  page?: number
  limit?: number
  search?: string
  courseId?: string
  userId?: string
  status?: string
  deleted?: boolean
  sortBy?: 'followUpDate' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export type FollowUp = {
  _id: string
  user: {
    _id: string
    id: string
    name: string
    email: string
    phone?: string
    role: string
    image?: string
    status: string
  }
  courseId?: {
    _id: string
    title: string
    slug?: string
  }
  note: string
  followUpDate: string
  status: 'requested' | 'approved' | 'will-try'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchFollowUpResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: FollowUp[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchFollowUp({
  page = 1,
  limit = 10,
  search = "",
  courseId,
  userId,
  status,
  deleted = false,
  sortBy = 'followUpDate',
  sortOrder = 'asc',
  startDate,
  endDate,
}: UseFetchFollowUpParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
    deleted: String(deleted),
  }

  if (search) params.search = search
  if (courseId) params.courseId = courseId
  if (userId) params.userId = userId
  if (status && status !== 'all') params.status = status
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

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
  } = useQuery<FetchFollowUpResponse>({
    queryKey: [
      "followUps",
      page,
      limit,
      search,
      courseId,
      userId,
      status,
      deleted,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchFollowUpResponse>(
          `/v1/follow-up?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch follow-ups")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching follow-ups")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const followUps = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const upcomingCount = followUps.filter((f: FollowUp) => 
    !f.isDeleted && new Date(f.followUpDate) > new Date()
  ).length

  const statusCounts = {
    requested: followUps.filter((f: FollowUp) => f.status === 'requested').length,
    approved: followUps.filter((f: FollowUp) => f.status === 'approved').length,
    willTry: followUps.filter((f: FollowUp) => f.status === 'will-try').length,
  }

  return {
    followUps,
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
      upcomingCount,
      statusCounts,
      deletedCount: followUps.filter((f: FollowUp) => f.isDeleted).length,
    },
  }
}