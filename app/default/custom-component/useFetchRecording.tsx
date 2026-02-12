/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchRecordingParams = {
  page?: number
  limit?: number
  courseId?: string
  liveClassId?: string
  meetingId?: string
  uploadedBy?: string
  isDeleted?: boolean
  search?: string
  sortBy?: 'createdAt' | 'duration' | 'size' | 'title'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export type Recording = {
  _id: string
  courseId: {
    _id: string
    title: string
    slug?: string
    thumbnail?: string
  }
  liveClassId?: any
  meetingId?: any
  uploadedBy: {
    _id: string
    id?: string
    name: string
    email: string
    role: string
    image?: string
  }
  title: string
  description?: string
  videoUrl: string
  duration?: number
  size?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchRecordingResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Recording[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchRecording({
  page = 1,
  limit = 10,
  courseId,
  liveClassId,
  meetingId,
  uploadedBy,
  isDeleted = false,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  startDate,
  endDate,
}: UseFetchRecordingParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (courseId) params.courseId = courseId
  if (liveClassId) params.liveClassId = liveClassId
  if (meetingId) params.meetingId = meetingId
  if (uploadedBy) params.uploadedBy = uploadedBy
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
  } = useQuery<FetchRecordingResponse>({
    queryKey: [
      "recordings",
      page,
      limit,
      courseId,
      liveClassId,
      meetingId,
      uploadedBy,
      isDeleted,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchRecordingResponse>(
          `/v1/recording?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch recordings")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching recordings")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const recordings = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const totalDuration = recordings.reduce((acc: number, r: Recording) => acc + (r.duration || 0), 0)
  const totalSize = recordings.reduce((acc: number, r: Recording) => acc + (r.size || 0), 0)

  return {
    recordings,
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
      totalDuration,
      totalSize,
      averageDuration: recordings.length > 0 ? totalDuration / recordings.length : 0,
      averageSize: recordings.length > 0 ? totalSize / recordings.length : 0,
      deletedCount: recordings.filter((r: Recording) => r.isDeleted).length,
    },
  }
}