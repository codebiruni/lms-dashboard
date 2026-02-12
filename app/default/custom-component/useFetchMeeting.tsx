/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchMeetingParams = {
  page?: number
  limit?: number
  status?: string
  platform?: string
  isDeleted?: boolean
  search?: string
  sortBy?: 'startTime' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export type Meeting = {
  _id: string
  platform: 'google-meet' | 'zoom' | 'teams' | 'other'
  meetingId?: string
  meetingLink: string
  passcode?: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchMeetingResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Meeting[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchMeeting({
  page = 1,
  limit = 10,
  status,
  platform,
  isDeleted = false,
  search,
  sortBy = 'startTime',
  sortOrder = 'desc',
  startDate,
  endDate,
}: UseFetchMeetingParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (status) params.status = status
  if (platform) params.platform = platform
  if (isDeleted !== undefined) params.isDeleted = String(isDeleted)
  if (search) params.search = search
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
  } = useQuery<FetchMeetingResponse>({
    queryKey: [
      "meetings",
      page,
      limit,
      status,
      platform,
      isDeleted,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchMeetingResponse>(
          `/v1/meeting?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch meetings")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching meetings")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const meetings = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const now = new Date()
  const scheduledCount = meetings.filter((m: Meeting) => 
    !m.isDeleted && m.status === 'scheduled' && new Date(m.startTime) > now
  ).length
  
  const ongoingCount = meetings.filter((m: Meeting) => {
    const start = new Date(m.startTime)
    const end = new Date(m.endTime)
    return !m.isDeleted && m.status === 'ongoing' && start <= now && end >= now
  }).length
  
  const endedCount = meetings.filter((m: Meeting) => 
    !m.isDeleted && m.status === 'ended'
  ).length
  
  const cancelledCount = meetings.filter((m: Meeting) => 
    !m.isDeleted && m.status === 'cancelled'
  ).length

  return {
    meetings,
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
      scheduledCount,
      ongoingCount,
      endedCount,
      cancelledCount,
      deletedCount: meetings.filter((m: Meeting) => m.isDeleted).length,
    },
  }
}