/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import GETDATA from "../functions/GetData"

/* -------------------- Types -------------------- */

type UseFetchAttendanceParams = {
  page?: number
  limit?: number
  courseId?: string
  liveClassId?: string
  studentId?: string
  status?: string
  isDeleted?: boolean
  search?: string
  sortBy?: 'createdAt' | 'joinedAt'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export type Attendance = {
  _id: string
  courseId: {
    _id: string
    title: string
    slug?: string
  }
  liveClassId: {
    _id: string
    title: string
    startTime: string
    endTime: string
    meetingPlatform?: string
  }
  studentId: {
    _id: string
    id: string
    userId?: {
      name: string
      email: string
    }
  }
  status: 'present' | 'absent' | 'late'
  joinedAt?: string
  leftAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

type FetchAttendanceResponse = {
  success: boolean
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    data: Attendance[]
  }
}

/* -------------------- Hook -------------------- */

export default function useFetchAttendance({
  page = 1,
  limit = 10,
  courseId,
  liveClassId,
  studentId,
  status,
  isDeleted = false,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  startDate,
  endDate,
}: UseFetchAttendanceParams) {

  // Build query string dynamically
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  }

  if (courseId) params.courseId = courseId
  if (liveClassId) params.liveClassId = liveClassId
  if (studentId) params.studentId = studentId
  if (status) params.status = status
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
  } = useQuery<FetchAttendanceResponse>({
    queryKey: [
      "attendances",
      page,
      limit,
      courseId,
      liveClassId,
      studentId,
      status,
      isDeleted,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      try {
        const res = await GETDATA<FetchAttendanceResponse>(
          `/v1/attendance?${queryString}`
        )

        if (!res?.success) {
          throw new Error(res?.message || "Failed to fetch attendance records")
        }

        return res
      } catch (error: any) {
        throw new Error(error?.message || "Network error while fetching attendance records")
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Process and return data
  const attendances = data?.data?.data ?? []
  const meta = data?.data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats
  const presentCount = attendances.filter((a: Attendance) => a.status === 'present').length
  const absentCount = attendances.filter((a: Attendance) => a.status === 'absent').length
  const lateCount = attendances.filter((a: Attendance) => a.status === 'late').length
  const totalDuration = attendances.reduce((acc: number, a: Attendance) => {
    if (a.joinedAt && a.leftAt) {
      const join = new Date(a.joinedAt).getTime()
      const left = new Date(a.leftAt).getTime()
      return acc + (left - join) / 60000
    }
    return acc
  }, 0)

  return {
    attendances,
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
      presentCount,
      absentCount,
      lateCount,
      totalDuration,
      averageDuration: attendances.length > 0 ? totalDuration / attendances.length : 0,
      deletedCount: attendances.filter((a: Attendance) => a.isDeleted).length,
    },
  }
}