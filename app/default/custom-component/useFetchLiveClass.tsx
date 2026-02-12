/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchLiveClassParams = {
  page?: number
  limit?: number
  searchTerm?: string
  meetingPlatform?: string
  isDeleted?: boolean
  isCancelled?: boolean
  sortByTime?: "asc" | "desc"
  courseId?: string
  sectionId?: string
  instructorId?: string
  startDate?: string
  endDate?: string
}

export type LiveClass = {
  _id: string
  courseId: {
    _id: string
    title: string
    slug?: string
  }
  sectionId?: {
    _id: string
    title: string
  }
  instructorId: {
    _id: string
    id?: string
    userId?: {
      name: string
      email: string
    }
  }
  title: string
  description?: string
  meetingLink?: string
  meetingPlatform: 'google-meet' | 'zoom' | 'other'
  startTime: string
  endTime: string
  isRecorded: boolean
  recordingUrl?: string
  isCancelled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type FetchLiveClassResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: LiveClass[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchLiveClass({
  page = 1,
  limit = 10,
  searchTerm = "",
  meetingPlatform,
  isDeleted = false,
  isCancelled,
  sortByTime,
  courseId,
  sectionId,
  instructorId,
  startDate,
  endDate,
}: UseFetchLiveClassParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  }

  if (searchTerm) params.searchTerm = searchTerm
  if (meetingPlatform) params.meetingPlatform = meetingPlatform
  if (isDeleted !== undefined) params.isDeleted = String(isDeleted)
  if (isCancelled !== undefined) params.isCancelled = String(isCancelled)
  if (sortByTime) params.sortByTime = sortByTime
  if (courseId) params.courseId = courseId
  if (sectionId) params.sectionId = sectionId
  if (instructorId) params.instructorId = instructorId
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
  } = useQuery<FetchLiveClassResponse>({
    queryKey: [
      "liveClasses",
      page,
      limit,
      searchTerm,
      meetingPlatform,
      isDeleted,
      isCancelled,
      sortByTime,
      courseId,
      sectionId,
      instructorId,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchLiveClassResponse>(
          `/v1/live-class?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch live classes")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching live classes")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const liveClasses = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate upcoming and past counts
  const now = new Date()
  const upcomingCount = liveClasses.filter((c: LiveClass) => 
    !c.isDeleted && !c.isCancelled && new Date(c.startTime) > now
  ).length
  
  const liveNowCount = liveClasses.filter((c: LiveClass) => {
    const start = new Date(c.startTime)
    const end = new Date(c.endTime)
    return !c.isDeleted && !c.isCancelled && start <= now && end >= now
  }).length
  
  const endedCount = liveClasses.filter((c: LiveClass) => 
    !c.isDeleted && !c.isCancelled && new Date(c.endTime) < now
  ).length

  return {
    liveClasses,
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
      liveNowCount,
      endedCount,
      cancelledCount: liveClasses.filter((c: LiveClass) => c.isCancelled).length,
      deletedCount: liveClasses.filter((c: LiveClass) => c.isDeleted).length,
    },
  }
}